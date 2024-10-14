from django.apps import AppConfig


class ProjectConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "Trinity_Project"
    #this is what makes it so that the method in signals.py cant automatically get called
    def ready(self):
        import Trinity_Project.signals
        import Trinity_Project.graphapi
