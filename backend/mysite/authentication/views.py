from django.forms import model_to_dict
from django.shortcuts import render

# Create your views here.
from django.conf import settings
from django.http import HttpResponseRedirect
from dj_rest_auth.registration.views import SocialLoginView
from allauth.socialaccount.providers.microsoft.views import MicrosoftGraphOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.views import UserDetailsView
from rest_framework.response import Response
from Trinity_Project.models import User, Project
from dj_rest_auth.registration.views import RegisterView
from rest_framework import status
from rest_framework.authtoken.models import Token
from dj_rest_auth.views import LoginView, LogoutView
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.csrf import csrf_protect
from rest_framework.decorators import api_view

def email_confirm_redirect(request, key):
    return HttpResponseRedirect(
        f"{settings.EMAIL_CONFIRM_REDIRECT_BASE_URL}{key}/"
    )

def password_reset_confirm_redirect(request, uidb64, token):
    return HttpResponseRedirect(
        f"{settings.PASSWORD_RESET_CONFIRM_REDIRECT_BASE_URL}{uidb64}/{token}/"
    )

class MicrosoftLogin(SocialLoginView):
    adapter_class = MicrosoftGraphOAuth2Adapter
    # callback_url = "http://localhost:5173/main_menu"
    client_class = OAuth2Client

    def post(self, request, *args, **kwargs):
        print(f"Received request data in MicrosoftLogin: {request.data}")
        try:
            return super().post(request, *args, **kwargs)
        except Exception as e:
            print(f"Error in MicrosoftLogin: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class RegisterEmployee(RegisterView):
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        data = self.get_response_data(user)

        if data:
            response = Response(data, status=status.HTTP_201_CREATED, headers=headers)
        else:
            response = Response(status=status.HTTP_204_NO_CONTENT, headers=headers)

        return response

    def perform_create(self, serializer):
        user = serializer.save(self.request)
        if 'role' in self.request.data:
            user.role = self.request.data['role']
            user.save()
        return user

class GetUserInfo(UserDetailsView):
    def get(self, request, *args, **kwargs):
        response = super().get(request, *args, **kwargs)
        
        if response.status_code == 200:
            email = response.data.get('email')
            if email:
                try:
                    user = User.objects.get(email=email)

                    projects = user.projects.select_related('manager').all().exclude(status='Completed')
                    project_list = []
                    for project in projects:
                        project_dict = model_to_dict(project)
                        project_dict['manager'] = model_to_dict(project.manager)
                        project_list.append(project_dict)

                    tasks = user.tasks.select_related('assigned_to', 'project_id').all().exclude(status='Completed')
                    task_list = []
                    for task in tasks:
                        task_dict = model_to_dict(task)
                        task_dict['assigned_to'] = model_to_dict(task.assigned_to)
                        task_dict['project_id'] = Project.objects.filter(project_id=task.project_id.project_id).first().project_name
                        task_list.append(task_dict)

                    submittals = user.submittals.all().exclude(status='Completed')
                    submittal_list = []
                    for submittal in submittals:
                        submittal_dict = model_to_dict(submittal)
                        submittal_dict['project_name'] = submittal.project.project_name
                        submittal_list.append(submittal_dict)

                    rfis = user.rfi_created.all().exclude(status='Completed') | user.rfi_sent.all().exclude(status='Completed')
                    rfis = rfis.distinct()
                    rfi_list = []
                    for rfi in rfis:
                        rfi_dict = model_to_dict(rfi)
                        #rfi_dict['project_name'] = rfi.project.project_name
                        rfi_list.append(rfi_dict)

                    token, created = Token.objects.get_or_create(user=user)

                    response.data['user'] = {
                        'id': user.id,
                        'email': user.email,
                        'name': user.name,
                        'role': user.role,
                        'date_joined': user.date_joined,
                        'projects': project_list,
                        'tasks': task_list,
                        'submittals': submittal_list,
                        'RFIs': rfi_list,
                        'token': token.key
                    }
                except User.DoesNotExist:
                    pass
        
        return response

class CustomLoginView(LoginView):
    @method_decorator(ensure_csrf_cookie)
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        print("CSRF token in CustomLoginView: ", request.headers.get('X-CSRFToken'))

        if response.status_code == status.HTTP_200_OK:
            token = Token.objects.get(key=response.data['key'])
            response['Authorization'] = f'Token {token.key}'
            response.set_cookie('authToken', token.key, httponly=True, secure=True, samesite='None')
        return response
        
class CustomLogoutView(LogoutView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        response.delete_cookie('authToken')
        response.delete_cookie('csrftoken')

        return response
    
@ensure_csrf_cookie
@api_view(['GET'])
def set_csrf_token(request):
    return Response(data={"status": "CSRF token set"}, status=status.HTTP_200_OK)
