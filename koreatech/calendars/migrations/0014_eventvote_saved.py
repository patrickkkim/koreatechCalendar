# Generated by Django 3.0.4 on 2020-04-12 10:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('calendars', '0013_event_tag'),
    ]

    operations = [
        migrations.AddField(
            model_name='eventvote',
            name='saved',
            field=models.BooleanField(blank=True, null=True),
        ),
    ]