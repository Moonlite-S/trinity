from os import name
import random
import string
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from Trinity_Project.utils import authenticate_jwt
from ..models import RFI, Project, User
from ..serializers import RFISerializer
from django.contrib.auth.decorators import login_required

@login_required
@api_view(['GET', 'POST'])
def RFI_list(request):
    try:
        rfis=RFI.objects.all()
    except RFI.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        rfis=RFI.objects.all()
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
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@login_required
@api_view(['GET','PUT','DELETE'])
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
    
@login_required
@api_view(['PUT'])
def close_rfi(request, rfi_id):
    try:
        rfi = RFI.objects.get(pk=rfi_id)
    except RFI.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'PUT':
        try:    
            rfi.is_closed = True
            rfi.save()
            return Response(status=status.HTTP_200_OK)
        except Exception as e:
            print(f"An error occurred while closing RFI: {e}")
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def rfi_creation_data(request):
    authenticate_jwt(request)

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

@api_view(['GET'])
def rfi_creation_data(request):
    authenticate_jwt(request)

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
