from django.urls import include, path
from . import views

urlpatterns = [
    path("loginverify", views.login, name="login"),
    path("logout", views.logout, name="logout"),
    path("registerverify", views.register, name="register")
]