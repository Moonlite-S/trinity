from django.urls import  path,include
from django.contrib import admin
from . import views
from rest_framework.authtoken.views import obtain_auth_token
from two_factor.views import LoginView


urlpatterns = [
    path("projects/", views.project_list,name="project_list"),
    path("projects/id/<str:project_id>", views.project_detail),
    path("register", views.RegisterView.as_view()),
    path("login", views.login_view),
    #path("2fa",views.TwoFactorAPIView.as_view()),
    path("user",views.user_view),    
    path('logout', views.logout_view),
    path("projects/name/<str:manager>", views.project_filter_by_manager),
    path("user/all_users_names",views.return_all_users_names),
    path("user/all_users",views.user_list),
    path("projects/folder_generations",views.create_azure_file_share_folder_view),
    path("projects/copy_folder",views.copy_template_folder_view),
    path("verify/", views.verify_view)
]
