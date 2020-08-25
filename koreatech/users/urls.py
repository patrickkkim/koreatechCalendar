from django.urls import include, path
from django.conf.urls import url
from rest_framework import routers
from rest_framework.authtoken import views
from . import views as userViews

#router.register(r"logout", views.logout, "logout")
#router.register(r"registerverify", views.register, "register")

urlpatterns = [
	path('loginverify/', views.obtain_auth_token, name="login"),
	path('logout/', userViews.Logout.as_view(), name="logout"),
]