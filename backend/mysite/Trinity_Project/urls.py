from django.urls import  path,include
from django.contrib import admin
from . import views
from rest_framework.authtoken.views import obtain_auth_token
from two_factor.views import LoginView

#this is how I create a the url and link them to the view methods 
#they all start with api/ which could be changed through url.py in mysite
urlpatterns = [
    path("projects/", views.project_list,name="project_list"),
    path("projects/id/<str:project_id>", views.project_detail),
    #path("projects/id/<str:project_id>", views.update_project),
    path("register", views.RegisterView.as_view()),
    path("login", views.login_view),
    path('logout', views.logout_view),
    #path("2fa",views.TwoFactorAPIView.as_view()),
    path("user/email/<str:user_email>",views.user_edit),
    #path("user",views.user_view),
    path("user/all_users_names",views.return_all_users_names),
    path("user/all_users",views.user_list),    
    path("projects/name/<str:manager>", views.project_filter_by_manager),
    path("projects/status/<str:project_status>", views.project_filter_by_status),
    path("projects/folder_generations",views.create_azure_file_share_folder_view),
    path("projects/copy_folder",views.copy_template_folder_view),
    path("projects/by_date/",views.project_by_date),
    path("task/",views.task_list),
    path("task/id/<str:task_id>",views.task_detail),
    path("task/project_id/<str:project_id>",views.task_filter_by_project_id),
    path("task/assigned_to/<str:name>",views.task_filter_by_name),
    path("verify/", views.verify_view),
    path("delete_log",views.project_delete_log),
    path("submittal/",views.submittal_list),
    path("submittal/id/<str:submittal_id>",views.submittal_detail),
    path("submittal/name/<str:assigned_to>",views.submittal_by_assigned_to),
    path("rfi/",views.RFI_list),
    path("rfi/id/<str:rfi_id>",views.RFI_detail)
]
