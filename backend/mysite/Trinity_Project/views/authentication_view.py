from datetime import datetime, timedelta, timezone
from django.conf import settings
from django.http import HttpResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from rest_framework import status
from ..models import User
from ..utils import authenticate_jwt
from ..serializers import UserSerializer
from rest_framework.views import APIView
import jwt
from django.contrib.auth import authenticate,login,logout
from django.middleware.csrf import get_token

class RegisterView(APIView):
    def post(self,request):
        serializer = UserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

class UserView(APIView):
    def get(self, request):
        payload = authenticate_jwt(request)

        try: 
            user = User.objects.filter(id=payload['id']).first()
            serializers = UserSerializer(user)
            return Response(serializers.data)
        
        except Exception as e:
            print(f"An error occurred while getting the user: {e}")
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
@api_view(['POST'])
def login_view(request):
    email = request.data['email']
    password = request.data['password']

    user = authenticate(request, email=email, password = password)

    # Removed as we are using own auth method
    # if user is not None:
    #     login(request, user)

    if user is None:
        raise AuthenticationFailed('Invalid credentials!')

    response=Response()

    payload = {
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'is_superuser':user.is_superuser,
        'exp': datetime.now(timezone.utc) + timedelta(minutes=60),
        'iat': datetime.now(timezone.utc)
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    response.set_cookie(key='jwt_token', value=token, httponly=True, samesite='None', secure=True, max_age=3600)

    csrf_token = get_token(request)
    response.set_cookie(key='csrftoken', value=csrf_token, httponly=False, samesite='None', secure=True)

    response.data = {"message": "Successfully logged in."}
    return response

@api_view(['POST'])
def logout_view(request):
    # # Log the user out
    logout(request)

    # Create the response object
    response = Response({"message": "Successfully logged out."}, status=200)

    # Delete the CSRF token from the response cookies
    response.delete_cookie('csrftoken')
    # Delete the jwt_token cookie
    response.delete_cookie('jwt_token')

    print("response: ", response)

    return response

def index(request):
    return HttpResponse("Hello, world. You're at the Project index.")
