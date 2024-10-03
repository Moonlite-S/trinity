from os import name
from django.http import HttpResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
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


@api_view(['POST'])
def login_view(request):
    email = request.data['email']
    password = request.data['password']

    user = authenticate(request, email=email, password = password)

    if user is not None:
        login(request, user)

    elif not user.check_password(password):
        raise AuthenticationFailed('Incorrect password!')

    else:
        raise AuthenticationFailed('User not found!')
    response=Response()
    csrf_token = get_token(request)
    response.set_cookie(key='csrftoken', value=csrf_token, httponly=False, samesite='None', secure=True)
    
    return Response({"message": "Successfully logged in."}, status=200)

@api_view(['POST'])
def logout_view(request):
    # Log the user out
    logout(request)

    # Create the response object
    response = Response({"message": "Successfully logged out."}, status=200)

    # Delete the CSRF token from the response cookies
    response.delete_cookie('csrftoken')

    return response

def index(request):
    return HttpResponse("Hello, world. You're at the Project index.")