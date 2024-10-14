from django.shortcuts import render

# Create your views here.
from django.conf import settings
from django.http import HttpResponseRedirect
from dj_rest_auth.registration.views import SocialLoginView
from allauth.socialaccount.providers.microsoft.views import MicrosoftGraphOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.views import UserDetailsView
from rest_framework.response import Response
from Trinity_Project.models import User

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
                    # Add any additional user data you want to include
                    response.data['user'] = {
                        'id': user.id,
                        'email': user.email,
                        'name': user.name,
                        'role': user.role,
                        'date_joined': user.date_joined,
                        # Add any other fields you want to include
                    }
                except User.DoesNotExist:
                    pass
        
        return response
