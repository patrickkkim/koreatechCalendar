import json, datetime
from dateutil import parser
from django.shortcuts import render
from django.http import HttpResponse
from django.http import Http404
from django.core.exceptions import ObjectDoesNotExist

from .models import Event, Value, Vote

# Create your views here.
def index(request):
    context = {
        "login": request.user.is_authenticated
    }
    return render(request, "calendars/index.html", context)

def loginView(request):
    return render(request, "calendars/login.html")

def registerView(request):
    return render(request, "calendars/register.html")

def getEvent(request):
    if request.method != "POST":
        raise Http404
    year = int(request.POST["year"])
    month = int(request.POST["month"])
    day = int(request.POST["day"])
    date = datetime.datetime(year, month, day)
    events = Event.objects.filter(startDate=date).values()
    
    jsonList = []
    for r in events:
        if r is not None:
            resultDict = {
                "id": r["id"],
                "startDate": r["startDate"].strftime("%Y-%m-%d"), 
                "endDate": r["endDate"].strftime("%Y-%m-%d"), 
                "note": r["note"], 
                "likeCount": r["likeCount"], 
                "user_id": r["user_id"],
            }
            jsonList.append(resultDict)
        else:
            return HttpResponse(json.dumps(None))

    return HttpResponse(json.dumps(jsonList))

def getUserLike(request):
    if request.method != "POST" or not request.user.is_authenticated:
        raise Http404
    dateStr = request.POST["startDate"]
    endDateStr = request.POST["endDate"]
    startDate = datetime.datetime.strptime(dateStr, "%Y-%m-%d")
    endDate = datetime.datetime.strptime(endDateStr, "%Y-%m-%d")
    
    vote = Vote.objects.get(user=request.user)
    values = list(vote.value.values().filter(event__startDate__range=(startDate, endDate)))

    return HttpResponse(json.dumps(values))

def updateLike(request):
    if request.method != "POST" or not request.user.is_authenticated:
        raise Http404
    value = json.loads(request.POST["value"])
    eventId = int(request.POST["eventId"])

    try:    # Try getting an Event with id.
        eventObj = Event.objects.get(id=eventId)
    except ObjectDoesNotExist:
        raise Http404

    # Create a Value and try getting a Vote with userId.
    valueObj = Value.objects.create(value=value, event=eventObj)
    try:    # Search for voteValues with the same Event.
        vote = Vote.objects.get(user=request.user)
        try:    # Delete the old Value and save a new one.
            valueObj = vote.value.get(event=eventObj)
            valueObj.delete()
            vote.save()
        except ObjectDoesNotExist:  # Save the Value.
            vote.value.add(valueObj)
            vote.save()
        if value: eventObj.likeCount += 1
        else: eventObj.likeCount -= 1
        eventObj.save()
        return HttpResponse("Success")
    except ObjectDoesNotExist:  # If not, make a new one.
        v = Vote.objects.create(user=request.user)
        v.value.add(valueObj)
        v.save()
        return HttpResponse("Fail")