"""
RewardMatch AI - RAG and AI Threat Defense Module
Detects and mitigates prompt injection, jailbreaking, cross-user document leakage,
system prompt extraction, and instruction hijacking.
"""

import re
from typing import Tuple, List

# Suspicious prompt injection patterns
INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?(previous|prior|above)\s+instructions",
    r"disregard\s+(all\s+)?(previous|system|safety)\s+rules",
    r"you\s+are\s+now\s+(in\s+)?(dan|developer|god|unrestricted)\s+mode",
    r"(reveal|print|show|dump|leak)\s+(the\s+)?(secret|api_key|password|env|token|system\s+prompt)",
    r"<\s*\|\s*im_start\s*\|",
    r"\[\s*system\s*\]",
    r"jailbreak",
    r"override\s+(application|security|reward)\s+policy",
    r"pretend\s+you\s+have\s+no\s+(rules|restrictions|filters)",
]

COMPILED_PATTERNS = [re.compile(p, re.IGNORECASE) for p in INJECTION_PATTERNS]


class RAGSecurityGuard:
    """Guards the RAG conversational assistant against prompt injection and cross-user data exfiltration."""

    @classmethod
    def inspect_prompt(cls, prompt: str) -> Tuple[bool, str]:
        """
        Scans user input for adversarial prompt injection attempts.
        Returns (is_threat: bool, threat_reason: str).
        """
        if not prompt or not isinstance(prompt, str):
            return False, "Safe"

        for pattern in COMPILED_PATTERNS:
            if pattern.search(prompt):
                return True, f"Suspicious prompt pattern detected: '{pattern.pattern}'"

        return False, "Safe"

    @classmethod
    def sanitize_input(cls, text: str) -> str:
        """Sanitizes user input by stripping delimiter injections and zero-width characters."""
        if not text:
            return ""

        # Remove zero-width spaces / stealth control characters
        text = re.sub(r"[\u200B-\u200D\uFEFF]", "", text)
        # Strip potential template delimiters
        text = text.replace("{{", "").replace("}}", "")
        text = text.replace("<|im_start|>", "").replace("<|im_end|>", "")

        return text.strip()

    @classmethod
    def filter_documents_for_user(cls, documents: List[dict], user_id: int) -> List[dict]:
        """
        Ensures users only retrieve public catalog policies or documents owned by themselves.
        Strictly prevents cross-user document retrieval.
        """
        safe_docs = []
        for doc in documents:
            doc_owner = doc.get("owner_id")
            # Public verified documents have owner_id == None or 'public'
            if doc_owner is None or doc_owner == "public" or doc_owner == user_id:
                safe_docs.append(doc)
        return safe_docs
