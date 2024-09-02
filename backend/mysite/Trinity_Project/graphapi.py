import msal
import requests
import os
from dotenv import load_dotenv

load_dotenv()

client_id = os.getenv('CLIENT_ID')
client_secret = os.getenv('CLIENT_SECRET')
tenant_id = os.getenv('TENANT_ID')

authority = f"https://login.microsoftonline.com/{tenant_id}"
msal_app = msal.ConfidentialClientApplication(client_id, authority=authority, client_credential=client_secret)

scopes = ["User.Read"]

def get_auth_url(redirect_uri):
    return msal_app.get_authorization_request_url(scopes, redirect_uri=redirect_uri)

def acquire_token_by_code(code, redirect_uri):
    return msal_app.acquire_token_by_authorization_code(code, scopes=scopes, redirect_uri=redirect_uri)

def get_user_profile(access_token):
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    response = requests.get('https://graph.microsoft.com/v1.0/me', headers=headers)
    return response
