# Generated by Django 5.1.2 on 2024-10-21 21:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Trinity_Project', '0002_rename_user_rfichangelog_assigned_to_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='rfichangelog',
            name='project',
            field=models.CharField(max_length=100),
        ),
    ]
