import uuid
from rest_framework import serializers
from .models import *

class BasicUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'role', 'date_joined']   

class UserNameAndEmail(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['name', 'email']  

    def __str__(self):
        return f"{self.name} | {self.email}"

class TaskSerializer(serializers.ModelSerializer):
    assigned_to = serializers.CharField()
    project_id = serializers.CharField()
    class Meta:
        model=Task
        fields = ['task_id','title','description','assigned_to','project_id','due_date','status','completion_percentage']

    def __str__(self):
        return f"ID: {self.task_id} | {self.title} | {self.assigned_to}"
    
class UserNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['name'] 

class SubmittalSerializer(serializers.ModelSerializer):
    project = serializers.PrimaryKeyRelatedField(queryset=Project.objects.all(),write_only=True)  # Allow project_id to be written
    project_id=serializers.CharField(source='project.project_id',read_only=True)
    client_name=serializers.CharField(source='project.client_name',read_only=True)
    project_name=serializers.CharField(source='project.project_name',read_only=True)
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(),write_only=True)
    assigned_to=serializers.CharField(source='user.name',read_only=True)
    last_edited_by = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(),write_only=True)
    last_edited_by_name = serializers.CharField(source='last_edited_by.name',read_only=True)
    class Meta:
        model=Submittal
        fields = ['submittal_id','project','project_id','client_name','received_date','project_name','sub_description','type','user','assigned_to','status', 'send_email', 'sent_item', 'closing_notes', 'notes', 'last_edited_by_name', 'last_edited_by']

# This is basically the same as the other ProjectSerializer
# but returns the user object instead of the email
# This is used in the Project Status Report
class ProjectSerializerUserObjectVer(serializers.ModelSerializer):
    manager = BasicUserSerializer()

    class Meta:
        model=Project
        fields = ['project_id','project_name','manager','client_name','city','start_date','end_date','description','status', 'folder_location', 'template']

class ProjectSerializerWithSubmittals(serializers.ModelSerializer):
    submittals = SubmittalSerializer(many=True, read_only=True)
    manager = BasicUserSerializer()

    class Meta:
        model = Project
        fields = ['project_id', 'project_name', 'manager', 'client_name', 'city', 'start_date', 'end_date', 'description', 'status', 'folder_location', 'template', 'submittals']

class ProjectSerializer(serializers.ModelSerializer):
    manager = serializers.EmailField()
    class Meta:
        model=Project
        fields = ['project_id','project_name','manager','client_name','city','start_date','end_date','description','status', 'folder_location', 'template']

class UserSerializer(serializers.ModelSerializer):
    tasks = TaskSerializer(many=True, read_only=True)
    projects = ProjectSerializer(many=True, read_only=True)
    class Meta:
        model = User
        fields = ['id', 'name','email','password','role','date_joined', 'tasks', 'projects']

        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    # def create(self, validated_data):
    #     password = validated_data.pop('password', None)
    #     instance = self.Meta.model(**validated_data)
    #     if password is not None:
    #         instance.set_password(password)
    #     instance.save()
    #     return instance
    
class AnnouncmentsSerializer(serializers.ModelSerializer):
    author = serializers.EmailField()
    class Meta:
        model = Announcements
        fields = ['title', 'content', 'author', 'date', 'duration', 'is_active']
        
class RFISerializer(serializers.ModelSerializer):
    project = serializers.PrimaryKeyRelatedField(queryset=Project.objects.all(),write_only=True)  # Allow project_id to be written
    project_id=serializers.CharField(source='project.project_id',read_only=True)
    project_name=serializers.CharField(source='project.project_name',read_only=True)
    assigned_to_pk = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(),write_only=True, source='assigned_to')
    assigned_to=BasicUserSerializer(read_only=True)
    created_by_pk = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(),write_only=True, source='created_by')
    created_by=BasicUserSerializer(read_only=True)
    days_old=serializers.SerializerMethodField()
    
    class Meta:
        model=RFI
        fields = ['project','project_id', 'project_name', 'date_received','days_old','assigned_to','assigned_to_pk','created_by','created_by_pk','RFI_id','sent_out_date','type','notes','notes_closed','description', 'status']
    
    def get_days_old(self, obj):
        duration = obj.days_old()
        if duration is not None:
            return duration
        return None
    
class AnnouncmentsSerializer(serializers.ModelSerializer):
    author = serializers.EmailField()
    duration_days= serializers.IntegerField(write_only=True,min_value=0)
    class Meta:
        model = Announcements
        fields = ['title', 'content', 'author', 'date','duration_days']
        
    def create(self, validated_data):
        duration_days=validated_data.pop('duration_days')
        instance= Announcements(**validated_data)
        instance.set_expiration(duration_days)
        return instance
    
class InvoiceSerializer(serializers.ModelSerializer):
    invoice_id = serializers.UUIDField(read_only=True)
    project_id = serializers.PrimaryKeyRelatedField(queryset=Project.objects.all(),write_only=True)
    project = serializers.CharField(source='project_id.project_id',read_only=True)
    project_name = serializers.CharField(source='project_id.project_name',read_only=True)
    class Meta:
        model = Invoice
        fields = ['invoice_id', 'invoice_date', 'project', 'project_name', 'payment_status', 'project_id', 'payment_amount']
        read_only_fields = ['invoice_id', 'created_at', 'updated_at']
