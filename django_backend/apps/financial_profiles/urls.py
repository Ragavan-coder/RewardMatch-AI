from django.urls import path
from .views import CardsListView, SimulateSwipeView, BanksListView

urlpatterns = [
    path("cards", CardsListView.as_view(), name="cards-list"),
    path("cards/simulate-swipe", SimulateSwipeView.as_view(), name="cards-simulate"),
    path("auth/banks", BanksListView.as_view(), name="banks-list"),
]
