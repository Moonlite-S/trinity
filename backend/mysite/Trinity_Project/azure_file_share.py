import os
from azure.storage.fileshare import ShareServiceClient, ShareDirectoryClient
from azure.core.exceptions import ResourceExistsError
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


def create_project_in_file_share(folder_name) -> None:
    '''
    ## Creates a Default Structured Project Folder in the Azure File Share Cloud Storage
    ### Folder Structure: projects/project_name/folder_name
    #### Currently only creates 3 folders: Folder1, Folder2, Folder3
    '''

    PARENT_FOLDER = "projects/"
    SUB_FOLDER = PARENT_FOLDER + folder_name + "/"
    DEFAULT_TEST_FOLDERS = ["Folder1", "Folder2", "Folder3"]

    try:
        # Get the share service client
        share_service_client = get_share_service_client()

        # Get the file share client
        file_share_name = settings.AZURE_FILE_SHARE_NAME
        file_share_client = share_service_client.get_share_client(file_share_name)

        parent_dir = file_share_client.get_directory_client(PARENT_FOLDER)

        # Creates the parent directory if it doesn't exist
        if not parent_dir.exists():
            parent_dir.create_directory()

        # Create a directory (folder)
        directory_client = file_share_client.get_directory_client(PARENT_FOLDER + folder_name)
        directory_client.create_directory()


        # Add Subfolders to the folder
        for file_name in DEFAULT_TEST_FOLDERS:
            print(f"Creating file '{file_name}' in folder '{folder_name}'...")
            directory_client = file_share_client.get_directory_client(SUB_FOLDER + file_name)
            directory_client.create_directory()

        # Load from template
        # template = load_from_template(folder_name)

        print(f"Folder '{folder_name}' created successfully in Azure File Share!")

    except ResourceExistsError as ex:
        print(f"Error Creating Folder. Folder '{folder_name}' already exists: {ex}")
        # If an error occurs during creation, delete any folders that were created to avoid any resource leaks

    except Exception as ex:
        print(f"Error Creating Folder: {ex}")

def load_from_template(folder_name) -> ShareDirectoryClient:
    '''
    ## Loads a file from a template in the Azure File Share Cloud Storage
    ### Folder Structure: templates/folder_name
    @folder_name: The type of template you want to load (basic only)

    TODO: 
    - DOESN'T WORK YET
    - Have a dynamic template loader
    - Add more templates
    '''
    TEMPLATE_PATH = "templates/" + folder_name

    try:
        # Get the share service client
        share_service_client = get_share_service_client()

        # Get the file share client
        file_share_name = settings.AZURE_FILE_SHARE_NAME
        file_share_client = share_service_client.get_share_client(file_share_name)

        # Retrive folder
        directory_client = file_share_client.get_directory_client(TEMPLATE_PATH)

        if not directory_client.exists():
            raise Exception(f"Folder '{TEMPLATE_PATH}' does not exist in Azure File Share! This is required for this function to work.")
        
        return directory_client

    except Exception as ex:
        RuntimeError(f"Error Loading Template Folder: {ex}")

def create_template_folder(folder_name) -> None:
    '''
    ## Creates a Template Folder in the Azure File Share Cloud Storage
    ### Folder Structure: templates/folder_name
    @folder_name: The type of template you want to load (basic only)

    TODO:
       - Not working
    '''

    TEMPLATE_PATH = "templates/" + folder_name

    # DEBUG: Creating text files
    text_file = open("test.txt", "x+")
    text_file.write("This is a test file")

    try:
        # Get the share service client
        share_service_client = get_share_service_client()

        # Get the file share client
        file_share_name = settings.AZURE_FILE_SHARE_NAME
        file_share_client = share_service_client.get_share_client(file_share_name)

        # Create a directory (folder)
        directory_client = file_share_client.get_directory_client(TEMPLATE_PATH)

        if not directory_client.exists():
            print(f"Creating folder '{TEMPLATE_PATH}' in Azure File Share...")
            directory_client.create_directory()
        
        # Adding a file
        directory_client.upload_file("test.txt")

        print(f"Folder '{folder_name}' created successfully in Azure File Share!")

    except ResourceExistsError as ex:
        print(f"Error Creating Folder. Folder '{folder_name}' already exists: {ex}")

    except Exception as ex:
        print(f"Error Creating Template Folder: {ex}")

    finally:
        # Remove the created text file [DEBUG ONLY]
        text_file.close()
        os.remove("test.txt")
    
def add_files_to_folder(folder_name, file_name, file_path):
    '''
    ## Adds a file(s) to an existing folder in the Azure File Share Cloud Storage

    TODO: this later
    '''
    pass