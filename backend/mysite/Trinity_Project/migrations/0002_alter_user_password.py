# Generated by Django 5.1 on 2024-08-19 20:25

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("Trinity_Project", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="user",
            name="password",
            field=models.CharField(max_length=255),
        ),
    ]
