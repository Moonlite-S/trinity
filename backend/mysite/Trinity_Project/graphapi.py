import json
from msal import ConfidentialClientApplication
import requests
import os
from dotenv import load_dotenv

load_dotenv()

class GraphAPI():
    '''
    ###A class that uses MSAL for authentication and user profiles.
    Ideally, this is how we're going to authenticate our users.

    
    '''

    def __init__(self):
        self.client_id = os.getenv('CLIENT_ID')
        self.client_secret = os.getenv('CLIENT_SECRET')
        self.tenant_id = os.getenv('TENANT_ID')

        self.authority = f"https://login.microsoftonline.com/{self.tenant_id}"

        self.msal_app = ConfidentialClientApplication(
            client_id=self.client_id,
            authority=self.authority,
            client_credential=self.client_secret
        )

        self.scopes = ["https://graph.microsoft.com/.default"]

        self.result = self.msal_app.acquire_token_silent(
            scopes=self.scopes, 
            account=None
        )

        if not self.result:
            self.result = self.msal_app.acquire_token_for_client(scopes=self.scopes)

        if "access_token" in self.result:
            self.access_token = self.result["access_token"]
        else:
            raise Exception('No access_token found.')

    def get_auth_url(self, redirect_uri):
        return self.msal_app.get_authorization_request_url(self.scopes, redirect_uri=redirect_uri)

    def acquire_token_by_code(self, code, redirect_uri):
        return self.msal_app.acquire_token_by_authorization_code(code, scopes=self.scopes, redirect_uri=redirect_uri)

    def get_all_users(self, access_token):
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        response = requests.get('https://graph.microsoft.com/v1.0/users', headers=headers)
        return response

    def test(self):
        print(json.dumps(self.get_all_users(self.access_token).json(), indent=4))

graphapi = GraphAPI()
graphapi.test()