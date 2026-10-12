from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import SourceDocument, ensure_default_source_documents


class SourceDocumentsListView(APIView):
    """GET list of verified financial policy documents."""
    permission_classes = [AllowAny]
    def get(self, request):
        ensure_default_source_documents()
        docs = SourceDocument.objects.all()
        return Response([
            {
                "id": d.id,
                "title": d.title,
                "publisher": d.publisher,
                "source_url": d.source_url,
                "document_type": d.document_type,
                "verification_status": d.verification_status,
                "raw_content": d.raw_content,
            }
            for d in docs
        ])
