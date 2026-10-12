from django.urls import path
from .views import MerchantListView, TrackedProductsView

urlpatterns = [
    path("merchants", MerchantListView.as_view(), name="monitor-merchants"),
    path("products", TrackedProductsView.as_view(), name="monitor-products"),
]
