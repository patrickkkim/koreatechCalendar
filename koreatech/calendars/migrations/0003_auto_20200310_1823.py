# Generated by Django 3.0.3 on 2020-03-10 09:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('calendars', '0002_event_createddate'),
    ]

    operations = [
        migrations.AlterField(
            model_name='event',
            name='dislikeCount',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='event',
            name='likeCount',
            field=models.IntegerField(default=0),
        ),
    ]
