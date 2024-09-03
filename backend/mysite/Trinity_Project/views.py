from django.shortcuts import get_object_or_404, redirect, render #added 'redirect' for graph api
from django.http import HttpResponse, JsonResponse
from openai import AuthenticationError
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import IsAuthenticated

from .azure_file_share import create_folder_in_file_share
from .models import Project
from .models import User
from .serializers import ProjectSerializer, UserNameSerializer, UserSerializer
from rest_framework.views import APIView
import jwt, datetime
from datetime import datetime,timezone,timedelta
from rest_framework.authentication import BaseAuthentication
#from django.conf import setting
from django.contrib.auth import get_user_model
from .utils import authenticate_jwt
from rest_framework.exceptions import PermissionDenied
# Microsoft GRAPH API connection
import os
import sys
import msal
import requests
from . import graphapi

print("Current working directory:", os.getcwd())
print("Python path:", sys.path)

redirect_uri = 'http:localhost:8000/getAToken'

def home(request):
    auth_url = graphapi.get_auth_url(redirect_uri)
    return render(request, 'home.html', {'auth_url': auth_url})

def get_a_token(request):
    code = request.GET.get('code')
    result = graphapi.acquire_token_by_code(code, redirect_uri)
    if "access_token" in result:
        access_token = result["access_token"]
        response = graphapi.get_user_profile(access_token)
        if response.status_code == 200:
            return JsonResponse(response.json())
        else:
            return JsonResponse({'error': response.status_code, 'message': response.text})
    else:
        return JsonResponse({'error': result.get('error_description')})

# End of Microsoft Graph API connection

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

        if serializer.is_valid():
            print("Valid data:", serializer.validated_data) # Debug
            serializer.save()
            print("Serializer errors:", serializer.errors) # Debug
            return Response(serializer.data, status=status.HTTP_201_CREATED)
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
        project.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
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


@api_view(['POST'])
def create_azure_file_share_folder_view(request):
    folder_name = request.POST.get('folder_name', 'default_folder') # This ONLY handles form data
    print(f"heres e: {request.POST}") # Will print nothing as the frontend is currently not using forms for this
    print(request.data) # This WILL print out the request body as an Object
    print(folder_name) 
    
    create_folder_in_file_share(request.data['folder_name']) # Request only needs one field, folder_name, maybe later, we can specify it's location
    
    return JsonResponse({'message': f'Folder "{folder_name}" created successfully in Azure File Share!'})
