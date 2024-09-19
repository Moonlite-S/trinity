from dataclasses import fields
from rest_framework import serializers
from .models import Project, Task
from .models import User

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model=Project
        fields = ['project_id','project_name','manager','client_name','city','start_date','end_date','description','status']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name','email','password','role','date_joined']
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