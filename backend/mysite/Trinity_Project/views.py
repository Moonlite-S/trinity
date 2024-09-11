from django.shortcuts import get_object_or_404, render
from django.http import HttpResponse, JsonResponse
from openai import AuthenticationError
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import IsAuthenticated

from .azure_file_share import AzureFileShareClient
from .models import Project, Task
from .models import User
from .serializers import ProjectSerializer, TaskSerializer, UserNameSerializer, UserSerializer
from rest_framework.views import APIView
import jwt, datetime
from datetime import datetime,timezone,timedelta
from django.contrib.auth.decorators import login_required
from rest_framework.authentication import BaseAuthentication
#from django.conf import setting
from django.contrib.auth import get_user_model
from .utils import authenticate_jwt
from rest_framework.exceptions import PermissionDenied

#from backend.mysite.Trinity_Project import serializers


# Create your views here.

class RegisterView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
        
class LoginView(APIView):
    def post(self, request):
        email = request.data['email']
        password = request.data['password']
        
        user = User.objects.filter(email=email).first()
        
        if user is None:
            raise AuthenticationFailed('User not found!')
        
        if not user.check_password(password):
            raise AuthenticationFailed('Incorrect password!')
        
        payload = {
            'id': user.id,
            'name': user.name,
            'is_superuser':user.is_superuser,
            'exp': datetime.now(timezone.utc) + timedelta(minutes=60),
            'iat': datetime.now(timezone.utc)
        }
        
        token = jwt.encode(payload, 'secret', algorithm='HS256')
        
        response =Response()
        
        response.set_cookie(key='jwt', value=token, httponly=True, samesite='None', secure=True)
        response.data = {
            'jwt': token
        }
        
        return response

class UserView(APIView):
    def get(self,request):
        payload = authenticate_jwt(request)
        
        user = User.objects.filter(id=payload['id']).first()
        serializers = UserSerializer(user)
        return Response(serializers.data)

class LogoutView(APIView):
    def post(self, request):
        response = Response()
        response.delete_cookie('jwt')
        response.data = {
            'message': 'success'
        }
        return response

def index(request):
    return HttpResponse("Hello, world. You're at the Project index.")

@api_view(['GET'])
def project_creation_data(request):
    '''
    ### This API returns neccessary data for project creation

    @return a JSON object with the following data:
    - `project_count`: number of projects created this month and year
    - `users`: list of ProjectManager
    - `client_name`: list of client names
    - `city`: list of cities

    TODO:
    - Filter users by manager and admin roles only
    '''
    payload = authenticate_jwt(request)
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

    # Gets lists of project managers (still need to filter out)
    users = User.objects.values_list('name', flat=True)
    data_to_send['users'] = list(users)

    # Get the current user
    current_user = User.objects.filter(id=payload['id']).first()
    current_user = current_user.name
    data_to_send['current_user'] = current_user

    # Get list of client names
    client_names = Project.objects.values_list('client_name', flat=True).distinct() 
    data_to_send['client_names'] = list(client_names)

    # Get list of cities
    cities = Project.objects.values_list('city', flat=True).distinct() 
    data_to_send['cities'] = list(cities)

    return Response(data_to_send, status=status.HTTP_200_OK)


@api_view(['GET','POST'])
#@jwt_required
def project_list(request):
    
    payload = authenticate_jwt(request)

    if request.method == 'GET':    
        projects = Project.objects.all()

        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)
    
    if request.method == 'POST':
        serializer = ProjectSerializer(data=request.data)
        folder = AzureFileShareClient()

        if serializer.is_valid():
            try:
                serializer.save()

                if serializer.data['template'] == '':
                    folder.create_empty_project_folder(serializer.data['folder_location'])
                else:
                    folder.create_template_project_folder(serializer.data['folder_location'], serializer.data['template'])
                
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            
            except Exception as ex:
                print(f"An error occurred while creating the project: {ex} Deleting project...")
                
                folder.delete_project_folder(serializer.data['folder_location'])

                try:
                    Project.objects.get(project_id=serializer.data['project_id']).delete()

                except Exception as ex:
                    print(f"Error while deleting project (maybe already deleted): {ex}")

                return Response(serializer.errors, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET','PUT','DELETE'])
#@jwt_required
def project_detail(request, project_id):
    
    payload = authenticate_jwt(request) #this is used to check if your are login
    
    try:
        project=Project.objects.get(project_id=project_id)
    except Project.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = ProjectSerializer(project)
        return Response(serializer.data)
    elif request.method == 'PUT':
        if project.manager != payload['name'] and not payload['is_superuser']:
            raise PermissionDenied("You do not have permission to edit this project.")
        serializer = ProjectSerializer(project, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        if project.manager != payload['name'] and not payload['is_superuser']:
            raise PermissionDenied("You do not have permission to delete this project.")
        
        try:
            folder = AzureFileShareClient()
            folder.delete_project_folder(project.folder_location)

            project.delete()

            return Response(status=status.HTTP_204_NO_CONTENT)
        
        except Exception as e:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    
@api_view(['GET'])    
def project_filter_by_manager(request, manager):
    
    payload = authenticate_jwt(request) #this is used to check if your are login
    
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

@api_view(['GET'])
def return_all_users_names(request):
    payload = authenticate_jwt(request)
    
    users = User.objects.all()
    serializer = UserNameSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def user_list(request):
    payload = authenticate_jwt(request)
    
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@login_required
@api_view(['GET','POST'])
def task_list(request):
    
    if request.method == 'GET':    
        tasks = Task.objects.all()
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)
    
    if request.method == 'POST':
        serializer = TaskSerializer(data=request.data)
        

        if serializer.is_valid():
            print("Valid data:", serializer.validated_data) # Debug
            serializer.save()
            print("Serializer errors:", serializer.errors) # Debug
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@login_required
@api_view(['GET','PUT','DELETE'])
def task_detail(request, task_id):
    
    try:
        task=Task.objects.get(task_id=task_id)
    except Task.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    #get project manager name from project_id
    project=Project.objects.get(project_id=task.project_id)
    manager=project.manager
    
    user = request.user
    
    if request.method == 'GET':
        serializer = TaskSerializer(task)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        if manager != user.name and not user.is_superuser:
            raise PermissionDenied("You do not have permission to edit this task.")
        serializer = TaskSerializer(task, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        if manager != user.name and not user.is_superuser:
            raise PermissionDenied("You do not have permission to delete this task.")
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
