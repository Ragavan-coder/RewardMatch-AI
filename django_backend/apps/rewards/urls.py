from django.urls import path
from .views import RewardRulesListView, RewardCalculateView

urlpatterns = [
    path("rules", RewardRulesListView.as_view(), name="reward-rules-list"),
    path("calculate", RewardCalculateView.as_view(), name="reward-calculate"),
]
