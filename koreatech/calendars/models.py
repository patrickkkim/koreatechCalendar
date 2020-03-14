import datetime
from django.db import models
from django.utils.timezone import now
from django.conf import settings

# Create your models here.
class Event(models.Model):
    startDate = models.DateField()
    endDate = models.DateField()
    note = models.CharField(max_length=200)
    likeCount = models.IntegerField(default=0)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="eventUser",
        on_delete=models.SET_NULL, null=True)
    createdDate = models.DateTimeField(default=now)

    def __str__(self):
        return f"{self.startDate}/~/{self.endDate}, '{self.note[:20]}' (like: {self.likeCount}), {self.user}"

class Value(models.Model):
    value = models.BooleanField()
    event = models.ForeignKey(Event, related_name="eventValue", on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.event}: {self.value}"

class Vote(models.Model):
    value = models.ManyToManyField(Value, related_name="voteValues", blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="voteUser",
        on_delete=models.CASCADE)
        
    def __str__(self):
        return f"{self.user} voted {self.value}"