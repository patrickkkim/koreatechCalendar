# Generated by Django 3.0.4 on 2020-03-28 22:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('calendars', '0010_auto_20200325_1344'),
    ]

    operations = [
        migrations.AlterField(
            model_name='comment',
            name='belongsTo',
            field=models.IntegerField(blank=True, null=True),
        ),
    ]
