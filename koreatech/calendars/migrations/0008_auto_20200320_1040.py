# Generated by Django 3.0.4 on 2020-03-20 10:40

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('calendars', '0007_value_vote'),
    ]

    operations = [
        migrations.AddField(
            model_name='vote',
            name='event',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='votedEvent', to='calendars.Event'),
        ),
        migrations.RemoveField(
            model_name='vote',
            name='value',
        ),
        migrations.AddField(
            model_name='vote',
            name='value',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.DeleteModel(
            name='Value',
        ),
    ]
