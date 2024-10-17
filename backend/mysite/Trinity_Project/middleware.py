from threading import local
from django.http import JsonResponse
from django.contrib.auth import authenticate
from django.conf import settings
import jwt
from datetime import datetime, timedelta
from django.contrib.auth.models import AnonymousUser
from .models import User
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token

User = get_user_model()
_user = local()

# This gets the current user for log and task changes class
class CurrentUserMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        auth_token = request.COOKIES.get('authToken')
        if not auth_token and hasattr(request, 'auth_token'):
            auth_token = request.auth_token

        if auth_token:
            try:
                token = Token.objects.get(key=auth_token)
                user = token.user
            except Token.DoesNotExist:
                user = AnonymousUser()
        else:
            user = AnonymousUser()
        
        request.user = user
        _user.value = user
        response = self.get_response(request)

        # Sets the authToken cookie if it's not already set
        if not response.cookies.get('authToken') and hasattr(request, 'auth_token'):
            response.set_cookie('authToken', request.auth_token, httponly=True, secure=True, samesite='Lax')

        return response

    @staticmethod
    def get_current_user():
        return getattr(_user, 'value', AnonymousUser())
    
class PartitionedCookieMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        if 'jwt_token' in response.cookies:
            response.cookies['jwt_token']['Partitioned'] = 'True'

        if 'csrftoken' in response.cookies:
            response.cookies['csrftoken']['Partitioned'] = 'True'
        
        return response
