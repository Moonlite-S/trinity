from django.urls import  path
from django.contrib import admin
from . import views
from rest_framework.authtoken.views import obtain_auth_token

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
    path("user/all_users_names",views.return_all_users_names),
    path("user/all_users",views.user_list),
    path("projects/folder_generations",views.create_azure_file_share_folder_view),
    path("task/",views.task_list),
    path("task/id/<str:task_id>",views.task_detail),
]
