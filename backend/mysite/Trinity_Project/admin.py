from django.contrib import admin
from .models import Project, Task, User, VerificationCode, ProjectChangeLog,TaskChangeLog
# Register your models here.

admin.site.register(Project)
admin.site.register(User)
admin.site.register(Task)
admin.site.register(VerificationCode)
@admin.register(ProjectChangeLog)
class ProjectChangeLogAdmin(admin.ModelAdmin):
    list_display = ('project_id','project_name', 'changed_by', 'change_time', 'change_description')
    list_filter = ('project_id', 'changed_by', 'change_time')
    search_fields = ('change_description', 'project_name', 'changed_by__name')
    
@admin.register(TaskChangeLog)
class TaskChangeLogAdmin(admin.ModelAdmin):
    list_display = ('task_id','task_title','changed_by','change_time','change_description')
    list_filter = ('task_id','changed_by','change_time')
    search_fields = ('change_description','task_title','changed_by__name')