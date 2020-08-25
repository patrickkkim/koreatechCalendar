from rest_framework import routers
from . import views

router = routers.DefaultRouter()
router.register(r"eventsbydate", views.EventByDateView, "eventDate")
router.register(r"events", views.EventView, "event")
router.register(r"votes", views.VoteView, "vote")
router.register(r"updatevote", views.UpdateVoteView, "updateVote")
router.register(r"eventbysearch", views.EventBySearchView, "eventSearch")
router.register(r"comments", views.CommentsView, "comments")
router.register(r"authenticate", views.UserAuthenticateView, "auth")

urlpatterns = router.urls