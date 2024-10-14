from os import name
import random
from django.http import HttpResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from ..utils import authenticate_user, role_required
from ..models import Project,Task, User
from ..serializers import TaskSerializer
from django.contrib.auth.decorators import login_required
from rest_framework.exceptions import PermissionDenied
from ..models import PendingChange
import string

@role_required(allowed_roles=['Manager', 'Administrator', 'Team Member'], allowed_methods=['GET', 'POST'])
def task_list(request):

    if request.method == 'GET':
        tasks = Task.objects.all()
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        branch = 'E'
        project_id = request.data['project_id']
        unique_id = ''.join(random.choices(string.digits, k=3))

        task_id = "TK" + "-" + branch + "-" + project_id + "-" + unique_id

        print(task_id)

        # If we have a collision, we will generate a new task ID
        # Shouldn't happen too often, if at all
        while Task.objects.filter(task_id=task_id).exists():
            print("Collision Detected, Generating New Task ID...")
            task_id = "TK" + "-" + branch + "-" + project_id + "-" + ''.join(random.choices(string.digits, k=3))
            print("New Task ID: ", task_id)

        request.data['task_id'] = task_id

        # Get assigned_to from request data and check if it exists
        serializer = TaskSerializer(data=request.data)

        if serializer.is_valid():
            # Get assigned_to from request data and cross check it with the User model
            # Same with Project model
            assigned_to = serializer.validated_data.pop('assigned_to')
            project_id = serializer.validated_data.pop('project_id')
            task_id = serializer.validated_data.pop('task_id')

            try: 
                user = User.objects.get(email=assigned_to)
                project = Project.objects.get(project_id=project_id)

                task = Task.objects.create(
                    assigned_to=user,
                    project_id=project,
                    task_id=task_id,
                    **serializer.validated_data
                )

                return Response(TaskSerializer(task).data, status=status.HTTP_201_CREATED)

            except User.DoesNotExist:
                print("User does not exist")
                return Response({"error": f"User with email {assigned_to} does not exist."}, status=status.HTTP_404_NOT_FOUND)
            
            except Project.DoesNotExist:
                print("Project does not exist")
                return Response({"error": f"Project with ID {project_id} does not exist."}, status=status.HTTP_404_NOT_FOUND)
            
            except Exception as ex:
                print(f"An error occurred while creating the task: {ex}")
                return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@role_required(allowed_roles=['Manager', 'Administrator', 'Team Member'], allowed_methods=['GET', 'PUT', 'DELETE'])
def task_detail(request, task_id):
    try:
        task=Task.objects.get(pk=task_id)
    except Task.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    user = request.user
    
    if not task.is_approved and (not user.role == 'Manager' or not user.role == 'Administrator'):
        return HttpResponse("This task is pending approval and cannot be viewed.")
    
    #get project manager name from project_id
    try:
        project=Project.objects.get(project_id=task.project_id.project_id) # Naming convention sucks btw. the first project_id is the model object of project, the second is the actual project id
        manager=project.manager
    except Project.DoesNotExist:
        return Response({"error": "Associated project not found"}, status=status.HTTP_404_NOT_FOUND)


    if request.method == 'GET':
        serializer = TaskSerializer(task)
        return Response(serializer.data)

    elif request.method == 'PUT':
        # if manager != user.name and not user.is_superuser:
        #     raise PermissionDenied("You do not have permission to edit this task.")
        serializer = TaskSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            manager_obj = serializer.validated_data.pop('assigned_to')
            project_obj = serializer.validated_data.pop('project_id')
            try:
                print(f"Project ID: {project_obj}")
                manager = User.objects.get(email=manager_obj)
                project = Project.objects.get(project_id=project_obj)
            except User.DoesNotExist:   
                return Response(data={"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            
            except Project.DoesNotExist:
                return Response(data={"error": "Project not found"}, status=status.HTTP_404_NOT_FOUND)
            
            serializer.validated_data['assigned_to'] = manager  
            serializer.validated_data['project_id'] = project

            for field, new_value in serializer.validated_data.items():
                try:
                    old_value = getattr(task, field)
                
                    if old_value != new_value:
                        # Create a PendingChange entry instead of saving directly
                        PendingChange.objects.create(
                            task=task,
                            field_name=field,
                            old_value=old_value,
                            new_value=new_value,
                            requested_by=user
                        )
                except Exception as ex:
                    print(f"An error occurred while creating the pending change: {ex}")
                
            # Mark the project as pending approval
            # Marked as approved for now (DEBUG)
            task.is_approved = True
            task.save(update_fields=['is_approved'])

            serializer.save()

            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        if manager != user.name and not user.is_superuser:
            raise PermissionDenied("You do not have permission to delete this task.")
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@role_required(allowed_roles=['Manager', 'Administrator', 'Team Member'], allowed_methods=['GET'])
def task_filter_by_name(request, name):

    #user = request.user
    try:
        tasks=Task.objects.filter(assigned_to=name)
    except Task.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        if tasks.count() ==1:
            serializer = TaskSerializer(tasks.first())
        else:
            serializer = TaskSerializer(tasks,many=True)
    
        return Response(serializer.data)

@role_required(allowed_roles=['Manager', 'Administrator', 'Team Member'], allowed_methods=['GET'])
def task_filter_by_project_id(request, project_id):
    #project=User.objects.get(project_id=project_id)
    #user = request.user
    
    try:
        tasks=Task.objects.filter(project_id=project_id)
    except Task.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        serializer = TaskSerializer(tasks,many=True)
        return Response(serializer.data)
    
@role_required(allowed_roles=['Manager', 'Administrator', 'Team Member'], allowed_methods=['GET'])
def task_filter_by_all_user_projects(request, email):
    '''
    ### This API returns all tasks associated with all projects that a team member is assigned to

    @param email: The email of the user
    @return: A list of tasks
    '''
    payload = authenticate_user(request)
    try:
        # Get the user
        user = User.objects.get(email=email)

        user_projects = Project.objects.filter(tasks__assigned_to=user).distinct()

        # Get all tasks associated with these projects
        tasks = Task.objects.filter(project_id__in=user_projects)

        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
   
@role_required(allowed_roles=['Manager', 'Administrator', 'Team Member'], allowed_methods=['GET'])
def task_filter_by_user(request, email):

    #user = request.user
    try:
        user = User.objects.get(email=email)
        tasks=Task.objects.filter(assigned_to=user)

    except Task.DoesNotExist:
        return Response(data={"error": "Task not found."}, status=status.HTTP_404_NOT_FOUND)
    except User.DoesNotExist:
        return Response(data={"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = TaskSerializer(tasks,many=True)
    
        return Response(serializer.data)
    
@role_required(allowed_roles=['Manager', 'Administrator', 'Team Member'], allowed_methods=['GET'])
def task_creation_data(request):
    payload = authenticate_user(request)

    data_to_send = {}

    # Gets all active projects
    projects = Project.objects.filter(status='ACTIVE').values_list('project_id', 'project_name')
    data_to_send['projects'] = list(projects)
    
    # Gets all active employees
    employees = User.objects.filter(role__in=['Manager', 'Administrator', 'Team Member'], is_active=True).values_list('email', 'name')
    data_to_send['employees'] = list(employees)

    return Response(data_to_send, status=status.HTTP_200_OK)
