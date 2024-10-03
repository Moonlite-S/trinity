from os import name
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from ..models import RFI
from ..serializers import RFISerializer
from django.contrib.auth.decorators import login_required

@login_required
@api_view(['GET','POST'])
def RFI_list(request):
    
    if request.method == 'GET':
        rfis=RFI.objects.all()
        serializer =RFISerializer(rfis, many=True)
        return Response(serializer.data)
    
    if request.method == 'POST':
        serializer=RFISerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@login_required
@api_view(['GET','PUT','DELETE'])
def RFI_detail(request,rfi_id):
    try:
        rfi=RFI.objects.get(pk=rfi_id)
    except RFI.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = RFISerializer(rfi)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = RFISerializer(rfi)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)