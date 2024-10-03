from os import name
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from ..models import User
from ..serializers import UserNameSerializer, UserSerializer
from django.contrib.auth.decorators import login_required
from rest_framework.exceptions import PermissionDenied

@login_required
@api_view(['GET'])
def return_all_users_names(request):
    users = User.objects.all()
    serializer = UserNameSerializer(users, many=True)
    return Response(serializer.data)

@login_required
@api_view(['GET'])
def user_list(request):
    user=request.user
    if user.is_superuser:
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
    else:
        raise PermissionDenied("You are unable to view user list")
    
@login_required
@api_view(['GET'])
def user_view(request):
    user = request.user
    serializers = UserSerializer(user)
    return Response(serializers.data)

@login_required
@api_view(['GET','PUT','DELETE'])
def user_edit(request,user_email):
    user=request.user
    user_2=User.objects.get(email=user_email)

    if request.method=='GET':
        if user==user_2 or user.is_superuser:
            serializer = UserSerializer(user_2)
            return Response(serializer.data)
        else:
            raise PermissionDenied("You are unable to view this user")

    elif request.method=='PUT':
        serializer = UserSerializer(user_2, data=request.data)
        if user==user_2 or user.is_superuser:
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            raise PermissionDenied("You are unable to edit this user")

    elif request.method=='DELETE':
        if user.is_superuser:
            user_2.delete()
        else:
            raise PermissionDenied("You do not have permission to delete this user.")