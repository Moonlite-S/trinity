from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class Project(models.Model):
    project_id=models.CharField(max_length=50)
    project_name=models.CharField(max_length=50)
    manager=models.CharField(max_length=50)
    client_name=models.CharField(max_length=50)
    city=models.CharField(max_length=50)
    start_date=models.DateField()
    end_date=models.DateField()
    description=models.TextField()
    status=models.CharField(max_length=50)
    
    def __str__(self):
        return f"ID: {self.project_id} | {self.project_name} | {self.customer_name}"
    
class User(AbstractUser):
    name=models.CharField(max_length=50)
    email=models.CharField(max_length=50, unique=True)
    password=models.CharField(max_length=255)
    username= None
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []    
