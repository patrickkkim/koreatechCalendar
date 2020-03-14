from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator

# Create your models here.
class User(AbstractUser):
    phoneNumber = models.CharField(max_length=11, validators=[
        RegexValidator(r'^\d{1,11}$')
    ], unique=True)
    nickname = models.CharField(max_length=100, unique=True)