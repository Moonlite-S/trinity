#from datetime import timezone
from django.utils import timezone
from .models import User, ProjectChangeLog, Project, Task,TaskChangeLog
from .models import VerificationCode
from django.db.models.signals import post_save, pre_save, pre_delete,post_delete
from django.dispatch import receiver
import logging
from .middleware import CurrentUserMiddleware

logger=logging.getLogger('Trinity_Project')

@receiver(post_save, sender=User)
def post_save_generate_code(sender, instance, created, *args, **kwargs):
    if created:
        VerificationCode.objects.create(user=instance)

@receiver(post_save, sender=Project)
def log_project_change(sender, instance,created, **kwargs):
    
    if created:
        # Retrieve the user using middleware
        user = CurrentUserMiddleware.get_current_user()
        if not user:
            return
        ProjectChangeLog.objects.create(
                project_id=f'{instance.project_id}',
                project_name=f'{instance.project_name}',
                manager=f'{instance.manager}',
                client_name=f'{instance.client_name}',
                city=f'{instance.city}',
                start_date=f'{instance.start_date}',
                end_date=f'{instance.end_date}',
                description=f'{instance.description}',
                status=f'{instance.status}',
                change_description='Project was created',
                changed_by=f'{user}'
            )
        return

    # Retrieve the original values before the save
    try:
        original = Project.objects.get(pk=instance.pk)
    except Project.DoesNotExist:
        return  # If the original does not exist, exit
    
    
    # Retrieve the user using middleware
    user = CurrentUserMiddleware.get_current_user()
    
    if not user:
        return
    
    old_values = instance.get_old_values()
    
    fields_to_log = ['project_id', 'project_name', 'manager', 'client_name', 'city', 'start_date', 'end_date', 'description', 'status']
    
    for field in fields_to_log:
        old_value = old_values.get(field)
        new_value = getattr(instance, field)
        
        if old_value != new_value:
            ProjectChangeLog.objects.create(
                project_id=f'{instance.project_id}',
                project_name=f'{instance.project_name}',
                manager=f'{instance.manager}',
                client_name=f'{instance.client_name}',
                city=f'{instance.city}',
                start_date=f'{instance.start_date}',
                end_date=f'{instance.end_date}',
                description=f'{instance.description}',
                status=f'{instance.status}',
                change_description=f'{field} changed from {old_value} to {new_value}',
                changed_by=f'{user}'
            )

#logs when a project gets deleted
@receiver(post_delete, sender=Project)                
def log_project_delete(sender, instance, **kwargs):
    
    user = CurrentUserMiddleware.get_current_user()
    
    if not user:
        print("no user found")
        return
    
    ProjectChangeLog.objects.create(
        project_id=f'{instance.project_id}',
        project_name=f'{instance.project_name}',
        manager=f'{instance.manager}',
        client_name=f'{instance.client_name}',
        city=f'{instance.city}',
        start_date=f'{instance.start_date}',
        end_date=f'{instance.end_date}',
        description=f'{instance.description}',
        status=f'{instance.status}',
        changed_by=f'{user}',
        change_description="Project was deleted"
    )

#logs when a task gets changed
@receiver(post_save, sender=Task)
def log_task_change(sender, instance,created, **kwargs):
    # Check if this is an update (not a creation)
    if created:
        # Retrieve the user using middleware
        user = CurrentUserMiddleware.get_current_user()
        if not user:
            return

        TaskChangeLog.objects.create(
            task_id=f'{instance.task_id}',
            task_title=f'{instance.title}',
            description=f'{instance.description}',
            assigned_to=f'{instance.assigned_to}',
            project_id=f'{instance.project_id}',
            due_date=f'{instance.due_date}',
            change_description='Task was created',
            changed_by=user
        )
        return
    

    # Retrieve the original values before the save
    try:
        original = Task.objects.get(pk=instance.pk)
    except Task.DoesNotExist:
        return  # If the original does not exist, exit
    
    
    # Retrieve the user using middleware
    user = CurrentUserMiddleware.get_current_user()
    if not user:
        return
    
    old_values = instance.get_old_values()
    
    fields_to_log = ['task_id','title','description','assigned_to','project_id','due_date']
    #compare all of the fields for changes
    for field in fields_to_log:
        old_value = old_values.get(field)
        new_value = getattr(instance, field)
        #if there is a change create a log for the task
        if old_value != new_value:
            TaskChangeLog.objects.create(
                task_id=f'{instance.task_id}',
                task_title=f'{instance.title}',
                description=f'{instance.description}',
                assigned_to=f'{instance.assigned_to}',
                project_id=f'{instance.project_id}',
                due_date=f'{instance.due_date}',
                change_description=f'{field} changed from {old_value} to {new_value}',
                changed_by=f'{user}'
            )

#logs when a task gets deleted
@receiver(post_delete, sender=Task)                
def log_task_delete(sender, instance, **kwargs):
    
    user = CurrentUserMiddleware.get_current_user()
    
    if not user:
        print("no user found")
        return
    #creates a taskchangelog object and defines its values
    TaskChangeLog.objects.create(
        task_id=f'{instance.task_id}',
        task_title=f'{instance.title}',
        description=f'{instance.description}',
        assigned_to=f'{instance.assigned_to}',
        project_id=f'{instance.project_id}',
        due_date=f'{instance.due_date}',
        changed_by=f'{user}',
        change_description="task was deleted"
    )
