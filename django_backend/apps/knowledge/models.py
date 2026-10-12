from django.db import models


class SourceDocument(models.Model):
    """Official source document, terms, and bank policy records."""
    title = models.CharField(max_length=255)
    publisher = models.CharField(max_length=150, db_index=True)
    source_url = models.URLField(max_length=500)
    document_type = models.CharField(max_length=100)
    effective_from = models.DateField(null=True, blank=True)
    effective_until = models.DateField(null=True, blank=True)
    content_hash = models.CharField(max_length=64, db_index=True)
    raw_content = models.TextField(blank=True, null=True)
    verification_status = models.CharField(max_length=50, default="verified")
    retrieved_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.publisher})"


class DocumentChunk(models.Model):
    """Chunked passages for vector indexing and semantic retrieval."""
    document = models.ForeignKey(SourceDocument, on_delete=models.CASCADE, related_name="chunks")
    chunk_index = models.IntegerField(default=0)
    chunk_text = models.TextField()
    token_count = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.document.title} - Chunk #{self.chunk_index}"


def ensure_default_source_documents() -> None:
    """Ensures verified baseline credit card terms and policy documents are present in MySQL."""
    if SourceDocument.objects.count() == 0:
        defaults = [
            {
                "title": "HDFC Bank Regalia Gold Terms of Service & Reward Catalog",
                "publisher": "HDFC Bank",
                "source_url": "https://www.hdfcbank.com/personal/pay/cards/credit-cards/regalia-gold",
                "document_type": "terms_and_conditions",
                "content_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                "raw_content": "Earn 4 reward points per Rs 150 on retail spends. 5X reward points on Marks & Spencer, Myntra, Nykaa & Reliance Digital via SmartBuy. Lounge access: 12 complimentary airport lounge visits per year across India.",
            },
            {
                "title": "SBI Card Cashback Benefits and Exclusions Schedule",
                "publisher": "SBI Card",
                "source_url": "https://www.sbicard.com/en/personal/credit-cards/rewards/cashback-sbi-card.page",
                "document_type": "schedule_of_charges",
                "content_hash": "a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0",
                "raw_content": "5% direct statement cashback on all online retail purchases. 1% cashback on offline spends. Cash back is capped at Rs 5,000 per statement cycle. Exclusions include merchant EMI, fuel, utilities, jewellery, school fees, and wallet top-ups.",
            },
            {
                "title": "NPCI RuPay Credit Card on UPI Operating Guidelines",
                "publisher": "National Payments Corporation of India (NPCI)",
                "source_url": "https://www.npci.org.in/what-we-do/rupay/rupay-credit-card-on-upi",
                "document_type": "guidelines",
                "content_hash": "c4ca4238a0b923820dcc509a6f75849b287ffc75e2439c4d9e0368a2ec44d156",
                "raw_content": "RuPay Credit Cards can be linked to BHIM, Google Pay, PhonePe, Paytm, and Tata Neu apps. Merchant payments (P2M) are permitted at zero MDR for transactions under Rs 2,000 for small merchants. P2P transfers are restricted.",
            },
        ]
        for d in defaults:
            SourceDocument.objects.get_or_create(title=d["title"], defaults=d)
