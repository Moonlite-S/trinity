# Generated by Django 5.1.2 on 2024-10-15 17:48

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Trinity_Project', '0002_invoice_payment_amount'),
    ]

    operations = [
        migrations.AddField(
            model_name='invoice',
            name='project_name',
            field=models.CharField(blank=True, default='', max_length=50),
        ),
        migrations.AlterField(
            model_name='invoice',
            name='project_id',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='invoices', to='Trinity_Project.project'),
        ),
    ]