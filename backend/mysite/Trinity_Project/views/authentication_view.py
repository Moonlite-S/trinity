from datetime import datetime, timedelta, timezone
from django.conf import settings
from django.http import HttpResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from rest_framework import status
from ..models import User
from ..utils import authenticate_user
from ..serializers import UserSerializer
from rest_framework.views import APIView
import jwt
from django.contrib.auth import authenticate,login,logout
from django.middleware.csrf import get_token
from django.shortcuts import redirect, render
from msal import ConfidentialClientApplication
from django.conf import settings
import requests
from ..utils import role_required

# class RegisterView(APIView):
#     '''
#     DEPRECATED
#     '''
#     def post(self,request):
#         serializer = UserSerializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         serializer.save()
#         return Response(serializer.data)

# class UserView(APIView):
#     '''
#     DEPRECATED
#     '''
#     def get(self, request):
#         payload = authenticate_user(request)

#         try: 
#             user = User.objects.filter(id=payload['id']).first()
#             serializers = UserSerializer(user)
#             return Response(serializers.data)
        
#         except Exception as e:
#             print(f"An error occurred while getting the user: {e}")
#             return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# @api_view(['POST'])
# def login_view(request):
#     '''
#     DEPRECATED
#     '''
#     email = request.data['email']
#     password = request.data['password']

#     user = authenticate(request, email=email, password = password)

#     if user is not None:
#         login(request, user)

#     if user is None:
#         raise AuthenticationFailed('Invalid credentials!')

#     response=Response()

#     payload = {
#         'id': user.id,
#         'name': user.name,
#         'email': user.email,
#         'is_superuser':user.is_superuser,
#         'exp': datetime.now(timezone.utc) + timedelta(minutes=60),
#         'iat': datetime.now(timezone.utc)
#     }
#     token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
#     response.set_cookie(key='jwt_token', value=token, httponly=True, samesite='None', secure=True, max_age=3600)

#     csrf_token = get_token(request)
#     response.set_cookie(key='csrftoken', value=csrf_token, httponly=False, samesite='None', secure=True)

#     response.data = {"message": "Successfully logged in."}
#     return response

# @api_view(['POST'])
# def logout_view(request):
#     '''
#     DEPRECATED
#     '''
#     logout(request)

#     # Create the response object
#     response = Response({"message": "Successfully logged out."}, status=200)

#     # Delete the CSRF token from the response cookies
#     response.delete_cookie('csrftoken')
#     # Delete the jwt_token cookie
#     response.delete_cookie('jwt_token')

#     print("response: ", response)

#     return response

def index(request):
    return HttpResponse("Hello, world. You're at the Project index.")
    
@role_required(allowed_roles=['Administrator'], allowed_methods=['PUT'])
def update_user(request, id):
    user = User.objects.get(id=id)

    serializer = UserSerializer(user, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@role_required(allowed_roles=['Administrator'], allowed_methods=['DELETE'])
def delete_user(request, id):
    user = User.objects.get(id=id)
    user.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

def azure_ad_login(request):
    client = ConfidentialClientApplication(
        settings.AZURE_AD_CLIENT_ID,
        authority=f"https://login.microsoftonline.com/{settings.AZURE_AD_TENANT_ID}",
        client_credential=settings.AZURE_AD_CLIENT_SECRET
    )
    auth_url = client.get_authorization_request_url(
        scopes=["User.Read"],
        redirect_uri=settings.AZURE_AD_REDIRECT_URI
    )
    return redirect(auth_url)


def azure_ad_callback(request):
    code = request.GET.get('code')
    if not code:
        return redirect('login')

    client = ConfidentialClientApplication(
        settings.AZURE_AD_CLIENT_ID,
        authority=f"https://login.microsoftonline.com/{settings.AZURE_AD_TENANT_ID}",
        client_credential=settings.AZURE_AD_CLIENT_SECRET
    )

    result = client.acquire_token_by_authorization_code(
        code,
        scopes=["User.Read"],
        redirect_uri=settings.AZURE_AD_REDIRECT_URI
    )

    if "access_token" in result:
        # Call Microsoft Graph to get the user's profile details
        headers = {
            'Authorization': f"Bearer {result['access_token']}",
        }
        user_info = requests.get('https://graph.microsoft.com/v1.0/me', headers=headers).json()
        email = user_info.get('mail')

        if email:
            # Try to find the user in your database
            user = User.objects.filter(email=email).first()

            if user is None:
                # Optionally, create the user if they don't exist
                user = User.objects.create_user(email=email, password=None)
                user.save()

            # Authenticate and log the user in Django
            login(request, user)

            return redirect('/api/projects/')  # Or wherever you want to redirect after login
        else:
            return render(request, 'error.html', {'error': 'Failed to retrieve user email from Microsoft Graph'})
    else:
        return render(request, 'error.html', {'error': result.get('error_description')})



def check_mfa_status(access_token):
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json',
    }
    response = requests.get(
        'https://graph.microsoft.com/v1.0/me/authentication/methods',
        headers=headers
    )
    if response.status_code == 200:
        methods = response.json()
        for method in methods['value']:
            if method['@odata.type'] == '#microsoft.graph.microsoftAuthenticatorAuthenticationMethod':
                return True  # User has Microsoft Authenticator set up
    return False
