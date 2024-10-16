from rest_framework.response import Response
from rest_framework import status

from ..utils import authenticate_user, role_required
from ..models import User
from ..serializers import UserNameAndEmail, UserNameSerializer, UserSerializer
from rest_framework.exceptions import PermissionDenied

@role_required(allowed_roles=['Admin', 'Manager', 'Team Member'], allowed_methods=['GET'])
def return_all_users_names(request):
    users = User.objects.all()
    serializer = UserNameSerializer(users, many=True)
    return Response(serializer.data)

@role_required(allowed_roles=['Admin', 'Manager', 'Team Member'], allowed_methods=['GET'])
def user_list(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@role_required(allowed_roles=['Admin', 'Manager', 'Team Member'], allowed_methods=['GET'])
def user_view(request):
    user = request.user
    serializer = UserSerializer(user)
    return Response(serializer.data)

@role_required(allowed_roles=['Admin'], allowed_methods=['GET','PUT','DELETE'])
def user_edit(request,user_email):
    user_2=User.objects.get(email=user_email)

    if request.method=='GET':
        serializer = UserSerializer(user_2)
        return Response(serializer.data)

    elif request.method=='PUT':
        serializer = UserSerializer(user_2, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method=='DELETE':
        user_2.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
        
@role_required(allowed_roles=['Admin', 'Manager', 'Team Member'], allowed_methods=['GET'])
def return_all_users_name_and_email(request):
    payload = authenticate_user(request)

    users = User.objects.all()
    serializer = UserNameAndEmail(users, many=True)
    return Response(serializer.data)

@role_required(allowed_roles=['Admin', 'Manager', 'Team Member'], allowed_methods=['GET'])
def get_user_by_id(request, id):
    try:
        user = User.objects.get(id=id)
        serializer = UserSerializer(user)
        print("Serializer Data: ", serializer.data)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)