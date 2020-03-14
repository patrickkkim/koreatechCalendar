from django.shortcuts import render, redirect
from django.contrib.auth import authenticate
from django.contrib.auth import login as auth_login
from django.contrib.auth import logout as auth_logout
from django.http import Http404
from django.contrib.auth import get_user_model
User = get_user_model()

# Create your views here.
def login(request):
    if request.method != "POST":
        raise Http404
    username = request.POST["username"]
    password = request.POST["password"]
    user = authenticate(request, username=username, password=password)
    if user is not None:
        auth_login(request, user)
        return redirect("index")
    else:
        raise Http404

def logout(request):
    auth_logout(request)
    return redirect("index") 

def register(request):
    if request.method != "POST":
        raise Http404
    username = request.POST["username"]
    password = request.POST["password"]
    email = request.POST["email"]
    phoneNumber = request.POST["phone"]
    nickname = request.POST["nickname"]

    print(username, password, email, nickname, phoneNumber)

    user = User.objects.create_user(username, email, password, phoneNumber=phoneNumber,
        nickname=nickname)
    user.set_password(password)
    user.save()
    return redirect("index")