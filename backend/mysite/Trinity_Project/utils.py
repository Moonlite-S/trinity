from functools import wraps
from django.conf import settings
import jwt
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from .models import User  # Import your custom User model

def authenticate_jwt(request):
    token = request.COOKIES.get('jwt_token')
    
    if not token:
        raise AuthenticationFailed('Unauthenticated!') 
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        response = AuthenticationFailed('Token has expired!')
        response.delete_cookie('jwt_token')
        response.delete_cookie('csrftoken')
        raise response
    except jwt.DecodeError:
        raise AuthenticationFailed('Invalid token!')
    
    return payload

def role_required(allowed_roles, allowed_methods):
    def decorator(view_func):
        @wraps(view_func)
        @api_view(allowed_methods)  # Include all methods you need
        def wrapper(request, *args, **kwargs):
            try:
                token = request.COOKIES.get('jwt_token')

                if not token:
                    raise AuthenticationFailed('Unauthenticated! Token not found.')

                try:
                    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                except jwt.ExpiredSignatureError:
                    raise AuthenticationFailed('Unauthenticated! Token expired.')

                user = User.objects.filter(id=payload['id']).first()
                if user is None:
                    raise AuthenticationFailed('User not found!')

                if user.role not in allowed_roles:
                    return Response({"error": "You do not have permission to perform this action"}, status=status.HTTP_403_FORBIDDEN)
                
                return view_func(request, *args, **kwargs)
            except AuthenticationFailed as e:
                return Response({"error": str(e)}, status=status.HTTP_401_UNAUTHORIZED)
        return wrapper
    return decorator