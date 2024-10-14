from os import name
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from ..serializers import AnnouncmentsSerializer
from ..utils import authenticate_jwt
from ..models import Announcements, ProjectChangeLog, User
import jwt, datetime
from datetime import datetime, timezone
from django.contrib.auth.decorators import login_required
from django.db.models import F

@api_view(['DELETE'])
def project_delete_log(request):
    if request.method == 'DELETE':
        ProjectChangeLog.objects.all().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
@api_view(['GET', 'POST'])
def announcement(request):
    payload = authenticate_jwt(request)
    
    if request.method == 'GET':
        announcements = Announcements.objects.all()
        serializer = AnnouncmentsSerializer(announcements, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        serializer = AnnouncmentsSerializer(data=request.data)
        if serializer.is_valid():
            author = serializer.validated_data.pop('author')
            try:
                user = User.objects.get(email=author)

                if user.role == 'Manager' or user.role == 'Administrator':
                    announcement = Announcements.objects.create(author=user, **serializer.validated_data)

                    return Response(AnnouncmentsSerializer(announcement).data, status=status.HTTP_201_CREATED)
                else:
                    return Response(data={"Permission Error": "You do not have permission to create an announcement."}, status=status.HTTP_403_FORBIDDEN)

            except User.DoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
