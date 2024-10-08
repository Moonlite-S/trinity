from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager
from datetime import datetime, timedelta, timezone
from django.core.validators import MinValueValidator, MaxValueValidator
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
    project_id=models.CharField(max_length=50, unique=True, primary_key=True)
    project_name=models.CharField(max_length=50)
    manager=models.ForeignKey("User", on_delete=models.CASCADE, related_name="projects")
    client_name=models.CharField(max_length=50)
    city=models.CharField(max_length=50)
    start_date=models.DateField()
    end_date=models.DateField()
    description=models.TextField(blank=True)
    status=models.CharField(max_length=50)
    folder_location=models.CharField(max_length=255)
    template=models.CharField(max_length=255, blank=True)
    
    def __str__(self):
        return f"ID: {self.project_id} | {self.project_name} | {self.client_name}"
    
    def save(self, *args, **kwargs):
        if self.pk:  # Update scenario
            try:
                old_instance = Project.objects.get(pk=self.pk)
                # Filter out reverse relationships
                self._old_values = {
                    field.name: getattr(old_instance, field.name)
                    for field in self._meta.get_fields()
                    if isinstance(field, models.Field)
                }
            except Project.DoesNotExist:
                # Handle the case where the instance doesn't exist anymore
                self._old_values = {}
        else:
            self._old_values = {}

        super(Project, self).save(*args, **kwargs)

    def get_old_values(self):
        if hasattr(self, '_old_values'):
            return self._old_values
        return {}

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

class Task(models.Model):
    task_id=models.CharField(max_length=50, unique=True, primary_key=True)
    title=models.CharField(max_length=50)
    description=models.CharField(max_length=50)
    assigned_to=models.ForeignKey(User, on_delete=models.CASCADE, related_name="tasks")
    project_id=models.ForeignKey(Project, on_delete=models.CASCADE, related_name="tasks")
    due_date=models.DateField()
    status=models.CharField(max_length=50, default="ACTIVE")
    is_approved = models.BooleanField(default=True)
    completion_percentage = models.IntegerField(
        default=0,
        validators=[
            MinValueValidator(0),
            MaxValueValidator(100)
        ]
    )
    
    def save(self, *args, **kwargs):
        if self.pk:  # Update scenario
            try:
                old_instance = Task.objects.get(task_id=self.pk)
                # Filter out reverse relationships
                self._old_values = {
                    field.name: getattr(old_instance, field.name)
                    for field in self._meta.get_fields()
                    if isinstance(field, models.Field)
                }
            except Task.DoesNotExist:
                # Handle the case where the instance doesn't exist anymore
                self._old_values = {}
        else:
            self._old_values = {}

        super(Task, self).save(*args, **kwargs)

    def get_old_values(self):
        if hasattr(self, '_old_values'):
            return self._old_values
        return {}

class Submittal(models.Model):
    submittal_id=models.CharField(max_length=50, primary_key=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="submittals")
    received_date=models.DateField()
    sub_description=models.TextField()
    type=models.CharField(max_length=50)
    user=models.ForeignKey(User, on_delete=models.CASCADE, related_name="submittals")
    status=models.CharField(max_length=50)
    notes=models.TextField()
    
    def __str__(self):
        return f"Submittal ID: {self.submittal_id} | Project: {self.project.project_name} | Status: {self.status}"
    
class Announcements(models.Model):
    title=models.CharField(max_length=255)
    content=models.TextField(max_length=255)
    author=models.ForeignKey(User, on_delete=models.CASCADE, related_name="announcements")
    date=models.DateField(auto_now_add=True)
    created_at = models.DateField(auto_now_add=True)
    duration = models.DurationField(default=timedelta(seconds=7))
    
    @property
    def is_active(self):
        return timezone.now() < self.created_at + self.duration

    def __str__(self):
        return self.title

class ProjectChangeLog(models.Model):
    project_id = models.CharField(max_length=50)
    project_name = models.CharField(max_length=50)
    manager=models.CharField(max_length=50)
    client_name=models.CharField(max_length=50)
    city=models.CharField(max_length=50)
    start_date=models.CharField(max_length=50)
    end_date=models.CharField(max_length=50)
    description=models.TextField()
    status=models.CharField(max_length=50)
    changed_by = models.CharField(max_length=50)
    change_time = models.DateTimeField(auto_now_add=True)
    change_description = models.TextField()

    def __str__(self):
        return f"Change to {self.project_name} by {self.changed_by} at {self.change_time}"        
    
class TaskChangeLog(models.Model):
    task_id = models.CharField(max_length=50)
    task_title = models.CharField(max_length=50)
    description=models.TextField()
    assigned_to=models.CharField(max_length=50)
    project_id=models.CharField(max_length=100)
    due_date=models.CharField(max_length=50)
    changed_by = models.CharField(max_length=50)
    change_time = models.DateTimeField(auto_now_add=True)
    change_description = models.TextField()
    is_approved = models.BooleanField(default=True)
    
    def __str__(self):
        return f"Change to {self.task_title} by {self.changed_by} at {self.change_time}"      
    
class PendingChange(models.Model):
    task = models.ForeignKey(Task, to_field="task_id", on_delete=models.CASCADE)
    field_name=models.CharField(max_length=50)
    old_value=models.TextField()
    new_value=models.TextField()
    requested_by=models.ForeignKey(User, on_delete=models.CASCADE)
    approved = models.BooleanField(default=False)
    created_at = models.DateField(auto_now_add=True)
    updated_at = models.DateField(auto_now=True)
    
class RFI(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="rfi")
    date_received =models.DateField()
    RFI_id = models.CharField(max_length=50,primary_key=True)
    sent_out_date = models.DateField()
    type = models.CharField(max_length=50)
    assigned_to = models.ForeignKey(User, on_delete=models.CASCADE, related_name="rfi_sent")
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="rfi_created")
    notes=models.TextField()
    notes_closed=models.TextField()
    description= models.TextField()
    status=models.CharField(max_length=50, default="ACTIVE")
    
    def days_old(self):
        if self.date_received:
            current_date = datetime.now().date()
            return (current_date - self.date_received).days 
        return None
