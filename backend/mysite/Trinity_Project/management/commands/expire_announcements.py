from argparse import Action
from click import argument
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta

from networkx import triangular_lattice_graph

from backend.mysite.Trinity_Project.management.commands import expire_annoucements
from ...models import Announcements

class Command(BaseCommand):
    help = 'Deletes expired announcements from the database'

    def handle(self, *args, **kwargs):
        # Assuming 'Announcement' model has an 'expiration_date' field
        now = timezone.now()
        expired_announcements = Announcements.objects.filter(exp_date__lt=now)

        if expired_announcements.exists():
            count, _ = expired_announcements.delete()  # Perform delete operation
            self.stdout.write(self.style.SUCCESS(f'Successfully deleted {count} expired announcements.'))
        else:
            self.stdout.write(self.style.SUCCESS('No expired announcements found.'))
            
            
#   this script will be called through task scheduler 
#   -make sure to set up the trigger
#   -also create the Action. For action you will need to get the path for these three thing.these
#   -the path to your python.exe which is in your .venv/script folder
#   -next fro the argument path go all the way to manage.py and also call expire_annoucements
#   it should look like this <path>\manage.py expire_annoucements
#   -the start in path should be the path to the mysite folder
    
