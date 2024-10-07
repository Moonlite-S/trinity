from django.urls import  path,include
from django.contrib import admin

#from . import views
from Trinity_Project.views.authentication_view import *
from Trinity_Project.views.project_view import *
from Trinity_Project.views.task_view import *
from Trinity_Project.views.submittal_view import *
from Trinity_Project.views.rfi_view import *
from Trinity_Project.views.user_view import *
from Trinity_Project.views.other_view import *
from rest_framework.authtoken.views import obtain_auth_token
from two_factor.views import LoginView

#this is how I create a the url and link them to the view methods 
#they all start with api/ which could be changed through url.py in mysite
urlpatterns = [
    path("register", RegisterView.as_view()),
    path("login", login_view),
    path('logout', logout_view),
    path("projects/", project_list,name="project_list"),
    path("projects/id/<str:project_id>", project_detail),
    path("projects/name/<str:manager>", project_filter_by_manager),
    path("projects/status/<str:project_status>", project_filter_by_status),
    path("projects/by_date/",project_by_date),
    path("projects/folder_generations",create_azure_file_share_folder_view),
    path("projects/copy_folder",copy_template_folder_view),
    #path("2fa",views.TwoFactorAPIView.as_view()),
    path("user/email/<str:user_email>",user_edit),
    path("user/all_users_names",return_all_users_names),
    path("user/all_users",user_list),    
    path("task/",task_list),
    path("task/id/<str:task_id>",task_detail),
    path("task/project_id/<str:project_id>",task_filter_by_project_id),
    path("task/assigned_to/<str:name>",task_filter_by_name),
    path("verify/", verify_view),
    path("delete_log",project_delete_log),
    path("submittal/",submittal_list),
    path("submittal/id/<str:submittal_id>",submittal_detail),
    path("submittal/name/<str:assigned_to>",submittal_by_assigned_to),
    path("rfi/",RFI_list),
    path("rfi/id/<str:rfi_id>",RFI_detail),
    path("announcement/",announcement)
]
