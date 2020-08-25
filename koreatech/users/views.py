from django.shortcuts import render, redirect
from django.http import Http404
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
User = get_user_model()

# Create your views here.
class Logout(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, format=None):
        try:
            request.auth.delete()
            return Response(status=status.HTTP_200_OK, data={"success": True})
        except(AttributeError):
            return Response(status=status.HTTP_404_NOT_FOUND)

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