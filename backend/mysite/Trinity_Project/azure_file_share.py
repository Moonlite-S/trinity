from azure.storage.fileshare import ShareServiceClient, ShareDirectoryClient
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
    
    subfolder_name = "folder_2"
    subdirectory_client = directory_client.get_subdirectory_client(subfolder_name)
    subdirectory_client.create_directory()

    print(f"Folder '{folder_name}' created successfully in Azure File Share!")

def copy_template_folder(new_folder_name, template_folder_name="template_folder"):
    # Get the share service client
    share_service_client = get_share_service_client()

    # Get the file share client
    file_share_name = settings.AZURE_FILE_SHARE_NAME
    file_share_client = share_service_client.get_share_client(file_share_name)

    # Get the template directory client
    template_directory_client = file_share_client.get_directory_client(template_folder_name)

    # Create the new directory
    new_directory_client = file_share_client.get_directory_client(new_folder_name)
    new_directory_client.create_directory()

    # Recursive copy of the template folder's content
    copy_directory(template_directory_client, new_directory_client)

    print(f"Template folder '{template_folder_name}' copied to '{new_folder_name}' successfully!")

def copy_directory(source_directory_client, target_directory_client):
    # List and copy all files in the current directory
    for file_or_dir in source_directory_client.list_directories_and_files():
        if file_or_dir['is_directory']:
            # If it's a directory, recursively copy the directory
            subdir_source = source_directory_client.get_subdirectory_client(file_or_dir['name'])
            subdir_target = target_directory_client.get_subdirectory_client(file_or_dir['name'])
            subdir_target.create_directory()
            copy_directory(subdir_source, subdir_target)
        else:
            # If it's a file, copy the file
            file_source = source_directory_client.get_file_client(file_or_dir['name'])
            file_target = target_directory_client.get_file_client(file_or_dir['name'])

            # Download file content from the source file
            file_content = file_source.download_file().readall()

            # Upload file content to the target file
            file_target.upload_file(file_content)

            print(f"Copied file '{file_or_dir['name']}' to '{target_directory_client.directory_path}'")