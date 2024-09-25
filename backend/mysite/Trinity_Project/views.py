from django.conf import settings
from django.shortcuts import get_object_or_404, render
from django.http import HttpResponse, JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.exceptions import PermissionDenied

from .azure_file_share import AzureFileShareClient
from .models import Announcements, Project, Task,ProjectChangeLog, TaskChangeLog, User
from .serializers import AnnouncmentsSerializer, ProjectSerializer, ProjectSerializerUserObjectVer, TaskSerializer, UserNameAndEmail, UserNameSerializer, UserSerializer
from rest_framework.views import APIView
import jwt, datetime
from datetime import datetime,timezone,timedelta
#from django.conf import setting
from django.contrib.auth import authenticate
from .utils import authenticate_jwt
from datetime import datetime, timedelta
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
        
        #user = User.objects.filter(email=email).first()
        user = authenticate(email=email, password=password)
        
        if user is None:
            return Response(status=status.HTTP_403_FORBIDDEN)
            # raise AuthenticationFailed('User not found!')
        
        if not user.check_password(password):
            return Response(status=status.HTTP_403_FORBIDDEN)
            # raise AuthenticationFailed('Incorrect password!')
        
        payload = {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'is_superuser':user.is_superuser,
            'exp': datetime.now(timezone.utc) + timedelta(minutes=60),
            'iat': datetime.now(timezone.utc)
        }
        
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
        
        response = Response()
        
        response.set_cookie(key='jwt_token', value=token, httponly=True, samesite='None', secure=True)
        response.data = {
            'jwt': token,
            'user': user.name,
            'email': user.email,
            'is_superuser': user.is_superuser,
            'role': user.role,
            'email': user.email,
        }
        
        return response

class UserView(APIView):
    def get(self, request):
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
    - `users`: list of ProjectManager (tuple of name and email)
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


@api_view(['GET','POST'])
#@jwt_required
def project_list(request):
    
    payload = authenticate_jwt(request)

    if request.method == 'GET':    
        projects = Project.objects.all()

        serializer = ProjectSerializerUserObjectVer(projects, many=True)
        return Response(serializer.data)
    
    if request.method == 'POST':
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

@api_view(['GET','PUT','DELETE'])
#@jwt_required
def project_detail(request, project_id):
    
    payload = authenticate_jwt(request) #this is used to check if your are login
    
    try:
        project=Project.objects.get(project_id=project_id)
    except Project.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = ProjectSerializerUserObjectVer(project)

        return Response(serializer.data)
    elif request.method == 'PUT':

        if project.manager != payload['name'] and not payload['is_superuser']:
            raise PermissionDenied("You do not have permission to edit this project.")

        serializer = ProjectSerializer(project, data=request.data)
        if serializer.is_valid():
            manager_email = request.data.get('manager')
            manager_obj = User.objects.get(email=manager_email)
            serializer.validated_data['manager'] = manager_obj
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
def return_all_users_name_and_email(request):
    payload = authenticate_jwt(request)

    users = User.objects.all()
    serializer = UserNameAndEmail(users, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def user_list(request):
    payload = authenticate_jwt(request)
    
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['GET','POST'])
def task_list(request):

    if request.method == 'GET':
        tasks = Task.objects.all()
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        # Get assigned_to from request data and check if it exists
        serializer = TaskSerializer(data=request.data)

        if serializer.is_valid():
            # Get assigned_to from request data and cross check it with the User model
            # Same with Project model
            assigned_to = serializer.validated_data.pop('assigned_to')
            project_id = serializer.validated_data.pop('project_id')

            try: 
                user = User.objects.get(email=assigned_to)
                project = Project.objects.get(project_id=project_id)
                
                task = Task.objects.create(assigned_to=user, project_id=project, **serializer.validated_data)

                return Response(TaskSerializer(task).data, status=status.HTTP_201_CREATED)

            except User.DoesNotExist:
                print(f"User {assigned_to} does not exist.")
                return Response(status=status.HTTP_404_NOT_FOUND)
            
            except Project.DoesNotExist:
                print(f"Project {project_id} does not exist.")
                return Response(status=status.HTTP_404_NOT_FOUND)
            
            except Exception as ex:
                print(f"An error occurred while creating the task: {ex}")
                return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET','PUT','DELETE'])
