from datetime import datetime,timedelta
import time
from threading import local
from django.utils.deprecation import MiddlewareMixin
from django.http import HttpResponseRedirect
from django.conf import settings
from django.contrib.auth import logout


_user = local()
#This get the current user for log and task changes class
class CurrentUserMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        _user.value = getattr(request, 'user', None)
        response = self.get_response(request)
        return response

    @staticmethod
    def get_current_user():
        return getattr(_user, 'value', None)
    

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