from django.urls import path
from .views import TransactionsListView, SavingsSummaryView, RecordTransactionView

urlpatterns = [
    path("transactions", TransactionsListView.as_view(), name="transactions-list"),
    path("v1/savings/summary", SavingsSummaryView.as_view(), name="savings-summary"),
    path("v1/savings/transactions", RecordTransactionView.as_view(), name="savings-record-tx"),
]
