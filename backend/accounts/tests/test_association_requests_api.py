from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import AssociationRequest


User = get_user_model()


class AssociationRequestsApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="user@example.com",
            username="user",
            password="Password123!",
            first_name="U",
            last_name="Ser",
        )
        self.staff = User.objects.create_user(
            email="staff@example.com",
            username="staff",
            password="Password123!",
            first_name="S",
            last_name="Taff",
            is_staff=True,
        )

    def test_create_association_request_requires_auth(self):
        res = self.client.post(
            "/api/accounts/association-requests/",
            {"name": "Asso", "description": "Desc", "website_url": "https://example.com"},
            format="json",
        )
        self.assertEqual(res.status_code, 401)

    def test_user_can_create_association_request(self):
        self.client.force_authenticate(self.user)
        res = self.client.post(
            "/api/accounts/association-requests/",
            {"name": "Asso", "description": "Desc", "website_url": "https://example.com"},
            format="json",
        )
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.data["status"], AssociationRequest.Status.PENDING)

        req = AssociationRequest.objects.get(requested_by=self.user)
        self.assertEqual(req.name, "Asso")

    def test_user_cannot_have_two_pending_requests(self):
        self.client.force_authenticate(self.user)
        res1 = self.client.post(
            "/api/accounts/association-requests/",
            {"name": "Asso", "description": "Desc", "website_url": "https://example.com"},
            format="json",
        )
        self.assertEqual(res1.status_code, 201)

        res2 = self.client.post(
            "/api/accounts/association-requests/",
            {"name": "Asso2", "description": "Desc2", "website_url": "https://example.org"},
            format="json",
        )
        # API returns the existing pending request instead of failing
        self.assertEqual(res2.status_code, 200)
        self.assertEqual(res2.data["status"], AssociationRequest.Status.PENDING)
        self.assertEqual(AssociationRequest.objects.filter(requested_by=self.user).count(), 1)

    def test_only_staff_can_approve_or_reject(self):
        self.client.force_authenticate(self.user)
        create = self.client.post(
            "/api/accounts/association-requests/",
            {"name": "Asso", "description": "Desc", "website_url": "https://example.com"},
            format="json",
        )
        self.assertEqual(create.status_code, 201)
        req_id = create.data["id"]

        res = self.client.post(f"/api/accounts/association-requests/{req_id}/approve/", {}, format="json")
        self.assertEqual(res.status_code, 403)

        res = self.client.post(f"/api/accounts/association-requests/{req_id}/reject/", {}, format="json")
        self.assertEqual(res.status_code, 403)

    def test_staff_can_approve_and_user_gets_association(self):
        self.client.force_authenticate(self.user)
        create = self.client.post(
            "/api/accounts/association-requests/",
            {"name": "Asso", "description": "Desc", "website_url": "https://example.com"},
            format="json",
        )
        req_id = create.data["id"]

        self.client.force_authenticate(self.staff)
        res = self.client.post(
            f"/api/accounts/association-requests/{req_id}/approve/",
            {"review_note": "ok"},
            format="json",
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["status"], AssociationRequest.Status.APPROVED)

        self.user.refresh_from_db()
        self.assertIsNotNone(self.user.association_id)
        self.assertEqual(self.user.user_type, "admin")
