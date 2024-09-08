from django.core.management.base import BaseCommand, CommandError
from Trinity_Project.models import Project, User
from ...azure_file_share import AzureFileShareClient

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
        ]

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