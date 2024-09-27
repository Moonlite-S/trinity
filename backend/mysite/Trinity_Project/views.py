from os import name
from urllib import response
from django.shortcuts import get_object_or_404, render, redirect
from django.http import HttpResponse, JsonResponse
from openai import AuthenticationError
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import IsAuthenticated, AllowAny
from two_factor.views import LoginView

from .azure_file_share import create_folder_in_file_share, copy_template_folder
from .models import Project, ProjectChangeLog, TaskChangeLog, VerificationCode, User,Task,Submittal
from .serializers import ProjectSerializer, UserNameSerializer, UserSerializer,TaskSerializer,SubmittalSerializer
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
from django_otp.plugins.otp_totp.models import TOTPDevice
from django.contrib.auth.models import AnonymousUser
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from .models import PendingChange
from django.middleware.csrf import get_token



# Create your views here.


class RegisterView(APIView):
    def post(self,request):
        serializer = UserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


@api_view(['POST'])
def login_view(request):
    email = request.data['email']
    password = request.data['password']

    user = authenticate(request, email=email, password = password)

    if user is not None:
        login(request, user)

    elif not user.check_password(password):
        raise AuthenticationFailed('Incorrect password!')

    else:
        raise AuthenticationFailed('User not found!')
    response=Response()
    csrf_token = get_token(request)
    response.set_cookie(key='csrftoken', value=csrf_token, httponly=False, samesite='None', secure=True)
    
    return Response({"message": "Successfully logged in."}, status=200)

@login_required
@api_view(['GET'])
def user_view(request):
    user = request.user
    serializers = UserSerializer(user)
    return Response(serializers.data)

@login_required
@api_view(['GET','PUT','DELETE'])
def user_edit(request,user_email):
    user=request.user
    user_2=User.objects.get(email=user_email)

    if request.method=='GET':
        if user==user_2 or user.is_superuser:
            serializer = UserSerializer(user_2)
            return Response(serializer.data)
        else:
            raise PermissionDenied("You are unable to view this user")

    elif request.method=='PUT':
        serializer = UserSerializer(user_2, data=request.data)
        if user==user_2 or user.is_superuser:
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            raise PermissionDenied("You are unable to edit this user")

    elif request.method=='DELETE':
        if user.is_superuser:
            user_2.delete()
        else:
            raise PermissionDenied("You do not have permission to delete this user.")

@api_view(['POST'])
def logout_view(request):
    # Log the user out
    logout(request)

    # Create the response object
    response = Response({"message": "Successfully logged out."}, status=200)

    # Delete the CSRF token from the response cookies
    response.delete_cookie('csrftoken')

    return response

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

@login_required
@api_view(['GET'])
def return_all_users_names(request):
    users = User.objects.all()
    serializer = UserNameSerializer(users, many=True)
    return Response(serializer.data)

@login_required
@api_view(['GET'])
def user_list(request):
    user=request.user
    if user.is_superuser:
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
    else:
        raise PermissionDenied("You are unable to view user list")


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

    
    if not task.is_approved:
        return HttpResponse("This task is pending approval and cannot be viewed.")
    
    print(f"Task project_id: {task.project_id}")
    #get project manager name from project_id
    try:
        project=Project.objects.get(project_id=task.project_id)
        manager=project.manager
    except Project.DoesNotExist:
        return Response({"error": "Associated project not found"}, status=status.HTTP_404_NOT_FOUND)

    user = request.user

    if request.method == 'GET':
        serializer = TaskSerializer(task)
        return Response(serializer.data)

    elif request.method == 'PUT':
        # if manager != user.name and not user.is_superuser:
        #     raise PermissionDenied("You do not have permission to edit this task.")
        serializer = TaskSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            # For each field, check if the value has changed
            for field, new_value in serializer.validated_data.items():
                old_value = getattr(task, field)
                
                if old_value != new_value:
                    # Create a PendingChange entry instead of saving directly
                    PendingChange.objects.create(
                        task=task,
                        field_name=field,
                        old_value=old_value,
                        new_value=new_value,
                        requested_by=user
                    )

            # Mark the project as pending approval
            task.is_approved = False
            task.save(update_fields=['is_approved'])
            return Response({"detail": "Changes have been submitted for approval."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        if manager != user.name and not user.is_superuser:
            raise PermissionDenied("You do not have permission to delete this task.")
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@login_required
@api_view(['GET'])
def task_filter_by_name(request, name):

    #user = request.user
    try:
        tasks=Task.objects.filter(assigned_to=name)
    except Task.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        if tasks.count() ==1:
            serializer = TaskSerializer(tasks.first())
        else:
            serializer = TaskSerializer(tasks,many=True)
    
        return Response(serializer.data)

@login_required
@api_view(['GET'])
def task_filter_by_project_id(request, project_id):
    #project=User.objects.get(project_id=project_id)
    #user = request.user
    
    try:
        tasks=Task.objects.filter(project_id=project_id)
    except Task.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        if tasks.count() ==1:
            serializer = TaskSerializer(tasks.first())
        else:
            serializer = TaskSerializer(tasks,many=True)
        return Response(serializer.data)

@login_required
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
        

@api_view(['DELETE'])
def project_delete_log(request):
    if request.method == 'DELETE':
        ProjectChangeLog.objects.all().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@login_required
@api_view(['GET','POST'])
def submittal_list(request):
    
    if request.method == 'GET':
        submittals=Submittal.objects.all()
        serializer = SubmittalSerializer(submittals, many=True)
        return Response(serializer.data)
    
    if request.method == 'POST':
        serializer=SubmittalSerializer(data=request.data)
        
        if serializer.is_valid():
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
        serializer = SubmittalSerializer(submittal)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        submittal.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
            

@login_required
@api_view(['GET'])
def submittal_by_assigned_to(request,assigned_to):
    
    try:
        submittals=Submittal.objects.filter(user__name=assigned_to)
    except Submittal.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        if submittals.count() == 1:
            serializer = SubmittalSerializer(submittals.first())
        else:
            serializer = SubmittalSerializer(submittals,many=True)
        return Response(serializer.data)
        


    # try:
    #     tasks=Task.objects.filter(project_id=project_id)
    # except Task.DoesNotExist:
    #     return Response(status=status.HTTP_404_NOT_FOUND)
    # if request.method == 'GET':
    #     if tasks.count() ==1:
    #         serializer = TaskSerializer(tasks.first())
    #     else:
    #         serializer = TaskSerializer(tasks,many=True)
    #     return Response(serializer.data)