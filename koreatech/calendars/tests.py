import datetime
from django.test import TestCase
from .models import Event, Value, Vote
from django.contrib.auth import get_user_model
User = get_user_model()

# Create your tests here.
class EventTestCase(TestCase):
    def setUp(self):
        u1 = User.objects.create(phoneNumber="0101", nickname="artium", username="artium")
        u2 = User.objects.create(phoneNumber="0102", nickname="pat", username="kim")

        now = datetime.date.today()
        e1 = Event.objects.create(startDate=now, endDate=now, note="Hello!", user=u1)

    def testEvents(self):
        u1 = User.objects.get(username="artium")
        e1 = Event.objects.get(user=u1)
        print(e1.createdDate)
        self.assertEqual(e1.note, "Hello!")