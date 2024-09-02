from azure.storage.fileshare import ShareServiceClient
from django.conf import settings

def get_share_service_client():
    connection_string = settings.AZURE_FILE_SHARE_CONNECTION_STRING
    share_service_client = ShareServiceClient.from_connection_string(connection_string)
    return share_service_client

def create_folder_in_file_share(folder_name):
    # Get the share service client
    share_service_client = get_share_service_client()

    # Get the file share client
    file_share_name = settings.AZURE_FILE_SHARE_NAME
    file_share_client = share_service_client.get_share_client(file_share_name)

    # Create a directory (folder)
    directory_client = file_share_client.get_directory_client(folder_name)
    directory_client.create_directory()

    print(f"Folder '{folder_name}' created successfully in Azure File Share!")
