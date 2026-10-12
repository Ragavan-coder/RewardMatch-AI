from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.contrib.auth.hashers import identify_hasher


class AuthenticationSecurityTestCase(TestCase):
    """Tests password hashing security, endpoints, and registration."""

    def setUp(self):
        self.client = Client()

    def test_argon2id_hasher_used(self):
        """Verifies that new user passwords use the memory-hard Argon2id hasher."""
        user = User.objects.create_user(username="argon2_user", password="StrongPassword987!")
        hasher = identify_hasher(user.password)
        self.assertEqual(hasher.algorithm, "argon2")

    def test_health_check_endpoint(self):
        """Verifies the health check endpoint returns 200 and healthy status."""
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        self.assertIn("status", response.json())
        self.assertEqual(response.json()["tagline"], "Swipe Smarter. Save Bigger.")
