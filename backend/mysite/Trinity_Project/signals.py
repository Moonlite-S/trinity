#from datetime import timezone
from django.utils import timezone
from .models import User, ProjectChangeLog, Project, Task,TaskChangeLog
from django.db.models.signals import post_save, pre_save, pre_delete,post_delete
from django.dispatch import receiver
import logging
from .middleware import CurrentUserMiddleware

logger=logging.getLogger('Trinity_Project')

@receiver(post_save, sender=Project)
def log_project_change(sender, instance, **kwargs):
    # Check if this is an update (not a creation)
    if not instance.pk:
        print("no change was made")
        return  # New instance, no changes to track

    # Retrieve the original values before the save
    try:
        original = Project.objects.get(pk=instance.pk)
    except Project.DoesNotExist:
        raise Exception("Project does not exist")
    
    # Retrieve the user from the context (if passed)
    user = CurrentUserMiddleware.get_current_user()
    if not user:
        raise Exception("User not found")
    
    old_values = instance.get_old_values()
    
    fields_to_log = ['project_id', 'project_name', 'manager', 'client_name', 'city', 'start_date', 'end_date', 'notes', 'status']
    
    for field in fields_to_log:
        old_value = old_values.get(field)
        new_value = getattr(instance, field)
        
        if old_value != new_value:
            ProjectChangeLog.objects.create(
                project_id=f'{instance.project_id}',
                project_name=f'{instance.project_name}',
                change_description=f'{field} changed from {old_value} to {new_value}',
                changed_by=f'{user}'
            )

@receiver(post_delete, sender=Project)                
def log_project_delete(sender, instance, **kwargs):
    
    user = CurrentUserMiddleware.get_current_user()
    
    if not user:
        print("no user found")
        return
    
    ProjectChangeLog.objects.create(
        project_id=f'{instance.project_id}',
        project_name=f'{instance.project_name}',
        changed_by=f'{user}',
        change_description="Project was deleted"
    )

    
@receiver(post_save, sender=Task)
def log_task_change(sender, instance, **kwargs):
    # Check if this is an update (not a creation)
    if not instance.pk:
        print("no change was made")
        return  # New instance, no changes to track

    # Retrieve the original values before the save
    try:
        original = Task.objects.get(pk=instance.pk)
    except Task.DoesNotExist:
        return  # If the original does not exist, exit
    
    
    # Retrieve the user from the context (if passed)
    user = CurrentUserMiddleware.get_current_user()
    if not user:
        return
    
    old_values = instance.get_old_values()
    
    fields_to_log = ['task_id','title','description','assigned_to','project_id','due_date']
    
    for field in fields_to_log:
        old_value = old_values.get(field)
        new_value = getattr(instance, field)
        
        if old_value != new_value:
            TaskChangeLog.objects.create(
                task_id=f'{instance.task_id}',
                task_title=f'{instance.title}',
                change_description=f'{field} changed from {old_value} to {new_value}',
                changed_by=f'{user}'
            )


@receiver(post_delete, sender=Task)                
def log_task_delete(sender, instance, **kwargs):
    
    user = CurrentUserMiddleware.get_current_user()
    
    if not user:
        print("no user found")
        return
    
    TaskChangeLog.objects.create(
        task_id=f'{instance.task_id}',
        task_title=f'{instance.title}',
        changed_by=f'{user}',
        change_description="task was deleted"
    )
