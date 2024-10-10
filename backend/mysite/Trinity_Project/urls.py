from django.urls import  path
from django.contrib import admin

from Trinity_Project.views.authentication_view import *
from Trinity_Project.views.other_view import *
from Trinity_Project.views.project_view import *
from Trinity_Project.views.user_view import *
from Trinity_Project.views.task_view import *
from Trinity_Project.views.submittal_view import *
from Trinity_Project.views.rfi_view import *
from Trinity_Project.views.Invoice_view import *

#from . import views
urlpatterns = [
    path("", index, name="index"),
    path("projects/", project_list,name="project_list"),
    path("projects/project_creation", project_creation_data),
    path("projects/id/<str:project_id>", project_detail),
    path("register", RegisterView.as_view()),
    path("login", login_view),
    path("user",UserView.as_view()),    
    path('logout', logout_view),
    path("projects/name/<str:manager>", project_filter_by_manager),
    path("projects/by_date/",project_by_date),
    path("user/all_users_names",return_all_users_names),
    path("user/all_users_name_and_email", return_all_users_name_and_email),
    path("user/all_users",user_list),
    path("user/id/<str:id>",get_user_by_id),
    path("user/update_user/<str:id>", update_user),
    path("user/delete_user/<str:id>", delete_user),
    path("task/",task_list),
    path("task/id/<str:task_id>",task_detail),
    path("task/project_id/<str:project_id>",task_filter_by_project_id),
    path("task/assigned_to/<str:email>",task_filter_by_user),
    path("task/creation_data", task_creation_data),
    path("task/all_user_projects/<str:email>", task_filter_by_all_user_projects),
    path("announcements/",announcement),
    path("submittal/creation_data", submittal_creation_data),
    path("delete_log",project_delete_log),
    path("submittal/",submittal_list),
    path("submittal/id/<str:submittal_id>",submittal_detail),
    path("submittal/name/<str:assigned_to>", submittal_by_assigned_to),
    path("submittal/project_id/<str:project_id>",submittal_by_project_id),
    path("rfi/creation_data", rfi_creation_data),
    path("rfi/",RFI_list),
    path("rfi/id/<str:rfi_id>",RFI_detail),
    path("rfi/user/<str:email>", rfi_by_user),
    path("announcement/",announcement),
    path("invoice/",invoice_list),
    path("invoice/id/<str:invoice_id>",invoice_detail)
]
