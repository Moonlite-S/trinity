from os import name
import random
import string
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime,timezone, timedelta

from ..utils import authenticate_user, role_required
from ..azure_file_share import AzureFileShareClient
from ..models import Project, ProjectChangeLog, User
from ..serializers import ProjectSerializer, ProjectSerializerUserObjectVer
from django.contrib.auth.decorators import login_required
from rest_framework.exceptions import PermissionDenied

@role_required(allowed_roles=['Manager', 'Administrator', 'Team Member', 'Accountant'], allowed_methods=['GET', 'POST'])
def project_list(request):
    if request.method == 'GET':
        projects = Project.objects.all()
        serializer = ProjectSerializerUserObjectVer(projects, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        # getBranch() (This would get the first initial of the branch it was created in)
        # So far, it will just be E for Edinburg

        # Project ID generation
        branch = "E"
        current_date = request.data['start_date']
        unique_id = ''.join(random.choices(string.digits, k=3))

        project_id = branch + "-" + current_date + "-" + unique_id
        
        print("Project ID Created: ", project_id)

        # If we have a collision, we will generate a new project ID
        # Shouldn't happen too often, if at all
        while Project.objects.filter(project_id=project_id).exists():
            print("Collision Detected, Generating New Project ID...")
            project_id = branch + "-" + current_date + "-" + ''.join(random.choices(string.digits, k=3))
            print("New Project ID: ", project_id)

        request.data['project_id'] = project_id
        request.data['folder_location'] = project_id

        serializer = ProjectSerializer(data=request.data)
        folder = AzureFileShareClient()   
        
        if serializer.is_valid():
            try:
                manager = serializer.validated_data.pop('manager')
                manager_obj = User.objects.get(email=manager)

                # Template Creation (Gunna be a more indepth implementation later)
                if serializer.validated_data['template'] == '':
                    folder.create_empty_project_folder(serializer.validated_data['folder_location'])
                else:
                    folder.create_template_project_folder(serializer.validated_data['folder_location'], serializer.validated_data['template'])
                
                project = Project.objects.create(manager=manager_obj, **serializer.validated_data)

                return Response(ProjectSerializerUserObjectVer(project).data, status=status.HTTP_201_CREATED)
            
            except Exception as ex:
                print(f"An error occurred while creating the project: \n{ex}\n Deleting project...")
                
                folder.delete_project_folder(serializer.data['folder_location'])

                try:
                    Project.objects.get(project_id=serializer.data['project_id']).delete()

                except Exception as ex:
                    print(f"Error while deleting project (maybe already deleted): {ex}")

                return Response(serializer.errors, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@role_required(allowed_roles=['Manager', 'Administrator'], allowed_methods=['GET', 'PUT', 'DELETE'])
def project_detail(request, project_id):
    payload = authenticate_user(request) #this is used to check if your are login

    try:
        project=Project.objects.get(project_id=project_id)
    except Project.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    user = request.user

    if request.method == 'GET':
        serializer = ProjectSerializerUserObjectVer(project)
        return Response(serializer.data)

    elif request.method == 'PUT':
        # I don't send the folder location in the request data because it is not allowed to be changed
        folder_location = Project.objects.get(project_id=project_id).folder_location
        request.data['folder_location'] = folder_location

        serializer = ProjectSerializer(project, data=request.data)
        if serializer.is_valid():
            manager_obj = serializer.validated_data.pop('manager')
            manager = User.objects.get(email=manager_obj)
            serializer.validated_data['manager'] = manager
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        # Can only delete if you are the project manager or a superuser (Administrator)
        if project.manager.name != payload['name'] and not payload['is_superuser']:
            raise PermissionDenied("You do not have permission to delete this project.")
        
        try:
            folder = AzureFileShareClient()
            folder.delete_project_folder(project.folder_location)

            project.delete()

            return Response(status=status.HTTP_204_NO_CONTENT)
        
        except Exception as e:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@role_required(allowed_roles=['Manager', 'Administrator'], allowed_methods=['GET'])
def project_filter_by_manager(request, manager):

    try:
        project=Project.objects.filter(manager=manager)
    except Project.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        if project.count() == 1:
            serializer = ProjectSerializer(project.first())
        else:
            serializer = ProjectSerializer(project,many=True)
        return Response(serializer.data)

@role_required(allowed_roles=['Manager', 'Administrator'], allowed_methods=['GET'])
def project_filter_by_status(request, project_status):
    try:
        project=Project.objects.filter(status=project_status)
    except Project.DoesNotExist:
        return Response(http_status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        if project.count() == 1:
            serializer = ProjectSerializer(project.first())
        else:
            serializer = ProjectSerializer(project,many=True)
        return Response(serializer.data)

@role_required(allowed_roles=['Manager', 'Administrator'], allowed_methods=['GET'])
def project_by_date(request):
    
    year = request.GET.get('year')
    month = request.GET.get('month')
    
    if not year:
        return Response({"error": "Year is required."}, status=status.HTTP_400_BAD_REQUEST)
    
    elif not month:
        return Response({"error": "month is required."}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        project=Project.objects.filter(end_date__year=year,end_date__month=month)
    except Project.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        if project.count()==1:
            serializer = ProjectSerializer(project.first())
        else:
            serializer = ProjectSerializer(project,many=True)
            
        return Response(serializer.data)

@role_required(allowed_roles=['Manager', 'Administrator'], allowed_methods=['GET'])
def project_creation_data(request):
    '''
    ### This API returns neccessary data for project creation

    @return a JSON object with the following data:
    - `project_count`: number of projects created this month and year
    - `users`: list of ProjectManager (tuple of name and email)
    - `client_name`: list of client names
    - `city`: list of cities

    '''
    payload = authenticate_user(request)
    data_to_send = {}

    # gets projects create with the given date
    chosen_date = request.GET.get('date')
    chosen_year = datetime.strptime(chosen_date, '%Y-%m-%d').year
    chosen_month = datetime.strptime(chosen_date, '%Y-%m-%d').month
    projects = Project.objects.filter(
        start_date__year=chosen_year,
        start_date__month=chosen_month
    )
    data_to_send['project_count'] = projects.count()
    # Gets lists of project managers
    users = User.objects.filter(role__in=['Manager', 'Administrator'], is_active=True).values_list('name', 'email')
    data_to_send['users'] = list(users)

    # Get the current user
    current_user = User.objects.filter(id=payload['id']).values_list('name', 'email').first()
    data_to_send['current_user'] = current_user

    # Get list of client names
    client_names = Project.objects.values_list('client_name', flat=True).distinct() 
    data_to_send['client_names'] = list(client_names)

    # Get list of cities
    cities = Project.objects.values_list('city', flat=True).distinct() 
    data_to_send['cities'] = list(cities)

    return Response(data_to_send, status=status.HTTP_200_OK)

@role_required(allowed_roles=['Manager', 'Administrator', 'Team Member', 'Accountant'], allowed_methods=['GET'])
def project_by_date(request):
    
    year = request.GET.get('year')
    month = request.GET.get('month')
    
    if not year:
        return Response({"error": "Year is required."}, status=status.HTTP_400_BAD_REQUEST)
    
    elif not month:
        return Response({"error": "month is required."}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        project=Project.objects.filter(end_date__year=year,end_date__month=month)
    except Project.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        if project.count()==1:
            serializer = ProjectSerializer(project.first())
        else:
            serializer = ProjectSerializer(project,many=True)
            
        return Response(serializer.data)
    
@role_required(allowed_roles=['Manager', 'Administrator'], allowed_methods=['DELETE'])
def project_delete_log(request):
    if request.method == 'DELETE':
        ProjectChangeLog.objects.all().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