def task_detail(request, task_id):
    try:
        task=Task.objects.get(task_id=task_id)
    except Task.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    #get project manager name from project_id
    try:
        project=Project.objects.get(project_id=task.project_id.project_id)
        manager=project.manager
    except Project.DoesNotExist:
        return Response({"error": "Associated project not found"}, status=status.HTTP_404_NOT_FOUND)
    
    user = request.user

    if request.method == 'GET':
        serializer = TaskSerializer(task)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'PUT':
        # if manager != user.name and not user.is_superuser:
        #     raise PermissionDenied("You do not have permission to edit this task.")
        serializer = TaskSerializer(task, data=request.data)
        if serializer.is_valid():
            manager_obj = serializer.validated_data.pop('assigned_to')
            project_obj = serializer.validated_data.pop('project_id')

            try:
                manager = User.objects.get(email=manager_obj)
                project = Project.objects.get(project_id=project_obj)
            except User.DoesNotExist:   
                return Response(data={"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            
            except Project.DoesNotExist:

                return Response(data={"error": "Project not found"}, status=status.HTTP_404_NOT_FOUND)
            
            serializer.validated_data['assigned_to'] = manager  
            serializer.validated_data['project_id'] = project

            serializer.save()
            print(serializer.data)

            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        if manager != user.name and not user.is_superuser:
            raise PermissionDenied("You do not have permission to delete this task.")
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
def task_filter_by_project_id(request, project_id):
    try:
        # The project_id__project_id searches in both tasks and projects
        # By default, Django uses the inbuilt id field, so we need to use the project_id field
        tasks=Task.objects.filter(project_id__project_id=project_id)

        serializer = TaskSerializer(tasks,many=True)
        return Response(serializer.data)
        
    except Exception as ex:
        print(f"An error occurred while filtering tasks by project id: {ex}")
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def task_filter_by_user(request, email):

    #user = request.user
    try:
        user = User.objects.get(email=email)
        tasks=Task.objects.filter(assigned_to=user)

    except Task.DoesNotExist:
        return Response(data={"error": "Task not found."}, status=status.HTTP_404_NOT_FOUND)
    except User.DoesNotExist:
        return Response(data={"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = TaskSerializer(tasks,many=True)
    
        return Response(serializer.data)
    
@api_view(['GET'])
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
    
@api_view(['GET', 'POST'])
def announcement(request):
    payload = authenticate_jwt(request)
    
    if request.method == 'GET':
        announcements = Announcements.objects.all()
        serializer = AnnouncmentsSerializer(announcements, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        serializer = AnnouncmentsSerializer(data=request.data)
        if serializer.is_valid():
            author = serializer.validated_data.pop('author')
            try:
                user = User.objects.get(email=author)

                if user.role == 'Manager' or user.role == 'Administrator':
                    announcement = Announcements.objects.create(author=user, **serializer.validated_data)

                    return Response(AnnouncmentsSerializer(announcement).data, status=status.HTTP_201_CREATED)
                else:
                    return Response(data={"Permission Error": "You do not have permission to create an announcement."}, status=status.HTTP_403_FORBIDDEN)

            except User.DoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def project_delete_log(request):
    if request.method == 'DELETE':
        ProjectChangeLog.objects.all().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
def submittal_creation_data(request):
    payload = authenticate_jwt(request)

    data_to_send = {}

    # Gets all active projects
    projects = Project.objects.filter(status='ACTIVE').values_list('project_id', 'project_name')
    data_to_send['projects'] = list(projects)

    # Gets lists of users (project managers and team members)
    users = User.objects.filter(role__in=['Manager', 'Administrator', 'Team Member'], is_active=True).values_list('email', 'name')
    data_to_send['users'] = list(users)

    # Get list of client names
    client_names = Project.objects.values_list('client_name', flat=True).distinct() 
    data_to_send['client_names'] = list(client_names)

    return Response(data_to_send, status=status.HTTP_200_OK)