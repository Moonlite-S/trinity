from logging import NOTSET
from pyexpat import model
from telnetlib import STATUS
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager
from django.utils import timezone
import random
from phonenumber_field.modelfields import PhoneNumberField
import uuid
from datetime import datetime, timedelta

#from backend.mysite.Trinity_Project import generate_id


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
    project_id=models.CharField(max_length=50,unique=True,primary_key=True,default=uuid.uuid4)
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
    name=models.CharField(max_length=50, unique=True)
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

class Task(models.Model):
    task_id=models.CharField(max_length=50, unique=True, primary_key=True)
    title=models.CharField(max_length=50)
    description=models.CharField(max_length=50)
    assigned_to=models.CharField(max_length=50)
    project_id=models.CharField(max_length=50)
    due_date=models.DateField()
    is_approved = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if self.pk:  # Update scenario
            old_instance = Task.objects.get(pk=self.pk)
            # Filter out reverse relationships
            self._old_values = {
                field.name: getattr(old_instance, field.name)
                for field in self._meta.get_fields()
                if isinstance(field, models.Field)
            }
        super(Task, self).save(*args, **kwargs)

    def get_old_values(self):
        if hasattr(self, '_old_values'):
            return self._old_values
        return {}

class Submittal(models.Model):
    submittal_id=models.CharField(max_length=50, primary_key=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="project")
    received_date=models.DateField()
    sub_description=models.TextField()
    type=models.CharField(max_length=50)
    user=models.ForeignKey(User, on_delete=models.CASCADE, related_name="submittals")
    status=models.CharField(max_length=50)
    notes=models.TextField()

class Announcements(models.Model):
    title=models.CharField(max_length=255)
    content=models.TextField(max_length=255)
    author=models.ForeignKey(User, on_delete=models.CASCADE, related_name="announcements")
    date=models.DateField(auto_now_add=True)
    exp_date=models.DateField()

    # def is_expired(self):

    #     expiration_days = 7
    #     return timezone.now() > self.date + timedelta(days=expiration_days)

    # def set_expiration(self, duration_days):
    #     self.exp_date= timezone.now() + timedelta(days=duration_days)

    def __str__(self):
        return self.title

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
    project_id=models.CharField(max_length=50)
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
    user=models.ForeignKey(User, on_delete=models.CASCADE)
    notes=models.TextField()
    notes_closed=models.TextField()
    description= models.TextField()

    def days_old(self):
        if self.date_received:
            current_date = datetime.now().date()
            return (current_date - self.date_received).days
        return None