from django.urls import  path
from django.contrib import admin
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("projects/", views.project_list,name="project_list"),
    path("projects/<str:Project_id>", views.project_detail),
]
