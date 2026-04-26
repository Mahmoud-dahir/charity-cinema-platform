from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from accounts.models import Association
from events.models import Event, Signup
from interactions.models import Comment, Favorite


User = get_user_model()


class DashboardApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.association = Association.objects.create(name="Asso")
        self.editor = User.objects.create_user(
            email="editor@example.com",
            username="editor",
            password="Password123!",
            first_name="Ed",
            last_name="Itor",
            user_type="admin",
            association=self.association,
        )
        self.member = User.objects.create_user(
            email="member@example.com",
            username="member",
            password="Password123!",
            first_name="Mem",
            last_name="Ber",
            user_type="user",
        )

        now = timezone.now()
        self.draft = Event.objects.create(
            title="Draft",
            movie_title="Film",
            description="Desc",
            starts_at=now + timezone.timedelta(days=10),
            location="Lyon",
            status=Event.Status.DRAFT,
            created_by=self.editor,
            association=self.association,
        )
        self.published = Event.objects.create(
            title="Pub",
            movie_title="Film",
            description="Desc",
            starts_at=now + timezone.timedelta(days=11),
            location="Lyon",
            status=Event.Status.PUBLISHED,
            published_at=now,
            created_by=self.editor,
            association=self.association,
        )
        self.cancelled = Event.objects.create(
            title="Canc",
            movie_title="Film",
            description="Desc",
            starts_at=now + timezone.timedelta(days=12),
            location="Lyon",
            status=Event.Status.CANCELLED,
            cancel_reason="Test",
            created_by=self.editor,
            association=self.association,
        )

        # interactions on published
        Favorite.objects.create(user=self.editor, event=self.published)
        Favorite.objects.create(user=self.member, event=self.published)
        Comment.objects.create(user=self.editor, event=self.published, body="c1")
        Comment.objects.create(user=self.editor, event=self.published, body="c2")
        Signup.objects.create(user=self.member, event=self.published)

    def test_dashboard_requires_auth(self):
        res = self.client.get("/api/dashboard/overview/")
        self.assertEqual(res.status_code, 401)

        res = self.client.get("/api/dashboard/events/")
        self.assertEqual(res.status_code, 401)

    def test_dashboard_requires_association(self):
        self.client.force_authenticate(self.member)
        res = self.client.get("/api/dashboard/overview/")
        self.assertEqual(res.status_code, 403)

    def test_overview_counts(self):
        self.client.force_authenticate(self.editor)
        res = self.client.get("/api/dashboard/overview/")
        self.assertEqual(res.status_code, 200)

        self.assertEqual(res.data["events"]["total"], 3)
        self.assertEqual(res.data["events"]["draft"], 1)
        self.assertEqual(res.data["events"]["published"], 1)
        self.assertEqual(res.data["events"]["cancelled"], 1)

        self.assertEqual(res.data["totals"]["favorites"], 2)
        self.assertEqual(res.data["totals"]["comments"], 2)
        self.assertEqual(res.data["totals"]["signups"], 1)

    def test_events_list_includes_counts(self):
        self.client.force_authenticate(self.editor)
        res = self.client.get("/api/dashboard/events/")
        self.assertEqual(res.status_code, 200)

        by_id = {e["id"]: e for e in res.data}

        self.assertIn(self.published.id, by_id)
        published = by_id[self.published.id]
        self.assertEqual(published["favorites_count"], 2)
        self.assertEqual(published["comments_count"], 2)
        self.assertEqual(published["signups_count"], 1)

        draft = by_id[self.draft.id]
        self.assertEqual(draft["favorites_count"], 0)
        self.assertEqual(draft["comments_count"], 0)
        self.assertEqual(draft["signups_count"], 0)
