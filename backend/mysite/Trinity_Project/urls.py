from django.urls import  path
from django.contrib import admin

from Trinity_Project import views

#from . import views
urlpatterns = [
    path("", views.index, name="index"),
    path("projects/", views.project_list,name="project_list"),
    path("projects/project_creation", views.project_creation_data),
    path("projects/id/<str:project_id>", views.project_detail),
    path("register", views.RegisterView.as_view()),
    path("login", views.LoginView.as_view()),
    path("user",views.UserView.as_view()),    
    path('logout', views.LogoutView.as_view()),
    path("projects/name/<str:manager>", views.project_filter_by_manager),
    path("projects/by_date/",views.project_by_date),
    path("user/all_users_names",views.return_all_users_names),
    path("user/all_users_name_and_email", views.return_all_users_name_and_email),
    path("user/all_users",views.user_list),
    path("task/",views.task_list),
    path("task/id/<str:task_id>",views.task_detail),
    path("task/project_id/<str:project_id>",views.task_filter_by_project_id),
    path("task/assigned_to/<str:email>",views.task_filter_by_user),
    path("task/creation_data", views.task_creation_data),
    path("task/all_user_projects/<str:email>", views.task_filter_by_all_user_projects),
    path("announcements/",views.announcement),
    path("submittal/creation_data", views.submittal_creation_data),
    path("delete_log",views.project_delete_log),
    path("submittal/",views.submittal_list),
    path("submittal/id/<str:submittal_id>",views.submittal_detail),
    path("submittal/name/<str:assigned_to>",views.submittal_by_assigned_to),
    path("submittal/project_id/<str:project_id>",views.submittal_by_project_id),
    path("rfi/creation_data", views.rfi_creation_data),
    path("rfi/",views.RFI_list),
    path("rfi/id/<str:rfi_id>",views.RFI_detail)
]
