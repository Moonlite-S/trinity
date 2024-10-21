from threading import local
from django.http import HttpResponseRedirect, JsonResponse
from django.contrib.auth import authenticate
from django.conf import settings
import jwt
from datetime import datetime, time, timedelta
from django.contrib.auth.models import AnonymousUser
from .models import User
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from django.contrib.auth import logout
from django.shortcuts import redirect
from Trinity_Project.views.authentication_view import check_mfa_status
from django.utils.deprecation import MiddlewareMixin

User = get_user_model()
_user = local()

# This gets the current user for log and task changes class
class CurrentUserMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        auth_token = request.COOKIES.get('authToken')
        print("auth_token: ", auth_token)
        if not auth_token and hasattr(request, 'auth_token'):
            print("Setting authToken cookie in CurrentUserMiddleware")
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

        if not response.cookies.get('authToken') and hasattr(request, 'auth_token'):
            print("Setting authToken cookie in CurrentUserMiddleware 2")
            response.set_cookie('authToken', request.auth_token, httponly=True, secure=True, samesite='None')
            
        return response

    @staticmethod
    def get_current_user():
        return getattr(_user, 'value', AnonymousUser())
    
class AutoLogoutMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if not request.user.is_authenticated:
            return

        # Get the last activity time in Unix timestamp (seconds since epoch)
        last_activity = request.session.get('last_activity')
        current_time = int(time.time())  # Current time as a Unix timestamp

        # Get idle time in seconds (convert timedelta to seconds if necessary)
        idle_time_seconds = settings.AUTO_LOGOUT['IDLE_TIME']
        if isinstance(idle_time_seconds, timedelta):
            idle_time_seconds = idle_time_seconds.total_seconds()

        # Compare current time and last activity for idle timeout
        if last_activity and (current_time - last_activity) > idle_time_seconds:
            # If idle time exceeded, logout the user and clear the CSRF token
            logout(request)
            response = HttpResponseRedirect(settings.LOGOUT_REDIRECT_URL)
            response.delete_cookie('csrftoken')
            return response

        # Update the last activity time with the current time (Unix timestamp)
        request.session['last_activity'] = current_time
        request.session['last_activity'] = current_time
        
def mfa_required(view_func):
    def wrapped_view(request, *args, **kwargs):
        access_token = request.session.get('access_token')
        if not access_token or not check_mfa_status(access_token):
            return redirect('login_athen')  # Redirect to login if MFA is not configured
        return view_func(request, *args, **kwargs)
    return wrapped_view
