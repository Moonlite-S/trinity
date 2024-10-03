from os import name
from rest_framework.response import Response
from rest_framework import status
from ..models import Submittal
from ..serializers import SubmittalSerializer
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view


@login_required
@api_view(['GET','POST'])
def submittal_list(request):
    
    if request.method == 'GET':
        submittals=Submittal.objects.all()
        serializer = SubmittalSerializer(submittals, many=True)
        return Response(serializer.data)
    
    if request.method == 'POST':
        serializer=SubmittalSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@login_required
@api_view(['GET','PUT','DELETE'])
def submittal_detail(request,submittal_id):
    user = request.user
    try:
        submittal=Submittal.objects.get(submittal_id=submittal_id)
    except Submittal.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = SubmittalSerializer(submittal)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = SubmittalSerializer(submittal)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        submittal.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
            

@login_required
@api_view(['GET'])
def submittal_by_assigned_to(request,assigned_to):
    
    try:
        submittals=Submittal.objects.filter(user__name=assigned_to)
    except Submittal.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        if submittals.count() == 1:
            serializer = SubmittalSerializer(submittals.first())
        else:
            serializer = SubmittalSerializer(submittals,many=True)
        return Response(serializer.data)