from rest_framework import serializers
from .models import Event, Comment, EventVote, CommentVote
from users.models import User

class EventSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source="user.username")
    user_nickname = serializers.CharField(source="user.nickname")
    class Meta:
        model = Event
        fields = ("id", "startDate", "endDate", "note", "bodyText", "link", "tag",
            "likeCount", "createdDate", "user_username", "user_nickname")

class EventSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ("id", "startDate", "endDate", "note", "tag",
            "likeCount", "createdDate")

class VoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventVote
        fields = ("event_id", "value", "saved")
        depth = 1

class CommentSerializer(serializers.ModelSerializer):
	user_username = serializers.CharField(source="user.username")
	class Meta:
		model = Comment
		fields = ('id', 'text', 'likeCount', 'user_username', 
			'createdDate', 'belongsTo', 'event_id')
		depth = 1

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username" , "nickname")