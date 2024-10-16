from rest_framework.response import Response
from Trinity_Project.utils import role_required
from ..models import Invoice
from ..serializers import InvoiceSerializer
from rest_framework import status

@role_required(allowed_roles=['Accountant', 'Manager', 'Administrator'], allowed_methods=['GET', 'POST'])
def invoice_list(request):
    if request.method == 'GET':
        invoice = Invoice.objects.all()
        serializer = InvoiceSerializer(invoice, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        project_id = request.data.get('project_id')
        existing_invoice = Invoice.objects.filter(project_id=project_id).first()

        if existing_invoice:
            print("Invoice already exists. Updating...")
            serializer = InvoiceSerializer(existing_invoice, data=request.data)
        else:
            serializer = InvoiceSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK if existing_invoice else status.HTTP_201_CREATED)
        else:
            print("Serializer errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@role_required(allowed_roles=['Accountant', 'Manager', 'Administrator'], allowed_methods=['GET', 'PUT', 'DELETE'])
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

@role_required(allowed_roles=['Accountant', 'Manager', 'Administrator'], allowed_methods=['GET'])
def invoice_by_project_id(request, project_id):
    if request.method == 'GET':
        invoice = Invoice.objects.filter(project_id=project_id).first()
        serializer = InvoiceSerializer(invoice)
        return Response(serializer.data)
    
@role_required(allowed_roles=['Accountant', 'Manager', 'Administrator'], allowed_methods=['GET'])
def invoices_not_paid(request):
    if request.method == 'GET':
        invoices = Invoice.objects.filter(payment_status='Pending')
        serializer = InvoiceSerializer(invoices, many=True)
        return Response(serializer.data)
