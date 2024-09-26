from django.contrib import admin
from .models import Project, Submittal, Task, User, VerificationCode, ProjectChangeLog,TaskChangeLog,PendingChange
# Register your models here.

#this line are what make it so that you can create object in the admin page
admin.site.register(Project)
admin.site.register(User)
admin.site.register(Task)
admin.site.register(VerificationCode)
admin.site.register(Submittal)

#This is another way to do it that also you more option with this
@admin.register(ProjectChangeLog)
class ProjectChangeLogAdmin(admin.ModelAdmin):
    list_display = ('project_id','project_name','manager','client_name','city','start_date','end_date','description','status', 'changed_by', 'change_time', 'change_description')
    list_filter = ('project_id', 'changed_by', 'change_time')
    search_fields = ('change_description', 'project_name', 'changed_by__name')
    
@admin.register(TaskChangeLog)
class TaskChangeLogAdmin(admin.ModelAdmin):
    list_display = ('task_id','task_title','description','assigned_to','project_id','due_date','changed_by','change_time','change_description')
    list_filter = ('task_id','changed_by','change_time')
    search_fields = ('change_description','task_title','changed_by__name')


@admin.register(PendingChange)
class PendingChangeAdmin(admin.ModelAdmin):
    list_display=('task', 'field_name', 'new_value', 'requested_by', 'approved')
    
    actions = ['approve_change']
    
    def approve_change(self, request, queryset):
        # Loop through the selected PendingChange objects
        for pending_change in queryset:
            # Apply the change to the project
            task = pending_change.task  # Make sure you're referencing the correct model
            setattr(task, pending_change.field_name, pending_change.new_value)

            # Mark the project as approved
            task.is_approved = True
            task.save()

            # Mark the pending change as approved
            pending_change.approved = True
            pending_change.save()

        # Optionally add a message to the admin
        self.message_user(request, "Selected changes have been approved.")
