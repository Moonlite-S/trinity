from azure.storage.fileshare import ShareServiceClient, ShareClient, ShareDirectoryClient
from azure.core.exceptions import ResourceExistsError, ResourceNotFoundError
from django.conf import settings

class AzureFileShareClient:
    '''
    ### Creates a client class for the Azure File Share Cloud Storage
    You must set *AZURE_FILE_SHARE_CONNECTION_STRING* and *AZURE_FILE_SHARE_NAME*, which come from settings.py  
    #### Currently can do the following:
    - Create Folder
    - Create Subfolders
    - Create Project (either empty or with template)

    So far, you NEED to have two folders in your main file share directory: "projects" and "templates"

    The templates folder should have a "default" folder filled with random stuff.

    (I'll automate the creation of this stuff later...)

    TODO:
    - Create Template Folder
    - Upload Files to Project Folder
    - Maybe make the init function automatically get the folder location at init
    '''
    def __init__(self) -> None:
        self.BASE_PATH = "projects/"
        self.DEFAULT_TEMPLATE_PATH = "templates/"

        self.connection_string: str = settings.AZURE_FILE_SHARE_CONNECTION_STRING
        self.share_service_client: ShareServiceClient = ShareServiceClient.from_connection_string(self.connection_string)

        self.file_share_name: str = settings.AZURE_FILE_SHARE_NAME
        self.file_share_client: ShareClient = self.share_service_client.get_share_client(self.file_share_name)
    
    def create_folder_directory(self, folder_path_name: str) -> ShareDirectoryClient:
        '''
        #### Creates an empty folder in the given folder name
        
        :param str folder_path_name: The path to the folder to create
        :return: a ShareDirectoryClient for further operations
        '''
        directory_client = self.file_share_client.get_directory_client(self.BASE_PATH + folder_path_name)

        try:
            directory_client.create_directory()
            print(f"Folder '{folder_path_name}' created successfully in Azure File Share!")

        except ResourceExistsError:
            print(f"Folder '{folder_path_name}' already exists in this directory! Aborting...")
        
        except Exception as ex:
            print(f"An error occurred while creating folder '{folder_path_name}' in Azure File Share: {ex}")
            raise ex

        return directory_client

    def create_sub_folder_directory(self, folder_path_name: str, sub_folder_name: str) -> ShareDirectoryClient:
        '''
        #### Creates an empty subfolder in the given folder name
        
        :param str folder_path_name: The path to the folder to create
        :param str sub_folder_name: The name of the subfolder
        :return: A ShareDirectoryClient for further operations
        '''
        directory_client = self.file_share_client.get_directory_client(self.BASE_PATH + folder_path_name)

        if not directory_client.exists():
            print(f"Folder {folder_path_name} does not exist! Aborting...")
            raise ResourceNotFoundError(f"Folder {folder_path_name} does not exist!")

        try:
            directory_client.create_subdirectory(sub_folder_name)

        except ResourceExistsError:
            print(f"SubFolder '{sub_folder_name}' already exists in this directory! Aborting...")
            # raise ResourceExistsError(f"SubFolder '{sub_folder_name}' already exists in this directory!")

        except Exception as ex:
            print(f"An error occurred while creating SubFolder '{sub_folder_name}' in Azure File Share: {ex}")
            raise ex
        
        return directory_client

    def upload_file(self, folder_path_name: str, file_name: str, file_path: str):
        '''CURRENTLY NOT TESTED.'''
        directory_client = self.file_share_client.get_directory_client(folder_path_name)
        directory_client.upload_file(file_path, file_name)

        print(f"File '{file_name}' uploaded successfully to folder '{folder_path_name}' in Azure File Share!")

    def create_empty_project_folder(self, folder_path_name: str) -> None:
        self.create_folder_directory(folder_path_name)

        print(f"Folder '{folder_path_name}' created successfully in Azure File Share!")

        self.create_sub_folder_directory(folder_path_name, "Submittals")
        self.create_sub_folder_directory(folder_path_name, "Documents")

    def create_template_project_folder(self, folder_path_name: str, template_name: str) -> None:
        '''
        #### Creates a new project folder from a template

        template_name must be the name of the template folder in the templates directory

        That folder will be copied into the new project folder

        :param str folder_path_name: 
            The path to the parent folder to create
        :param str template_name:
            The name of the template to use
        '''
        template_dir = self.file_share_client.get_directory_client(self.DEFAULT_TEMPLATE_PATH + template_name + "/")

        if not template_dir.exists():
            print(f"Template '{template_name}' does not exist! Aborting...")
            raise ResourceNotFoundError(f"Template '{template_name}' does not exist!")
        
        try:
            dest_folder = self.create_folder_directory(folder_path_name)
            self.recursively_create_template_project_folder(folder_path_name, template_dir, dest_folder)

        except ResourceExistsError:
            print(f"Folder '{folder_path_name}' already exists in this directory! Skipping...")
            
        except Exception as ex:
            print(f"An error occurred while creating the project: {ex}. Deleting project folder...")
            self.delete_project_folder(folder_path_name)
            raise ex

    def recursively_create_template_project_folder(self, folder_path_name: str, template_dir: ShareDirectoryClient, dest_folder: ShareDirectoryClient) -> None:
        files = template_dir.list_directories_and_files()
        
        # Base Case
        if not files:
            return

        for file in files:
            if file.is_directory:
                dest_sub_folder = dest_folder.create_subdirectory(file.name)
                template_sub_dir = template_dir.get_subdirectory_client(file.name)

                # Recurisvely gather and create subfolders
                self.recursively_create_template_project_folder(folder_path_name + "/" + file.name, template_sub_dir, dest_sub_folder)
            else:
                template_file = template_dir.get_file_client(file.name)
                dest_file = dest_folder.get_file_client(file.name)

                dest_file.start_copy_from_url(template_file.url)

    def delete_project_folder(self, folder_path_name: str) -> None:
        try:
            self.recursively_delete_project_folder(self.BASE_PATH + folder_path_name)

            print(f"Folder '{folder_path_name}' deleted successfully in Azure File Share!")

        except ResourceNotFoundError:
            print(f"Folder '{folder_path_name}' does not exist! Maybe it was already deleted...")

        except Exception:
            raise Exception(f"An error occurred while deleting folder '{folder_path_name}' in Azure File Share!")
        
    def recursively_delete_project_folder(self, folder_path_name: str) -> None:
        folder_to_delete = self.file_share_client.get_directory_client(folder_path_name)
        files = folder_to_delete.list_directories_and_files()

        # Base Case
        if not files:
            return

        for file in files:
            if file.is_directory:
                self.recursively_delete_project_folder(folder_path_name + "/" + file.name)
            else:
                folder_to_delete.delete_file(file.name)

        folder_to_delete.delete_directory()
