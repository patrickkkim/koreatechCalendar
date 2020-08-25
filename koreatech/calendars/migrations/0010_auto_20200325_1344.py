# Generated by Django 3.0.4 on 2020-03-25 13:44

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('calendars', '0009_auto_20200320_2057'),
    ]

    operations = [
        migrations.CreateModel(
            name='Comment',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('text', models.CharField(max_length=500)),
                ('likeCount', models.IntegerField(default=0)),
                ('createdDate', models.DateTimeField(default=django.utils.timezone.now)),
                ('belongsTo', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='calendars.Comment')),
                ('event', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='commentEvent', to='calendars.Event')),
                ('user', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='commentUser', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.RenameModel(
            old_name='Vote',
            new_name='EventVote',
        ),
        migrations.CreateModel(
            name='CommentVote',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('value', models.IntegerField(blank=True, null=True)),
                ('comment', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='voteComment', to='calendars.Comment')),
                ('user', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='commentVoteUser', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
