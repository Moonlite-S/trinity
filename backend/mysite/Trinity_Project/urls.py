from django.urls import  path
from django.contrib import admin
from . import views
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    path("", views.index, name="index"),
    path("projects/", views.project_list,name="project_list"),
    path("projects/id/<str:project_id>", views.project_detail),
    path("register", views.RegisterView.as_view()),
    path("login", views.LoginView.as_view()),
    path("user",views.UserView.as_view()),    
    path('logout', views.LogoutView.as_view()),
    path('users', views.employee_list),
    path("projects/name/<str:manager>", views.project_filter_by_manager)
]
