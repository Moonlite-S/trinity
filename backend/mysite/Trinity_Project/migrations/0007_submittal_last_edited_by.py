# Generated by Django 5.1.2 on 2024-10-16 17:12

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Trinity_Project', '0006_remove_invoice_project_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='submittal',
            name='last_edited_by',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='edited_submittals', to=settings.AUTH_USER_MODEL),
        ),
    ]
