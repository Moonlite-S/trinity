from rest_framework import serializers
from .models import Project
class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model=Project
        fields = ['Project_id','Name','Manager','Customer','Start_Date','End_Date']