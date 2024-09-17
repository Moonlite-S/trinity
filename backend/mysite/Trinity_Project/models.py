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
    
    def save(self, *args, **kwargs):
        if self.pk:  # Update scenario
            old_instance = Project.objects.get(pk=self.pk)
            # Filter out reverse relationships
            self._old_values = {
                field.name: getattr(old_instance, field.name)
                for field in self._meta.get_fields()
                if isinstance(field, models.Field)
            }
        super(Project, self).save(*args, **kwargs)

    def get_old_values(self):
        if hasattr(self, '_old_values'):
            return self._old_values
        return {}
    # def save(self, *args, **kwargs):
    #     if not self.id:
    #         self.id = generate_id()
    #     super().save(*args, **kwargs)
        
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


    def __str__(self):
        return f"ID: {self.task_id} | {self.title} | {self.assigned_to}"
    
    def save(self, *args, **kwargs):
        number_list = [x for x in range(10)]
        code_items = []
        
        for i in range(5):
            num = random.choice(number_list)
            code_items.append(num)
        code_string="".join(str(item) for item in code_items)
        self.number = code_string
        super().save(*args, **kwargs)

class Announcements(models.Model):
    title=models.CharField(max_length=255)
    content=models.TextField(max_length=255)
    author=models.ForeignKey(User, on_delete=models.CASCADE, related_name="announcements")
    date=models.DateField(auto_now_add=True)

    def __str__(self):
        return self.title
        
class ProjectChangeLog(models.Model):
    project_id = models.CharField(max_length=50)
    project_name = models.CharField(max_length=50)
    changed_by = models.CharField(max_length=50)
    change_time = models.DateTimeField(auto_now_add=True)
    change_description = models.TextField()

    def __str__(self):
        return f"Change to {self.project_name} by {self.changed_by} at {self.change_time}"        
# class ProjectChangeLog(models.Model):
#     project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True)
#     changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
#     change_time = models.DateTimeField(auto_now_add=True)
#     change_description = models.TextField()

#     def __str__(self):
#         return f"Change to {self.project.project_name} by {self.changed_by} at {self.change_time}"

# class TaskChangeLog(models.Model):
#     task = models.ForeignKey(Task, on_delete=models.CASCADE)
#     changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
#     change_time = models.DateTimeField(auto_now_add=True)
#     change_description = models.TextField()

#     def __str__(self):
#         return f"Change to task {self.task.title} by {self.changed_by} at {self.change_time}"
    
class TaskChangeLog(models.Model):
    task_id = models.CharField(max_length=50)
    task_title = models.CharField(max_length=50)
    changed_by = models.CharField(max_length=50)
    change_time = models.DateTimeField(auto_now_add=True)
    change_description = models.TextField()
    
    def __str__(self):
        return f"Change to {self.task_title} by {self.changed_by} at {self.change_time}"      
