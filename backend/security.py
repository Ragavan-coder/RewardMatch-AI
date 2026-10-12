import hashlib
import hmac
import os
import secrets
from typing import Tuple

SECRET_KEY = os.getenv("SECRET_KEY", "rewardmatch_fintech_secure_key_2025_prod")


def hash_password(password: str) -> str:
    """Hashes a password with a securely generated 16-byte random salt using PBKDF2-HMAC-SHA256."""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    return f"{salt}${key.hex()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against the stored salt$hash representation."""
    if not hashed_password or '$' not in hashed_password:
        return False
    try:
        salt, expected_hex = hashed_password.split('$', 1)
        actual_key = hashlib.pbkdf2_hmac(
            'sha256',
            plain_password.encode('utf-8'),
            salt.encode('utf-8'),
            100000
        )
        return hmac.compare_digest(actual_key.hex(), expected_hex)
    except Exception:
        return False


def generate_session_token(user_id: int, email: str) -> str:
    """Generates a secure random session token."""
    raw = f"{user_id}:{email}:{secrets.token_urlsafe(32)}"
    return secrets.token_urlsafe(40)
