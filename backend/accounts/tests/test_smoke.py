"""Smoke tests for the accounts module.

Goal: keep a minimal but meaningful safety net (exactly 5 tests).
"""

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient


User = get_user_model()


class AccountsSmokeTests(TestCase):
    def test_create_user_normalizes_email(self):
        raw_email = "Test@EXAMPLE.COM"
        user = User.objects.create_user(
            email=raw_email,
            username="testuser",
            password="pass12345!",
            first_name="Test",
            last_name="User",
        )

        self.assertEqual(user.email, User.objects.normalize_email(raw_email))
        self.assertTrue(user.check_password("pass12345!"))

    def test_create_user_without_email_raises(self):
        with self.assertRaises(ValueError):
            User.objects.create_user(
                email="",
                username="testuser",
                password="pass12345!",
                first_name="Test",
                last_name="User",
            )

    def test_create_superuser_sets_required_flags(self):
        admin = User.objects.create_superuser(
            email="admin@example.com",
            username="admin",
            password="pass12345!",
            first_name="Admin",
            last_name="User",
        )

        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)
        self.assertTrue(admin.is_active)

    def test_profile_is_created_automatically(self):
        user = User.objects.create_user(
            email="test@example.com",
            username="testuser",
            password="pass12345!",
            first_name="Test",
            last_name="User",
        )

        self.assertTrue(hasattr(user, "profile"))
        self.assertEqual(user.profile.user_id, user.id)

    def test_register_endpoint_creates_user_and_tokens(self):
        client = APIClient()

        payload = {
            "email": "newuser@example.com",
            "username": "newuser",
            "password": "StrongPass123!",
            "password2": "StrongPass123!",
            "first_name": "New",
            "last_name": "User",
        }

        response = client.post("/api/accounts/register/", payload, format="json")

        self.assertEqual(response.status_code, 201)
        self.assertIn("user", response.data)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["user"]["email"], payload["email"])
