from django.urls import path
from .views import OfferListView, UpiOffersView

urlpatterns = [
    path("", OfferListView.as_view(), name="offers-list"),
    path("upi", UpiOffersView.as_view(), name="offers-upi"),
]
