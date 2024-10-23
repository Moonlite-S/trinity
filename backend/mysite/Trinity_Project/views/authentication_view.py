from os import name
from django.http import HttpResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from ..models import User
from ..serializers import UserSerializer
from rest_framework.views import APIView
import jwt
from django.contrib.auth import authenticate,login,logout
from django.middleware.csrf import get_token
from django.shortcuts import redirect, render
from msal import ConfidentialClientApplication
from django.conf import settings
import requests
import logging

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

#this will show you the microsoft login 
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

#This would check email
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
        email = user_info.get('mail') #get the Microsoft email
        name = user_info.get('displayName') #get the name from the displayName field

        if email:
            # Try to find the user in your database
            user = User.objects.filter(email=email).first()

            if user is None:
                # Optionally, create the user if they don't exist
                user = User.objects.create_user(email=email, password=None,name=name)
                user.save()

            # Authenticate and log the user in Django
            login(request, user)
            #This is where you will be sent to after the login was successful
            return redirect('/api/projects/')  # Or wherever you want to redirect after login
        else:
            #This is error would sent if we can get the email
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

def azure_ad_logout(request):
    # Log out the user locally
    logout(request)

    # Log out from Azure AD
    azure_logout_url = (
        f"https://login.microsoftonline.com/{settings.AZURE_AD_TENANT_ID}/oauth2/v2.0/logout"
        f"?post_logout_redirect_uri={settings.AZURE_AD_POST_LOGOUT_REDIRECT_URI}"
    )

    # Redirect to Azure AD logout endpoint, and then back to your app
    return redirect(azure_logout_url)