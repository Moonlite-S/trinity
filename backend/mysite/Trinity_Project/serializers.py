from dataclasses import fields
from rest_framework import serializers
from .models import Project, Submittal, Task, RFI, Announcements
from .models import User

#these classes convert the models in a more readable format like json when request through api calls
class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model=Project
        fields = ['project_id','project_name','manager','client_name','city','start_date','end_date','description','status']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['name','email','password','role','date_joined']
        #this makes it so that the password isn't visible when a user info is called
        extra_kwargs = {
            'password': {'write_only': True}
            }
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance
    
class UserNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['name'] 
        
class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model=Task
        fields = ['task_id','title','description','assigned_to','project_id','due_date']
        

class SubmittalSerializer(serializers.ModelSerializer):
    project = serializers.PrimaryKeyRelatedField(queryset=Project.objects.all(),write_only=True)  # Allow project_id to be written
    project_id=serializers.CharField(source='project.project_id',read_only=True)
    client_name=serializers.CharField(source='project.client_name',read_only=True)
    project_name=serializers.CharField(source='project.project_name',read_only=True)
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(),write_only=True)
    assigned_to=serializers.CharField(source='user.name',read_only=True)
    class Meta:
        model=Submittal
        fields = ['submittal_id','project','project_id','client_name','received_date','project_name','sub_description','type','user','assigned_to','status','notes']
        
class RFISerializer(serializers.ModelSerializer):
    project = serializers.PrimaryKeyRelatedField(queryset=Project.objects.all(),write_only=True)  # Allow project_id to be written
    project_id=serializers.CharField(source='project.project_id',read_only=True)
    project_name=serializers.CharField(source='project.project_name',read_only=True)
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(),write_only=True)
    sent_by=serializers.CharField(source='user.name',read_only=True)
    days_old=serializers.SerializerMethodField()
    class Meta:
        model=RFI
        fields = ['project','project_id','date_received','days_old','project_name','RFI_id','sent_out_date','type','user','sent_by','notes','notes_closed','description']
    
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