from django.core.management.base import BaseCommand, CommandError
from Trinity_Project.models import Project, User
from Trinity_Project.azure_file_share import AzureFileShareClient

class Command(BaseCommand):
    help = 'Creates Example Projects'

    def handle(self, *args, **options):
        # Create Example Projects
        projects = [
            {
                'project_id': '010124-Q1-001',
                'project_name': 'Weslaco Library',
                'manager': 'Sean',
                'client_name': 'City of Weslaco',
                'city': 'Weslaco',
                'start_date': '2022-01-01',
                'end_date': '2022-12-31',
                'notes': '',
                'status': 'Completed',
                'folder_location': '010124-Q1-001',
                'template': 'default'
            },
            {
                'project_id': '042022-Q2-001',
                'project_name': 'McAllen Pool',
                'manager': 'Israel',
                'client_name': 'City of McAllen',
                'city': 'McAllen',
                'start_date': '2022-04-20',
                'end_date': '2022-12-31',
                'notes': 'Make a good pool',
                'status': 'Active',
                'folder_location': '042022-Q2-001',
                'template': 'default'
            },
            {
                'project_id': '052023-Q2-002',
                'project_name': 'The Flux',
                'manager': 'Matthew',
                'client_name': 'Mateo Gonzalez',
                'city': 'Edinburg',
                'start_date': '2023-05-20',
                'end_date': '2023-10-31',
                'notes': '',
                'status': 'Completed',
                'folder_location': '052023-Q2-002',
                'template': 'default'
            },
            {
                'project_id': '072025-Q3-001',
                'project_name': 'Houston Round 1',
                'manager': 'Jose',
                'client_name': 'Round 1',
                'city': 'Houston',
                'start_date': '2025-07-20',
                'end_date': '2025-12-01',
                'notes': 'Get er done',
                'status': 'Active',
                'folder_location': '072025-Q3-001',
                'template': 'default'
            },
            {
                'project_id': '082025-Q3-002',
                'project_name': 'ECISD Bar',
                'manager': 'Jose',
                'client_name': 'ECISD',
                'city': 'Edinburg',
                'start_date': '2025-08-20',
                'end_date': '2025-10-01',
                'notes': 'Make sure it has at least three pool tables',
                'status': 'Not Started',
                'folder_location': '082025-Q3-002',
                'template': ''
            },
            {
                'project_id': '082023-Q3-001',
                'project_name': 'Greenhouse',
                'manager': 'Sean',
                'client_name': 'Greenhouse Man', 
                'city': 'McAllen',
                'start_date': '2023-08-20',
                'end_date': '2023-10-01',
                'notes': 'More greenhouse stuff',
                'status': 'Not Started',
                'folder_location': '082025-Q3-003',
                'template': ''
            },
            {
                'project_id': '122024-Q4-001',
                'project_name': 'Residential Pool',
                'manager': 'Sean',
                'client_name': 'The Johnsons',
                'city': 'Edinburg',
                'start_date': '2024-12-20',
                'end_date': '2025-05-01',
                'notes': 'More pools',
                'status': 'Not Started',
                'folder_location': '082025-Q3-004',
                'template': 'default'
            }
        ]

        # Create Employees
        employees = [
            {
                'name': 'Sean',
                'email': 'sean@example.com',
                'password': '123',
                'role': 'Manager',
                'date_joined': '2022-01-01'
            },
            {
                'name': 'Israel',
                'email': 'israel@example.com',
                'password': '123',
                'role': 'Manager',
                'date_joined': '2022-01-01'
            },
            {
                'name': 'Matthew',
                'email': 'matthew@example.com',
                'password': '123',
                'role': 'Manager',
                'date_joined': '2022-01-01'
            },
            {
                'name': 'Jose',
                'email': 'jose@example.com',
                'password': '123',
                'role': 'Manager',
                'date_joined': '2022-01-01'
            }
        ]
        
        for employee in employees:
            try:
                User.objects.create_user(**employee)
                print(f"Employee '{employee['name']}' created successfully!")
            except Exception as ex:
                print(f"An error occurred while creating employee: {ex}")

        for project in projects:
            try:
                Project.objects.create(**project)

                folder = AzureFileShareClient()
                
                if project['template'] == '':
                    folder.create_empty_project_folder(project['folder_location'])
                else:
                    folder.create_template_project_folder(project['folder_location'], project['template'])

                print(f"Project '{project['project_name']}' created successfully in Azure File Share!")
            except Exception as ex:
                print(f"An error occurred while creating project: {ex}")

        self.stdout.write(self.style.SUCCESS('Successfully created example projects!'))