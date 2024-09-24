from django.apps import AppConfig


class ProjectConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "Trinity_Project"
    
    def ready(self):
        import Trinity_Project.signals
        import Trinity_Project.graphapi
