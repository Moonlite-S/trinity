from django.core.management.base import BaseCommand, CommandError
from Trinity_Project.models import Project, User
from Trinity_Project.azure_file_share import AzureFileShareClient
from Trinity_Project.management.commands.dummy_projects import projects
from Trinity_Project.management.commands.dummy_employees import employees
from allauth.account.forms import SignupForm
from django.test import RequestFactory
from allauth.account.models import EmailAddress
from django.contrib.sites.models import Site
from allauth.socialaccount.models import SocialApp
from django.contrib.auth.models import AnonymousUser

class Command(BaseCommand):
    help = 'Creates Example Projects'

    def handle(self, *args, **options):
        factory = RequestFactory()
        
        # Ensure a default Site exists
        site, _ = Site.objects.get_or_create(domain='example.com')
        
        # Create a dummy SocialApp for allauth
        SocialApp.objects.get_or_create(
            provider='microsoft',
            name='Microsoft',
            client_id='dummy_client_id',
            secret='dummy_secret',
            key='',
        )

        # Create Users
        for employee in employees:
            try:
                if employee['name'] == 'admin':
                    User.objects.create_superuser(**employee)
                else:
                    # Create a GET request (for CSRF token)
                    get_request = factory.get('/accounts/signup/')
                    get_request.user = AnonymousUser()
                    get_request.session = {}
                    get_request.site = site

                    # Get CSRF token
                    from django.middleware.csrf import get_token
                    csrf_token = get_token(get_request)

                    # Create a POST request
                    post_request = factory.post('/accounts/signup/', {
                        'email': employee['email'],
                        'password1': employee['password'],
                        'password2': employee['password'],
                        'name': employee['name'],
                        'username': employee['email'],
                        'role': employee['role'],
                        'csrfmiddlewaretoken': csrf_token,
                    })
                    post_request.user = AnonymousUser()
                    post_request.session = {}
                    post_request.site = site

                    form = SignupForm(post_request.POST)
                    if form.is_valid():
                        user = form.save(post_request)
                        user.name = employee['name']
                        user.role = employee['role']
                        user.save()

                        # Verify the email
                        EmailAddress.objects.filter(user=user, email=user.email).update(verified=True)

                        self.stdout.write(self.style.SUCCESS(f"User '{employee['name']}' registered successfully!"))
                    else:
                        self.stdout.write(self.style.ERROR(f"Failed to register user '{employee['name']}': {form.errors}"))

            except Exception as ex:
                print(f"An error occurred while creating employee: {ex}. Skipping...")

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
