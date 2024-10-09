from os import name
import random
import string
from rest_framework.response import Response
from rest_framework import status

from Trinity_Project.azure_file_share import AzureFileShareClient
from Trinity_Project.utils import authenticate_jwt
from ..models import Project, Submittal, User
from ..serializers import SubmittalSerializer
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view
from azure.core.exceptions import ResourceExistsError, ResourceNotFoundError


@login_required
@api_view(['GET','POST'])
def submittal_list(request):
    
    if request.method == 'GET':
        submittals=Submittal.objects.all()
        serializer = SubmittalSerializer(submittals, many=True)
        return Response(serializer.data)
    
    if request.method == 'POST':
        branch = 'E'
        project_id = request.data['project']
        unique_id = ''.join(random.choices(string.digits, k=3))

        submittal_id = "SB" + "-" + branch + "-" + project_id + "-" + unique_id

        print(submittal_id)

        # If we have a collision, we will generate a new submittal ID
        # Shouldn't happen too often, if at all
        while Submittal.objects.filter(submittal_id=submittal_id).exists():
            print("Collision Detected, Generating New Submittal ID...")
            submittal_id = "S" + "-" + branch + "-" + project_id + "-" + ''.join(random.choices(string.digits, k=3))
            print("New Submittal ID: ", submittal_id)

        request.data['submittal_id'] = submittal_id

        serializer=SubmittalSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                folder = AzureFileShareClient()

                project_folder_location = serializer.validated_data['project'].project_id
                submittal_folder_location = serializer.validated_data['submittal_id']

                print(f"Project Folder Location: {project_folder_location}")
                print(f"Submittal Folder Location: {submittal_folder_location}")

                folder.create_sub_folder_directory(project_folder_location + "/Submittals", submittal_folder_location)

            except ResourceNotFoundError:
                return Response(data={"error": "Project Folder does not exist."}, status=status.HTTP_400_BAD_REQUEST)
            
            except ResourceExistsError:
                print("Submittal Folder already exists. Skipping...")
                #return Response(data={"error": "Submittal Folder already exists."}, status=status.HTTP_400_BAD_REQUEST)
            
            except Exception as e:
                print(f"An error occurred while creating the submittal: {e}")
                folder.delete_project_folder(project_folder_location)
                return Response(data={"error": "An error occurred while creating the submittal folders."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@login_required
@api_view(['GET','PUT','DELETE'])
def submittal_detail(request,submittal_id):
    user = request.user
    try:
        submittal=Submittal.objects.get(submittal_id=submittal_id)
    except Submittal.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = SubmittalSerializer(submittal)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        if len(request.data) == 1 and 'is_active' in request.data:
            submittal.is_active = request.data['is_active']
            submittal.save()
            serializer = SubmittalSerializer(submittal)
            return Response(data="Submittal closed successfully", status=status.HTTP_200_OK)
        else:
            serializer = SubmittalSerializer(submittal, data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        # TODO: Add auth check
        # Only allow deletion if the user is the creator of the submittal, a manager, or an admin
        
        try: 
            folder = AzureFileShareClient()

            project_folder_location = submittal.project.project_id

            print(f"Project Folder Location: {project_folder_location}")

            folder.delete_project_folder(project_folder_location + "/Submittals/" + submittal_id)
        except ResourceNotFoundError:
            print("Submittal folder does not exist.")
        except Exception as e:
            print(f"An error occurred while deleting the submittal: {e}")

        submittal.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
           

@login_required
@api_view(['GET'])
def submittal_by_assigned_to(request,assigned_to):
    user_obj = User.objects.get(email=assigned_to)
    try:
        submittals=Submittal.objects.filter(user=user_obj)
    except Submittal.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        if submittals.count() == 1:
            serializer = SubmittalSerializer(submittals.first())
        else:
            serializer = SubmittalSerializer(submittals,many=True)
        return Response(serializer.data)
    
@api_view(['GET'])
def submittal_creation_data(request):
    payload = authenticate_jwt(request)

    data_to_send = {}

    # Gets all active projects
    projects = Project.objects.filter(status='ACTIVE').values_list('project_id', 'project_name')
    data_to_send['projects'] = list(projects)

    # Gets lists of users (project managers and team members)
    # THIS ONE USES THE PRIMARY KEY (pk) AND NOT THE EMAIL
    users = User.objects.filter(role__in=['Manager', 'Administrator', 'Team Member'], is_active=True).values_list('pk', 'name')
    data_to_send['users'] = list(users)

    # Get list of client names
    client_names = Project.objects.values_list('client_name', flat=True).distinct() 
    data_to_send['client_names'] = list(client_names)

    return Response(data_to_send, status=status.HTTP_200_OK)

@login_required
@api_view(['GET'])
def submittal_by_project_id(request, project_id):
    try:
        submittals = Submittal.objects.filter(project__project_id=project_id)
    except Submittal.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        try:
            serializer = SubmittalSerializer(submittals, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
