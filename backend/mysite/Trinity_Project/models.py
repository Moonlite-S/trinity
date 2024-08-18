from django.db import models


# Create your models here.
class Project(models.Model):
    project_id=models.CharField(max_length=50)
    name=models.CharField(max_length=50)
    manager=models.CharField(max_length=50)
    customer=models.CharField(max_length=50)
    city=models.CharField(max_length=50)
    start_date=models.DateField()
    end_date=models.DateField()
    
    def __str__(self):
        return self.name + " " + self.customer
    
class User(models.Model):
    Name=models.CharField(max_length=50)
    Password=models.CharField(max_length=50)    
