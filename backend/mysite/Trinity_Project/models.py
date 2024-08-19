from django.db import models


# Create your models here.
class Project(models.Model):
    project_id=models.CharField(max_length=50)
    project_name=models.CharField(max_length=50)
    current_manager=models.CharField(max_length=50)
    customer_name=models.CharField(max_length=50)
    city=models.CharField(max_length=50)
    start_date=models.DateField()
    end_date=models.DateField()
    
    def __str__(self):
        return f"ID: {self.project_id} | {self.project_name} | {self.customer_name}"
    
class User(models.Model):
    name=models.CharField(max_length=50)
    password=models.CharField(max_length=50)    
