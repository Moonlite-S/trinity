from os import name
from django.http import HttpResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from ..models import Project,Task
from ..serializers import TaskSerializer
from django.contrib.auth.decorators import login_required
from rest_framework.exceptions import PermissionDenied
from ..models import PendingChange


@login_required
@api_view(['GET','POST'])
def task_list(request):

    if request.method == 'GET':
        tasks = Task.objects.all()
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        serializer = TaskSerializer(data=request.data)


        if serializer.is_valid():
            print("Valid data:", serializer.validated_data) # Debug
            serializer.save()
            print("Serializer errors:", serializer.errors) # Debug
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@login_required
@api_view(['GET','PUT','DELETE'])
def task_detail(request, task_id):
    try:
        task=Task.objects.get(task_id=task_id)
    except Task.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    
    if not task.is_approved:
        return HttpResponse("This task is pending approval and cannot be viewed.")
    
    print(f"Task project_id: {task.project_id}")
    #get project manager name from project_id
    try:
        project=Project.objects.get(project_id=task.project_id)
        manager=project.manager
    except Project.DoesNotExist:
        return Response({"error": "Associated project not found"}, status=status.HTTP_404_NOT_FOUND)

    user = request.user

    if request.method == 'GET':
        serializer = TaskSerializer(task)
        return Response(serializer.data)

    elif request.method == 'PUT':
        # if manager != user.name and not user.is_superuser:
        #     raise PermissionDenied("You do not have permission to edit this task.")
        serializer = TaskSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            # For each field, check if the value has changed
            for field, new_value in serializer.validated_data.items():
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

            # Mark the project as pending approval
            task.is_approved = False
            task.save(update_fields=['is_approved'])
            return Response({"detail": "Changes have been submitted for approval."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        if manager != user.name and not user.is_superuser:
            raise PermissionDenied("You do not have permission to delete this task.")
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@login_required
@api_view(['GET'])
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

@login_required
@api_view(['GET'])
def task_filter_by_project_id(request, project_id):
    #project=User.objects.get(project_id=project_id)
    #user = request.user
    
    try:
        tasks=Task.objects.filter(project_id=project_id)
    except Task.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        if tasks.count() ==1:
            serializer = TaskSerializer(tasks.first())
        else:
            serializer = TaskSerializer(tasks,many=True)
        return Response(serializer.data)