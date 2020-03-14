from django.test import TestCase
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
User = get_user_model()

# Create your tests here.
class UserTestCase(TestCase):
    def setUp(self):
        u1 = User.objects.create_user(username="u1", nickname="u1", 
            phoneNumber="01061251234")
        u2 = User.objects.create_user(username="u2", nickname="u2", 
            phoneNumber="01023421234")
        u3 = User.objects.create_user(username="u3", nickname="u3", 
            phoneNumber="01033334444")

    def test_user(self):
        u1 = User.objects.get(username="u1")
        password = ""
        for i in range(0, 1000):
            password += str(i)
        u1.set_password(password)
        u1.save()
        u2 = User.objects.get(username="u2")
        u2.email = "blah"
        u2.save()
        u3 = User.objects.get(username="u3")
        u3.phoneNumber = "01087701402"
        u3.save()
        self.assertEqual("01087701402", User.objects.get(username="u3").phoneNumber)