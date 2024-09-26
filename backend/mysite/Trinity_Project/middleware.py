from threading import local
from django.http import JsonResponse
from django.contrib.auth import authenticate
from django.conf import settings
import jwt
from datetime import datetime, timedelta
from django.contrib.auth.models import AnonymousUser
from .models import User
from django.contrib.auth import get_user_model
from django.conf import settings

User = get_user_model()
_user = local()
#This get the current user for log and task changes class
class CurrentUserMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        jwt_token = request.COOKIES.get('jwt_token')
        if jwt_token:
            try:
                payload = jwt.decode(jwt_token, settings.SECRET_KEY, algorithms=['HS256'])
                user_id = payload.get('id')
                user = User.objects.get(id=user_id)
            except (jwt.DecodeError, User.DoesNotExist):
                user = AnonymousUser()
        else:
            user = AnonymousUser()
        
        request.user = user
        _user.value = user
        response = self.get_response(request)
        return response

    @staticmethod
    def get_current_user():
        return getattr(_user, 'value', AnonymousUser())