from os import name
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from ..models import ProjectChangeLog,User,VerificationCode, Announcements
from ..serializers import AnnouncmentsSerializer
import jwt, datetime
from datetime import datetime
from django.contrib.auth.decorators import login_required
from ..forms import VerificationCodeForm
from ..graphapi import GraphAPI

@api_view(['POST'])
def verify_view(request):
    form = VerificationCodeForm(request.POST or None)
    pk = request.session.get('pk')
    if pk:
        user = User.objects.get(pk=pk)
        verification_code = VerificationCode.objects.get(user=user)

        if not request.POST:
            print(f"Verification code for {user.name}: {verification_code.number}")#should display in the terminal
            #send sms using utils code would go here

        if form.is_valid():
            num = form.cleaned_data('number')

            if str(verification_code.number) == num:
                verification_code.delete()
                return JsonResponse({
                    '' : f"Verification succeed"
                })
            else:
                return JsonResponse({
                    '' : f"Verification failed"
                })
                
@api_view(['DELETE'])
def project_delete_log(request):
    if request.method == 'DELETE':
        ProjectChangeLog.objects.all().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
@login_required
@api_view(['POST'])
def schedule_call(request):
    if request.method == 'POST':
        start_datetime = request.POST.get('start_datetime')
        end_datetime = request.POST.get('end_datetime')
        
        start_time = datetime.datetime.fromisoformat(start_datetime).isoformat() + "Z"
        end_time = datetime.datetime.fromisoformat(end_datetime).isoformat() + "Z"
        
        
        meeting_info = GraphAPI.create_online_meeting()
        
        if 'joinUrl' in meeting_info:
            context = {'join_url': meeting_info.get('joinUrl')}
            return render(request, ' schedule_call.html', context)
        else:
            return HttpResponse('Error scheduling meeting')
        
    return render(request, 'schedule_call.html', context)

@login_required
@api_view(['GET', 'POST'])
def announcement(request):
    
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