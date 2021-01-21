import datetime
from django.db import models
from django.utils.timezone import now
from django.conf import settings

# Create your models here.
class Event(models.Model):
    startDate = models.DateField()
    endDate = models.DateField()
    note = models.CharField(max_length=200)
    bodyText = models.CharField(max_length=2000, null=True, blank=True)
    link = models.URLField(max_length=2000, null=True, blank=True)
    tag = models.CharField(max_length=50, null=True, blank=True)
    likeCount = models.IntegerField(default=0)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, 
        related_name="eventUser", on_delete=models.SET_NULL, null=True)
    createdDate = models.DateTimeField(default=now)

    def __str__(self):
        return f"{self.startDate}/~/{self.endDate}, '{self.note[:20]}' {self.tag} (like: {self.likeCount}), {self.user}"

class Comment(models.Model):
    text = models.CharField(max_length=500)
    likeCount = models.IntegerField(default=0)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, 
        related_name="commentUser", on_delete=models.SET_NULL, null=True)
    event = models.ForeignKey(Event, related_name="commentEvent", 
        on_delete=models.CASCADE)
    belongsTo = models.IntegerField(blank=True, null=True)
    createdDate = models.DateTimeField(default=now)

    def __str__(self):
        return f"{self.text}"

class EventVote(models.Model):
    value = models.IntegerField(null=True, blank=True)
    saved = models.BooleanField(blank=True, default=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, 
        related_name="voteUser", on_delete=models.CASCADE, null=True)
    event = models.ForeignKey(Event, related_name="votedEvent",
        on_delete=models.CASCADE, null=True)
        
    def __str__(self):
        return f"{self.user} voted for {self.event.note}, {self.value}, saved: {self.saved}"

class CommentVote(models.Model):
    value = models.IntegerField(null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, 
        related_name="commentVoteUser", on_delete=models.SET_NULL, null=True)
    comment = models.ForeignKey(Comment, related_name="voteComment", 
        on_delete=models.CASCADE, null=True)

    def __str__(self):
        return f"Comment: {self.user} voted {self.value}"