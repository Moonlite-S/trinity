from functools import wraps
from django.conf import settings
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from .models import User
from rest_framework.authtoken.models import Token

def authenticate_user(request):
    auth_token = request.COOKIES.get('authToken')
    
    if not auth_token:
        raise AuthenticationFailed('Unauthenticated! No token provided.')
    
    try:
        token = Token.objects.get(key=auth_token)
        user = token.user
        
        if not user.is_active:
            raise AuthenticationFailed('User is inactive!')
        
        # Convert user object to dictionary
        user_dict = {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role,
        }
        
        return user_dict

    except Token.DoesNotExist:
        raise AuthenticationFailed('Invalid token!')
    

def role_required(allowed_roles, allowed_methods):
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
