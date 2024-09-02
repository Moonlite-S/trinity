from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager
import random
from phonenumber_field.modelfields import PhoneNumberField


# Create your models here.
class CustomUserManager(BaseUserManager):
    def create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError(_('The Email must be set'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True);

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        return self.create_user(email, password, **extra_fields)
    
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
        return f"ID: {self.project_id} | {self.project_name} | {self.client_name}"
    
class User(AbstractUser):
    name=models.CharField(max_length=50)
    email=models.EmailField(max_length=50, unique=True)
    password=models.CharField(max_length=255)
    role=models.CharField(max_length=50)
    date_joined=models.DateField(auto_now_add=True)
    phone_number= PhoneNumberField(("Phone number"), blank=True, null=True)
    username= None

    objects = CustomUserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []    

    def __str__(self):
        return f"{self.name} | {self.email}"

class Tasks(models.Model):
    pass

class VerificationCode(models.Model):
    number = models.CharField(max_length=5, blank=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    
    def __str__(self):
        return str(self.number)
    
    def save(self, *args, **kwargs):
        number_list = [x for x in range(10)]
        code_items = []
        
        for i in range(5):
            num = random.choice(number_list)
            code_items.append(num)
        code_string="".join(str(item) for item in code_items)
        self.number = code_string
        super().save(*args, **kwargs)