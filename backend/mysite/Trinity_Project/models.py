from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager

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
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        return self.create_user(email, password, **extra_fields)
    
class Project(models.Model):
    project_id=models.CharField(max_length=50, unique=True)
    project_name=models.CharField(max_length=50)
    manager=models.ForeignKey("User", on_delete=models.CASCADE, related_name="projects")
    client_name=models.CharField(max_length=50)
    city=models.CharField(max_length=50)
    start_date=models.DateField()
    end_date=models.DateField()
    notes=models.TextField(blank=True)
    status=models.CharField(max_length=50)
    folder_location=models.CharField(max_length=255)
    template=models.CharField(max_length=255, blank=True)
    
    def __str__(self):
        return f"ID: {self.project_id} | {self.project_name} | {self.client_name}"
    
class User(AbstractUser):
    name=models.CharField(max_length=50)
    email=models.EmailField(max_length=50, unique=True)
    password=models.CharField(max_length=255)
    role=models.CharField(max_length=50)
    date_joined=models.DateField(auto_now_add=True)
    username= None

    objects = CustomUserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return f"{self.name} | {self.email}"

# We MUST link this model to the User model
class Client(models.Model):
    client_id=models.CharField(max_length=50, unique=True)
    client_name=models.CharField(max_length=50)
    address=models.CharField(max_length=50)
    city=models.CharField(max_length=50)
    state=models.CharField(max_length=50)
    zip=models.CharField(max_length=50)
    phone=models.CharField(max_length=50)
    email=models.EmailField(max_length=50)
    manager=models.CharField(max_length=50)
    notes=models.TextField(blank=True)

class Task(models.Model):
    task_id=models.CharField(max_length=50, unique=True)
    title=models.CharField(max_length=50)
    description=models.CharField(max_length=50)
    assigned_to=models.ForeignKey(User, on_delete=models.CASCADE, related_name="tasks")
    project_id=models.ForeignKey(Project, to_field='project_id', on_delete=models.CASCADE, related_name="project")
    due_date=models.DateField()

    def __str__(self):
        return f"ID: {self.task_id} | {self.title} | {self.assigned_to}"