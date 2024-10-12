import json
from urllib.parse import parse_qs, urlparse
import webbrowser
from msal import ConfidentialClientApplication, PublicClientApplication
import requests
import os
from dotenv import load_dotenv

load_dotenv()

class GraphAPI():
    '''
    ###A class that uses MSAL for authentication and user profiles.
    Ideally, this is how we're going to authenticate our users.
    '''
    MS_GRAPH_API_URL = 'https://graph.microsoft.com/v1.0'

    def __init__(self):
        self.client_id = '44b016a4-9378-4875-9473-7033edbc120b'
        self.authority = "https://login.microsoftonline.com/consumers"
        self.scopes = ["Files.Read", "Files.ReadWrite"]
        self.redirect_uri = "http://localhost:8000"

        self.app = PublicClientApplication(
            self.client_id,
            authority=self.authority
        )

        self.access_token = self.get_access_token()

    def get_access_token(self):
        accounts = self.app.get_accounts()
        if accounts:
            result = self.app.acquire_token_silent(self.scopes, account=accounts[0])
            if result:
                return result['access_token']

        flow = self.app.initiate_auth_code_flow(scopes=self.scopes, redirect_uri=self.redirect_uri)
        auth_url = flow['auth_uri']
        
        print(f"Please go to this URL and authorize the app: {auth_url}")
        webbrowser.open(auth_url)
        
        auth_response = input("Enter the full redirect URL: ")
        
        parsed_url = urlparse(auth_response)
        query_dict = parse_qs(parsed_url.query)
        
        auth_response_dict = {
            'code': query_dict.get('code', [None])[0],
            'state': query_dict.get('state', [None])[0],
        }
        
        result = self.app.acquire_token_by_auth_code_flow(flow, auth_response_dict)

        if "access_token" in result:
            return result["access_token"]
        else:
            print("Full error response:")
            print(json.dumps(result, indent=2))
            raise Exception(f'No access token found. Error: {result.get("error")}. Error description: {result.get("error_description")}')

    def get_folder_link(self, folder_name):
        headers = {'Authorization': f'Bearer {self.access_token}'}
        
        # First, check in root folders
        root_folders = self.list_root_folders()
        for name, url in root_folders:
            if name.lower() == folder_name.lower():
                return url
        
        # If not found in root, search in all folders
        search_url = f'{self.MS_GRAPH_API_URL}/me/drive/root/search(q=\'{folder_name}\')'
        response = requests.get(search_url, headers=headers)
        
        if response.status_code == 200:
            search_results = response.json().get('value', [])
            for item in search_results:
                if item.get('name').lower() == folder_name.lower() and item.get('folder'):
                    return item.get('webUrl')
            
            print(f"Folder '{folder_name}' not found.")
            return None
        else:
            print("Error response:")
            print(json.dumps(response.json(), indent=2))
            raise Exception(f'Failed to search for folder. Status code: {response.status_code}')
    
    def list_root_folders(self):
        headers = {'Authorization': f'Bearer {self.access_token}'}
        
        # Query parameters to filter for only folders and select specific fields
        params = {
            '$filter': 'folder ne null',
            '$select': 'name,webUrl'
        }
        
        response = requests.get(f'{self.MS_GRAPH_API_URL}/me/drive/root/children', headers=headers, params=params)
        
        if response.status_code == 200:
            folders = response.json().get('value', [])
            return [(folder['name'], folder['webUrl']) for folder in folders]
        else:
            print("Error response:")
            print(json.dumps(response.json(), indent=2))
            raise Exception(f'Failed to list root folders. Status code: {response.status_code}')
        
    
    def create_online_meeting():
        token = GraphAPI.get_access_token()
        if token is None:
            return "Authentication failed"

        url = 'https://graph.microsoft.com/v1.0/me/onlineMeetings'
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        meeting_details = {
            "subject": "Team Call",
            "startDateTime": "2024-09-30T14:30:00Z",  # Format: ISO8601
            "endDateTime": "2024-09-30T15:00:00Z",
            "participants": {
                "attendees": [
                    {
                        "identity": {
                            "user": {
                                "id": "<user-id>"  # User ID of the participant
                            }
                        }
                    }
                ]
            }
        }

        response = requests.post(url, json=meeting_details, headers=headers)
        return response.json()
