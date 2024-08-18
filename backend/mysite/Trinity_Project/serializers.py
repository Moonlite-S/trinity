from rest_framework import serializers
from .models import Project
class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model=Project
        fields = ['project_id','name','manager', 'city', 'customer','start_date','end_date']