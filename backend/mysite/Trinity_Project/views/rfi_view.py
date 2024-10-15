from os import name
import random
import string
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from Trinity_Project.azure_file_share import AzureFileShareClient
from Trinity_Project.utils import authenticate_user, role_required
from ..models import RFI, Project, User
from ..serializers import RFISerializer
from django.contrib.auth.decorators import login_required
from django.db.models import Q

@role_required(allowed_roles=['Manager', 'Administrator'], allowed_methods=['GET', 'POST'])
def RFI_list(request):
    try:
        rfis=RFI.objects.all()
    except RFI.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        rfis = sorted(rfis, key=lambda rfi: rfi.days_old(), reverse=True) # Sort by days old (oldest to newest)
        serializer =RFISerializer(rfis, many=True)
        return Response(serializer.data)
    
    if request.method == 'POST':
        branch = 'E'
        project_id = request.data['project']
        unique_id = ''.join(random.choices(string.digits, k=3))

        rfi_id = "RFI" + "-" + branch + "-" + project_id + "-" + unique_id

        # If we have a collision, we will generate a new RFI ID
        while RFI.objects.filter(RFI_id=rfi_id).exists():
            print("Collision Detected, Generating New RFI ID...")
            rfi_id = "RFI" + "-" + branch + "-" + project_id + "-" + ''.join(random.choices(string.digits, k=3))
            print("New RFI ID: ", rfi_id)

        request.data['RFI_id'] = rfi_id

        print(request.data)

        serializer=RFISerializer(data=request.data)

        if serializer.is_valid():
            print(serializer.validated_data)

            # Create folder in Azure File Share
            folder = AzureFileShareClient()
            parent_folder = serializer.validated_data['project'].project_id

            # Check if the folder exists and create it if it doesn't
            try: 
                folder.create_folder_directory(parent_folder + "/RFI")
            except Exception as e:
                print(f"An error occurred while creating the folder: {e}")
                return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            folder.create_sub_folder_directory(parent_folder + "/RFI/", rfi_id)

            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@role_required(allowed_roles=['Manager', 'Administrator'], allowed_methods=['GET', 'PUT', 'DELETE'])
def RFI_detail(request,rfi_id):
    try:
        rfi=RFI.objects.get(pk=rfi_id)
    except RFI.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = RFISerializer(rfi)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = RFISerializer(rfi, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        rfi.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@role_required(allowed_roles=['Manager', 'Administrator'], allowed_methods=['GET'])
def rfi_creation_data(request):
    authenticate_user(request)

    data_to_send = {}

    try:
        # Gets all active projects
        projects = Project.objects.filter(status='ACTIVE').values_list('project_id', 'project_name')
        data_to_send['projects'] = list(projects)

        # Gets all active employees
        employees = User.objects.filter(role__in=['Manager', 'Administrator', 'Team Member'], is_active=True).values_list('pk', 'name')
        data_to_send['employees'] = list(employees)
    except Exception as e:
        print(f"An error occurred while fetching RFI creation data: {e}")
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response(data_to_send, status=status.HTTP_200_OK)

@role_required(allowed_roles=['Manager', 'Administrator'], allowed_methods=['GET'])
def rfi_creation_data(request):
    authenticate_user(request)

    data_to_send = {}

    try:
        # Gets all active projects
        projects = Project.objects.filter(status='ACTIVE').values_list('project_id', 'project_name')
        data_to_send['projects'] = list(projects)

        # Gets all active employees
        employees = User.objects.filter(role__in=['Manager', 'Administrator', 'Team Member'], is_active=True).values_list('pk', 'name')
        data_to_send['employees'] = list(employees)
    except Exception as e:
        print(f"An error occurred while fetching RFI creation data: {e}")
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response(data_to_send, status=status.HTTP_200_OK)

@role_required(allowed_roles=['Manager', 'Administrator'], allowed_methods=['GET'])
def rfi_by_user(request, email):
    user_obj = User.objects.get(email=email)
    try:
        rfis = RFI.objects.filter(Q(assigned_to=user_obj) | Q(created_by=user_obj))
    except RFI.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
        
    if request.method == 'GET':
        serializer = RFISerializer(rfis, many=True)
        return Response(serializer.data)
    
