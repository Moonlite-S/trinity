# Generated by Django 5.1 on 2024-09-18 16:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Trinity_Project', '0015_announcements'),
    ]

    operations = [
        migrations.CreateModel(
            name='ProjectChangeLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('project_id', models.CharField(max_length=50)),
                ('project_name', models.CharField(max_length=50)),
                ('changed_by', models.CharField(max_length=50)),
                ('change_time', models.DateTimeField(auto_now_add=True)),
                ('change_description', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='TaskChangeLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('task_id', models.CharField(max_length=50)),
                ('task_title', models.CharField(max_length=50)),
                ('changed_by', models.CharField(max_length=50)),
                ('change_time', models.DateTimeField(auto_now_add=True)),
                ('change_description', models.TextField()),
            ],
        ),
    ]
