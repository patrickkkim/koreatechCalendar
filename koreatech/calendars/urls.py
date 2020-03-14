from django.urls import include, path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.loginView, name="loginView"),
    path("register", views.registerView, name="registerView"),
    path("getevent", views.getEvent, name="getEvent"),
    path("updatelike", views.updateLike, name="updateLike"),
    path("getuserlike", views.getUserLike, name="getUserLike"),
]