from rest_framework import serializers
from .models import Project
from .models import User

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model=Project
        fields = ['project_id','project_name','current_manager', 'city', 'customer_name','start_date','end_date']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id','first_name','last_name','email','password']
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