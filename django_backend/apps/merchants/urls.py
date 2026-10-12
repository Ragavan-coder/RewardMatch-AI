from django.urls import path
from .views import MerchantPartnersListView

urlpatterns = [
    path("", MerchantPartnersListView.as_view(), name="merchant-partners-list"),
]
