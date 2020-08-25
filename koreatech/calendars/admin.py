from django.contrib import admin
from django.contrib.auth import get_user_model
from .models import Event, Comment, EventVote, CommentVote
User = get_user_model()

# Register your models here.
admin.site.register(User)
admin.site.register(Event)
admin.site.register(Comment)
admin.site.register(EventVote)
admin.site.register(CommentVote)