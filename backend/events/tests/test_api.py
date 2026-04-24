from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from events.models import Event


User = get_user_model()


class EventsPublicApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.admin = User.objects.create_user(
            email="admin@example.com",
            username="admin",
            password="Password123!",
            user_type="admin",
        )
        self.member = User.objects.create_user(
            email="member@example.com",
            username="member",
            password="Password123!",
            user_type="member",
        )

        now = timezone.now()

        self.published = Event.objects.create(
            title="Soirée caritative",
            movie_title="Inception",
            description="Projection + don",
            starts_at=now + timezone.timedelta(days=2),
            location="Lyon",
            status=Event.Status.PUBLISHED,
            created_by=self.admin,
        )
        self.draft = Event.objects.create(
            title="Brouillon interne",
            movie_title="Interstellar",
            description="Draft",
            starts_at=now + timezone.timedelta(days=3),
            location="Villeurbanne",
            status=Event.Status.DRAFT,
            created_by=self.admin,
        )

    def test_list_is_public_and_only_published(self):
        res = self.client.get("/api/events/")
        self.assertEqual(res.status_code, 200)

        ids = [item["id"] for item in res.data]
        self.assertIn(self.published.id, ids)
        self.assertNotIn(self.draft.id, ids)

    def test_search_q_matches_movie_title(self):
        res = self.client.get("/api/events/?q=inception")
        self.assertEqual(res.status_code, 200)
        ids = [item["id"] for item in res.data]
        self.assertEqual(ids, [self.published.id])

    def test_filter_location(self):
        res = self.client.get("/api/events/?location=lyon")
        self.assertEqual(res.status_code, 200)
        ids = [item["id"] for item in res.data]
        self.assertEqual(ids, [self.published.id])

    def test_member_still_only_sees_published(self):
        self.client.force_authenticate(self.member)
        res = self.client.get("/api/events/")
        self.assertEqual(res.status_code, 200)

        ids = [item["id"] for item in res.data]
        self.assertIn(self.published.id, ids)
        self.assertNotIn(self.draft.id, ids)

    def test_admin_can_see_drafts(self):
        self.client.force_authenticate(self.admin)
        res = self.client.get("/api/events/")
        self.assertEqual(res.status_code, 200)

        ids = [item["id"] for item in res.data]
        self.assertIn(self.published.id, ids)
        self.assertIn(self.draft.id, ids)
