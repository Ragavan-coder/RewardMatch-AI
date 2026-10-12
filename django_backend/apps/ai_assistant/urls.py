from django.urls import path
from .views import RAGQueryView

urlpatterns = [
    path("query", RAGQueryView.as_view(), name="rag-query"),
    path("chat", RAGQueryView.as_view(), name="assistant-chat"),
]
