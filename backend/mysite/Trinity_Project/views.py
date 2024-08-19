from django.shortcuts import get_object_or_404, render
from django.http import HttpResponse, JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Project
from .serializers import ProjectSerializer

# Create your views here.

def index(request):
    return HttpResponse("Hello, world. You're at the Project index.")

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

@api_view(['GET','PUT','DELETE'])
def project_detail(request, project_id):
    
    try:
        project=Project.objects.get(project_id=project_id)
    except Project.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = ProjectSerializer(project)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = ProjectSerializer(project, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        project.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    