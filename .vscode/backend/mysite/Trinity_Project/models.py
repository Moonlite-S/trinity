from django.db import models


# Create your models here.
class Project(models.Model):
    Project_id=models.CharField(max_length=50)
    Name=models.CharField(max_length=50)
    Manager=models.CharField(max_length=50)
    Customer=models.CharField(max_length=50)
    City=models.CharField(max_length=50)
    Start_Date=models.DateField()
    End_Date=models.DateField()
    
    def __str__(self):
        return self.Name + " " + self.Customer
