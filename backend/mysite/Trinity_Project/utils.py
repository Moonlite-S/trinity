from functools import wraps
from django.conf import settings
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from .models import User
from rest_framework.authtoken.models import Token
import logging
logger = logging.getLogger(__name__)

def authenticate_user(request):
    logger.info("Authenticating user...")

    auth_token = (
        request.COOKIES.get('authToken') or
        request.headers.get('Authorization') or
        request.GET.get('token')
    )

    print("Auth token found: ", auth_token)

    logger.info(f"Auth token found: {auth_token}")
    
    if not auth_token:
        raise AuthenticationFailed('Unauthenticated! No token provided.')
    
    try:
        token = Token.objects.get(key=auth_token)
        user = token.user
        print("User found: ", user)

        
        if not user.is_active:
            raise AuthenticationFailed('User is inactive!')
        
        # Convert user object to dictionary
        user_dict = {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role,
        }
        
        logger.info(f"User authenticated: {user.email}")
        return user_dict

    except Token.DoesNotExist:
        raise AuthenticationFailed('Invalid token! Does not exist.')
    

def role_required(allowed_roles, allowed_methods):
    '''
    ### Decorator to check if the user has the required role to access the view
    Also authenticates the user and specifies the allowed methods for the view

    `allowed_roles` So far, we have: Manager, Administrator, Team Member, Accountant [* = everyone]

    `allowed_methods` GET, POST, PUT, DELETE, etc.
    '''
    def decorator(view_func):
        @wraps(view_func)
        @api_view(allowed_methods)
        def wrapper(request, *args, **kwargs):
            try:
                user = authenticate_user(request)
                
                if user['role'] not in allowed_roles:
                    return Response({"error": "You do not have permission to perform this action"}, status=status.HTTP_403_FORBIDDEN)
                
                return view_func(request, *args, **kwargs)
            except AuthenticationFailed as e:
                return Response({"error": str(e)}, status=status.HTTP_401_UNAUTHORIZED)
        return wrapper
    return decorator

def get_csrf_token(request):
    '''
    ### Function to get the CSRF token from the request
    '''
    csrf_token = request.COOKIES.get('csrftoken')
    return csrf_token
