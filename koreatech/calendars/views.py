import json, datetime, re
from django.shortcuts import render
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Count
from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import NotFound, ParseError
from rest_framework.decorators import action

from .serializers import (EventSerializer, EventSearchSerializer, VoteSerializer, 
    CommentSerializer, UserSerializer)
from .models import Event, Comment, EventVote, CommentVote
from django.contrib.auth import get_user_model
User = get_user_model()

# Create your views here.
def getUser(userHeader):
    print(userHeader)
    userKey = userHeader.split("Token ")[1]
    userId = Token.objects.filter(key=userKey).values().first()["user_id"]
    user = User.objects.get(pk=userId)
    return user

def stripDate(date):
    return datetime.datetime.strptime(date, "%Y-%m-%d").date()

def paginate(pagCount, pagStart):
    start = int(pagStart)
    end = int(pagStart) + int(pagCount)
    return {"start": start, "end": end}

class EventView(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    
    def get_queryset(self):
        tag = self.request.query_params.get("tag")
        eventId = self.request.query_params.get("eventId")
        orderBy = self.request.query_params.get("orderBy")
        pagCount = self.request.query_params.get("pagCount")
        pagStart = self.request.query_params.get("pagStart")
        userHeader = self.request.META.get("HTTP_AUTHORIZATION")
        if userHeader and pagCount and pagStart and orderBy:
            user = getUser(userHeader)
            pageRange = paginate(pagCount, pagStart)
            if orderBy == "recent":
                events = Event.objects.order_by("-createdDate")
            else:
                events = Event.objects.order_by("createdDate")
            events = events.filter(user=user)[pageRange['start']:pageRange['end']]
            return events
        if eventId:
            event = Event.objects.filter(pk=eventId)
            if event:
                return event
            else:
                raise NotFound("Data not found")
        if tag:
            events = Event.objects.filter(tag=tag)
            return events
        else:
            raise ParseError("Input data malformed")

    def retrieve(self, request, pk=None):
        if pk == "count":
            userHeader = self.request.META.get("HTTP_AUTHORIZATION")
            user = getUser(userHeader)
            count = Event.objects.filter(user=user).count()
            return Response(data=count, status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)

    def create(self, request):
        startDate = request.data.get("startDate")
        endDate = request.data.get("endDate")
        note = request.data.get("note")
        bodyText = request.data.get("bodyText")
        link = request.data.get("link")
        tag = request.data.get("tag")
        userHeader = request.META.get("HTTP_AUTHORIZATION")
        user = getUser(userHeader)
        if not (startDate and endDate and note):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        createdEvent = Event.objects.create(startDate=startDate, endDate=endDate, note=note, bodyText=bodyText, link=link, tag=tag, user=user)
        if not createdEvent:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        vote = EventVote.objects.filter(user=user, event=createdEvent)
        EventVote.objects.create(user=user, value=0, saved=True, event=createdEvent)
        return Response(status=status.HTTP_200_OK)

    def patch(self, request, *args, **kwargs):
        eventId = request.data.get("eventId")
        startDate = request.data.get("startDate")
        endDate = request.data.get("endDate")
        note = request.data.get("note")
        bodyText = request.data.get("bodyText")
        link = request.data.get("link")
        tag = request.data.get("tag")
        userHeader = request.META.get("HTTP_AUTHORIZATION")
        user = getUser(userHeader)
        if not (eventId and startDate and endDate and note):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        event = Event.objects.filter(pk=eventId, user=user)
        if not event:
            return Response(status=status.HTTP_404_NOT_FOUND)
        event.update(startDate=startDate, endDate=endDate, note=note,
            bodyText=bodyText, link=link, tag=tag)
        return Response(status=status.HTTP_200_OK)

    def delete(self, request):
        eventId = request.data.get("eventId")
        userHeader = request.META.get("HTTP_AUTHORIZATION")
        user = getUser(userHeader)
        event = Event.objects.filter(pk=eventId, user=user)
        if not event:
            return Response(status=status.HTTP_404_NOT_FOUND)
        else:
            Event.objects.filter(pk=eventId, user=user).delete()
        return Response(status=status.HTTP_200_OK)

class VoteView(viewsets.ModelViewSet):
    serializer_class = VoteSerializer

    def get_queryset(self):
        userHeader = self.request.META.get("HTTP_AUTHORIZATION")
        user = getUser(userHeader)
        eventIds = self.request.query_params.get("eventIds")
        if eventIds:
            eventIds = json.loads(eventIds)
            votes = EventVote.objects.filter(user=user, event__pk__in=eventIds)
            return votes
        startDate = stripDate(self.request.query_params.get("startDate"))
        endDate = stripDate(self.request.query_params.get("endDate"))
        votes = EventVote.objects.filter(user=user, event__startDate__range=(
            startDate, endDate))
        return votes

class UpdateVoteView(viewsets.ModelViewSet):
    serializer_class = VoteSerializer

    def create(self, request):
        eventId = request.data.get("eventId")
        clicked = request.data.get("clicked")
        save = request.data.get("save")

        if request.method != "POST":
            return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
        userHeader = request.META.get("HTTP_AUTHORIZATION")
        user = getUser(userHeader)
        vote = EventVote.objects.filter(user=user, event=eventId)
        event = Event.objects.get(pk=eventId)
        if not event:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        elif not vote:
            EventVote.objects.create(user=user, 
                value=(0 if clicked == 2 else clicked), 
                saved=save, event=event)
        elif clicked == 2:
            vote.update(saved=save)
        else:
            voteValues = vote.values('value', 'saved').first()
            vote.update(value=clicked)
            if clicked == -1:
                if voteValues["value"] == -1:
                    value = 1
                    vote.update(value=0)
                    if voteValues["saved"] == False:
                        vote.delete()
                elif voteValues["value"] == 1:
                    value = -2
                else:
                    value = -1
            elif clicked == 1:
                vote.update(value=clicked)
                if voteValues["value"] == -1:
                    value = 2
                elif voteValues["value"] == 1:
                    value = -1
                    vote.update(value=0)
                    if voteValues["saved"] == False:
                        vote.delete()
                else:
                    value = 1
            else:
                return Response(status=status.HTTP_400_BAD_REQUEST)
            Event.objects.filter(pk=eventId).update(
            likeCount=(event.likeCount + value))
        return Response(status=status.HTTP_200_OK)

class EventByDateView(viewsets.ModelViewSet):
    serializer_class = EventSerializer

    def get_queryset(self):
        startDate = self.request.query_params.get("startDate")
        endDate = self.request.query_params.get("endDate")
        startDate = stripDate(startDate)
        endDate = stripDate(endDate)
        events = Event.objects.filter(endDate__range=(
            startDate, endDate))

        return events

class EventBySearchView(viewsets.ModelViewSet):
    serializer_class = EventSearchSerializer

    def list(self, request):
        startDate = self.request.query_params.get("startDate")
        endDate = self.request.query_params.get("endDate")
        orderBy = self.request.query_params.get("orderBy")
        tag = self.request.query_params.get("tag")
        searchString = self.request.query_params.get("searchString")
        pagCount = self.request.query_params.get("pagCount")
        pagStart = self.request.query_params.get("pagStart")

        #pageRange = paginate(pagCount, pagStart)
        events = Event.objects
        if startDate:
            events = events.filter(startDate__gt=(stripDate(startDate)))
        if endDate:
            events = events.filter(endDate__lt=(stripDate(endDate)))
        if orderBy == "popular":
            events = events.order_by("-likeCount")
        elif orderBy == "recent":
            events = events.order_by("-createdDate")
        elif orderBy == "end":
            events = events.order_by("-endDate")
        elif orderBy == "start":
            events = events.order_by("startDate")
        else:
            events = events.order_by("-createdDate")
        if tag != "default" and tag != "all" and tag != None:
            events = events.filter(tag=tag)
        if searchString:
            events = events.filter(note__icontains=searchString)
        if pagCount and pagStart:
            count = events.count()
            pageRange = paginate(pagCount, pagStart)
            events = events[pageRange['start']:pageRange['end']]
            serializer = EventSearchSerializer(events, many=True)
        return Response(data={"events": serializer.data, "count": count})

class CommentsView(viewsets.ModelViewSet):
    serializer_class = CommentSerializer

    def get_queryset(self):
        eventId = self.request.query_params.get("eventId")
        pagCount = self.request.query_params.get("pagCount")
        pagStart = self.request.query_params.get("pagStart")
        userHeader = self.request.META.get("HTTP_AUTHORIZATION")
        if userHeader and pagCount and pagStart:
            user = getUser(userHeader)
            pageRange = paginate(pagCount, pagStart)
            comments = Comment.objects.filter(user=user)[pageRange['start']:pageRange['end']]
            return comments
        comments = Comment.objects.filter(event=eventId).order_by("createdDate")
        return comments

    def retrieve(self, request, pk=None):
        if pk != "count":
            return Response(status=status.HTTP_404_NOT_FOUND)
        userHeader = self.request.META.get("HTTP_AUTHORIZATION")
        user = getUser(userHeader)
        count = Comment.objects.filter(user=user).count()
        return Response(data=count, status=status.HTTP_200_OK)

    def create(self, request):
        text = request.data.get("text")
        eventId = request.data.get("eventId")
        belongsTo = request.data.get("belongsTo")
        userHeader = request.META.get("HTTP_AUTHORIZATION")
        if userHeader:
            userKey = userHeader.split("Token ")[1]
        else:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        userId = Token.objects.filter(key=userKey).values().first()["user_id"]
        user = User.objects.get(pk=userId)
        event = Event.objects.get(pk=eventId)
        Comment.objects.create(text=text, user=user, event=event, 
            belongsTo=belongsTo)
        return Response(status=status.HTTP_200_OK)

    def delete(self, request):
        commentId = request.data.get("commentId")
        userHeader = request.META.get("HTTP_AUTHORIZATION")
        if userHeader:
            userKey = userHeader.split("Token ")[1]
        else:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        userId = Token.objects.filter(key=userKey).values().first()["user_id"]

        comment = Comment.objects.filter(pk=commentId, user=userId)
        if not comment:
            return Response(status=status.HTTP_404_NOT_FOUND)
        else:
            comment = Comment.objects.filter(pk=commentId, user=userId).delete()
        return Response(status=status.HTTP_200_OK)

class UserAuthenticateView(viewsets.ModelViewSet):
    serializer_class = UserSerializer

    def get_queryset(self):
        userHeader = self.request.META.get("HTTP_AUTHORIZATION")
        if userHeader:
            userKey = userHeader.split("Token ")[1]
        else:
            return None
        userId = Token.objects.filter(key=userKey).values().first()["user_id"]
        user = User.objects.filter(pk=userId)
        return user

    def patch(self, request, *args, **kwargs):
        newPassword = request.data.get("newPassword")
        userHeader = request.META.get("HTTP_AUTHORIZATION")
        if not newPassword:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        if re.match(r"^[\w`~!@#$%\^&*(),.<>/?;:\\+=-]{12,100}$"):
            pass
        user = getUser(userHeader)
        user.set_password(newPassword)
        user.save()
        return Response(status=status.HTTP_200_OK)
