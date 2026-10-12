from django.urls import path
from .views import SourceDocumentsListView

urlpatterns = [
    path("documents", SourceDocumentsListView.as_view(), name="knowledge-documents"),
]
