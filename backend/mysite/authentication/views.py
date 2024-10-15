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
    callback_url = "http://localhost:5173/auth/microsoft/login/callback/"
    client_class = OAuth2Client

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

                    response.data['user'] = {
                        'id': user.id,
                        'email': user.email,
                        'name': user.name,
                        'role': user.role,
                        'date_joined': user.date_joined,
                        'projects': project_list,
                        'tasks': task_list,
                        'submittals': submittal_list,
                        'RFIs': rfi_list
                    }
                except User.DoesNotExist:
                    pass
        
        return response
