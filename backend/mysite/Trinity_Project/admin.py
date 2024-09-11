from django.contrib import admin
from .models import Project, Task, User, VerificationCode
# Register your models here.

admin.site.register(Project)
admin.site.register(User)
admin.site.register(Task)
admin.site.register(VerificationCode)