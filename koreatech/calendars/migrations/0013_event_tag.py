# Generated by Django 3.0.4 on 2020-04-06 15:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('calendars', '0012_event_link'),
    ]

    operations = [
        migrations.AddField(
            model_name='event',
            name='tag',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
    ]
