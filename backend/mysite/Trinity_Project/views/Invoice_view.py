from os import name
from django.http import HttpResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed

from Trinity_Project.utils import role_required

from ..models import Invoice
from ..serializers import InvoiceSerializer, UserSerializer
from rest_framework.views import APIView
import jwt
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate,login,logout
from rest_framework import status

@role_required(allowed_roles=['Accountant', 'Administrator'], allowed_methods=['GET', 'POST'])
def invoice_list(request):
    if request.method == 'GET':
        invoice = Invoice.objects.all()
        serializer = InvoiceSerializer(invoice, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        serializer = InvoiceSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print("Serializer errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@role_required(allowed_roles=['Accountant', 'Administrator'], allowed_methods=['GET', 'PUT', 'DELETE'])
def invoice_detail(request,invoice_id):
    try:
        invoice=Invoice.objects.get(pk=invoice_id)
    except Invoice.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    user=request.user
    
    if request.method=='GET':
        serializer = InvoiceSerializer(invoice)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = InvoiceSerializer(invoice, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        invoice.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

