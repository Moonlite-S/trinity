from django.core.management.base import BaseCommand, CommandError
from Trinity_Project.models import Project, User
from Trinity_Project.azure_file_share import AzureFileShareClient
from Trinity_Project.management.commands.dummy_projects import projects
from Trinity_Project.management.commands.dummy_employees import employees
from django.db import connection

class Command(BaseCommand):
    help = 'Creates Example Projects'

    def handle(self, *args, **options):
        for employee in employees:
            try:
                if employee['name'] == 'admin':
                    User.objects.create_superuser(**employee)
                else:
                    User.objects.create_user(**employee)
                print(f"Employee '{employee['name']}' created successfully!")
            except Exception as ex:
                print(f"An error occurred while creating employee: {ex}")
                #User.objects.all().delete()
                #self.stdout.write(self.style.ERROR('All users deleted successfully!'))
                return

        for project in projects:
            try:
                print(project['manager'])
                manager_obj = User.objects.get(email=project['manager'])
                
                project_data = project.copy()
                project_data.pop('manager', None)

                Project.objects.create(manager=manager_obj, **project_data)

                folder = AzureFileShareClient()
                
                if project['template'] == '':
                    folder.create_empty_project_folder(project['folder_location'])
                else:
                    folder.create_template_project_folder(project['folder_location'], project['template'])

                print(f"Project '{project['project_name']}' created successfully in Azure File Share!")
            except Exception as ex:
                self.stdout.write(self.style.ERROR(f"An error occurred while creating project: {ex} ! Please fix them and try again."))
                # Drops entire project if an error occurs
                Project.objects.all().delete()
                self.stdout.write(self.style.ERROR('All projects deleted successfully!'))
                return



        self.stdout.write(self.style.SUCCESS('Successfully created example projects!'))