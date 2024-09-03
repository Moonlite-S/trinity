from django.shortcuts import get_object_or_404, render, redirect
from django.http import HttpResponse, JsonResponse
from openai import AuthenticationError
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import IsAuthenticated

from .azure_file_share import create_folder_in_file_share, copy_template_folder
from .models import Project, VerificationCode
from .models import User
from .serializers import ProjectSerializer, UserNameSerializer, UserSerializer
from rest_framework.views import APIView
import jwt, datetime
from datetime import datetime,timezone,timedelta
from rest_framework.authentication import BaseAuthentication
#from django.conf import setting
from django.contrib.auth import authenticate,login,logout,get_user_model
from django.contrib.auth.decorators import login_required
from .utils import authenticate_jwt, send_sms
from rest_framework.exceptions import PermissionDenied
from django.contrib.auth.forms import AuthenticationForm
from .forms import VerificationCodeForm
#from backend.mysite.Trinity_Project import serializers


# Create your views here.

class RegisterView(APIView):
    def post(self,request):
        serializer = UserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
        

# @api_view(['POST'])
# def login_view(request):
#     email = request.data['email']
#     password = request.data['password']
    
#     user = authenticate(request, email=email, password = password)
    
#     if user is not None:
#         login(request, user)
    
#     elif not user.check_password(password):
#         raise AuthenticationFailed('Incorrect password!')
    
#     else:
#         raise AuthenticationFailed('User not found!')
@login_required
@api_view(['GET'])    
def user_view(request):
    user = request.user
    serializers = UserSerializer(user)
    return Response(serializers.data)

# @api_view(['POST'])
# def logout_view(request):
#     logout(request)

def index(request):
    return HttpResponse("Hello, world. You're at the Project index.")

@login_required
@api_view(['GET','POST'])
def project_list(request):
        
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

@login_required
@api_view(['GET','PUT','DELETE'])
def project_detail(request, project_id):
    
    try:
        project=Project.objects.get(project_id=project_id)
    except Project.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    user = request.user
    
    if request.method == 'GET':
        serializer = ProjectSerializer(project)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        if project.manager != user.name and not user.is_superuser:
            raise PermissionDenied("You do not have permission to edit this project.")
        serializer = ProjectSerializer(project, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        if project.manager != user.name and not user.is_superuser:
            raise PermissionDenied("You do not have permission to delete this project.")
        project.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
@login_required 
@api_view(['GET'])
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

@login_required
@api_view(['GET'])
def return_all_users_names(request):    
    users = User.objects.all()
    serializer = UserNameSerializer(users, many=True)
    return Response(serializer.data)

@login_required
@api_view(['GET'])
def user_list(request):    
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def create_azure_file_share_folder_view(request):
    folder_name = request.POST.get('folder_name', 'default_folder')
    
    create_folder_in_file_share(folder_name)
    
    return JsonResponse({'message': f'Folder "{folder_name}" created successfully in Azure File Share!'})

@api_view(['POST'])
def copy_template_folder_view(request):
    new_folder_name = request.POST.get('new_folder_name', 'default_new_folder')
    template_folder_name = request.POST.get('template_folder_name', 'template_folder')
    
    copy_template_folder(new_folder_name, template_folder_name)
    
    return JsonResponse({
        'message': f"Template folder '{template_folder_name}' copied and renamed to '{new_folder_name}' successfully!"
    })
    
@api_view(['POST'])
def verify_view(request):
    form = VerificationCodeForm(request.POST or None)
    pk = request.session.get('pk')
    if pk:
        user = User.objects.get(pk=pk)
        verification_code = VerificationCode.objects.get(user=user)
        
        if not request.POST:
            print(f"Verification code for {user.name}: {verification_code.number}")#should display in the terminal
            #send sms using utils code would go here
            
        if form.is_valid():
            num = form.cleaned_data('number')
            
            if str(verification_code.number) == num:
                verification_code.delete()
                return JsonResponse({
                    '' : f"Verification succeed"
                })
            else:
                return JsonResponse({
                    '' : f"Verification failed"
                })
            
    