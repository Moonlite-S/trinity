from os import name
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from ..azure_file_share import create_folder_in_file_share, copy_template_folder
from ..models import Project
from ..serializers import ProjectSerializer
from django.contrib.auth.decorators import login_required
from rest_framework.exceptions import PermissionDenied

@login_required
@api_view(['GET','POST'])
def project_list(request):

    if request.method == 'GET':
        projects = Project.objects.all()
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        serializer = ProjectSerializer(data=request.data)


        if serializer.is_valid():
            print("Valid data:", serializer.validated_data) # Debug
            serializer.save()
            print("Serializer errors:", serializer.errors) # Debug
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@login_required
@api_view(['GET','PUT','DELETE'])
def project_detail(request, project_id):

    try:
        project=Project.objects.get(project_id=project_id)
    except Project.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    user = request.user

    if request.method == 'GET':
        serializer = ProjectSerializer(project)
        return Response(serializer.data)

    elif request.method == 'PUT':
        if project.manager != user.name and not user.is_superuser:
            raise PermissionDenied("You do not have permission to edit this project.")
        serializer = ProjectSerializer(project, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        if project.manager != user.name and not user.is_superuser:
            raise PermissionDenied("You do not have permission to delete this project.")
        project.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@login_required
@api_view(['GET'])
def project_filter_by_manager(request, manager):

    try:
        project=Project.objects.filter(manager=manager)
    except Project.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        if project.count() == 1:
            serializer = ProjectSerializer(project.first())
        else:
            serializer = ProjectSerializer(project,many=True)
        return Response(serializer.data)

@login_required
@api_view(['GET'])
def project_filter_by_status(request, project_status):
    try:
        project=Project.objects.filter(status=project_status)
    except Project.DoesNotExist:
        return Response(http_status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        if project.count() == 1:
            serializer = ProjectSerializer(project.first())
        else:
            serializer = ProjectSerializer(project,many=True)
        return Response(serializer.data)

@login_required
@api_view(['GET'])
def project_by_date(request):
    
    year = request.GET.get('year')
    month = request.GET.get('month')
    
    if not year:
        return Response({"error": "Year is required."}, status=status.HTTP_400_BAD_REQUEST)
    
    elif not month:
        return Response({"error": "month is required."}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        project=Project.objects.filter(end_date__year=year,end_date__month=month)
    except Project.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        if project.count()==1:
            serializer = ProjectSerializer(project.first())
        else:
            serializer = ProjectSerializer(project,many=True)
            
        return Response(serializer.data)
    
@api_view(['POST'])
def create_azure_file_share_folder_view(request):
    folder_name = request.POST.get('folder_name', 'default_folder')

    create_folder_in_file_share(folder_name)

    return JsonResponse({'message': f'Folder "{folder_name}" created successfully in Azure File Share!'})

@api_view(['POST'])
def copy_template_folder_view(request):
    new_folder_name = request.POST.get('new_folder_name', 'default_new_folder')
    template_folder_name = request.POST.get('template_folder_name', 'template_folder')

    copy_template_folder(new_folder_name, template_folder_name)

    return JsonResponse({
        'message': f"Template folder '{template_folder_name}' copied and renamed to '{new_folder_name}' successfully!"
    })