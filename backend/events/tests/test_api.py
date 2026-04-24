from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from accounts.models import Association
from events.models import Event


User = get_user_model()


class EventsPublicApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.association = Association.objects.create(name="Ciné Solidarité")
        self.editor = User.objects.create_user(
            email="editor@example.com",
            username="editor",
            password="Password123!",
            user_type="admin",
            association=self.association,
        )
        self.member = User.objects.create_user(
            email="member@example.com",
            username="member",
            password="Password123!",
            user_type="user",
        )

        now = timezone.now()

        self.published = Event.objects.create(
            title="Soirée caritative",
            movie_title="Inception",
            description="Projection + don",
            starts_at=now + timezone.timedelta(days=2),
            location="Lyon",
            status=Event.Status.PUBLISHED,
            created_by=self.editor,
            association=self.association,
        )
        self.draft = Event.objects.create(
            title="Brouillon interne",
            movie_title="Interstellar",
            description="Draft",
            starts_at=now + timezone.timedelta(days=3),
            location="Villeurbanne",
            status=Event.Status.DRAFT,
            created_by=self.editor,
            association=self.association,
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

    def test_editor_can_see_drafts(self):
        self.client.force_authenticate(self.editor)
        res = self.client.get("/api/events/")
        self.assertEqual(res.status_code, 200)

        ids = [item["id"] for item in res.data]
        self.assertIn(self.published.id, ids)
        self.assertIn(self.draft.id, ids)


class EventsEditorApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.association = Association.objects.create(name="Asso 1")
        self.other_association = Association.objects.create(name="Asso 2")

        self.editor = User.objects.create_user(
            email="editor@example.com",
            username="editor",
            password="Password123!",
            user_type="admin",
            association=self.association,
        )
        self.other_editor = User.objects.create_user(
            email="other_editor@example.com",
            username="other_editor",
            password="Password123!",
            user_type="admin",
            association=self.other_association,
        )
        self.member = User.objects.create_user(
            email="member@example.com",
            username="member",
            password="Password123!",
            user_type="user",
        )

        self.draft = Event.objects.create(
            title="Draft",
            movie_title="Movie",
            description="Draft",
            starts_at=timezone.now() + timezone.timedelta(days=3),
            location="Lyon",
            status=Event.Status.DRAFT,
            created_by=self.editor,
            association=self.association,
        )

    def test_member_cannot_create_event(self):
        self.client.force_authenticate(self.member)
        res = self.client.post(
            "/api/events/",
            {
                "title": "New",
                "movie_title": "Film",
                "description": "Desc",
                "starts_at": (timezone.now() + timezone.timedelta(days=10)).isoformat(),
                "location": "Lyon",
            },
            format="json",
        )
        self.assertEqual(res.status_code, 403)

    def test_editor_can_create_event_and_association_is_forced(self):
        self.client.force_authenticate(self.editor)
        res = self.client.post(
            "/api/events/",
            {
                "title": "New",
                "movie_title": "Film",
                "description": "Desc",
                "starts_at": (timezone.now() + timezone.timedelta(days=10)).isoformat(),
                "location": "Lyon",
                # Attempt to override association must be ignored (read-only)
                "association": str(self.other_association.id),
            },
            format="json",
        )
        self.assertEqual(res.status_code, 201)
        self.assertEqual(str(res.data["association"]), str(self.association.id))
        self.assertEqual(str(res.data["created_by"]), str(self.editor.id))
        self.assertEqual(res.data["status"], Event.Status.DRAFT)

    def test_editor_cannot_publish_other_association_event(self):
        self.client.force_authenticate(self.other_editor)
        res = self.client.post(f"/api/events/{self.draft.id}/publish/", {}, format="json")
        self.assertEqual(res.status_code, 403)

    def test_publish_action_publishes_draft(self):
        self.client.force_authenticate(self.editor)
        res = self.client.post(f"/api/events/{self.draft.id}/publish/", {}, format="json")
        self.assertEqual(res.status_code, 200)
        self.draft.refresh_from_db()
        self.assertEqual(self.draft.status, Event.Status.PUBLISHED)
        self.assertIsNotNone(self.draft.published_at)

    def test_cancel_requires_reason(self):
        self.client.force_authenticate(self.editor)
        res = self.client.post(f"/api/events/{self.draft.id}/cancel/", {}, format="json")
        self.assertEqual(res.status_code, 400)
        self.assertIn("cancel_reason", res.data)

    def test_cancel_action_sets_status_and_reason(self):
        self.client.force_authenticate(self.editor)
        res = self.client.post(
            f"/api/events/{self.draft.id}/cancel/",
            {"cancel_reason": "Mauvaise météo"},
            format="json",
        )
        self.assertEqual(res.status_code, 200)
        self.draft.refresh_from_db()
        self.assertEqual(self.draft.status, Event.Status.CANCELLED)
        self.assertEqual(self.draft.cancel_reason, "Mauvaise météo")

    def test_status_is_read_only_on_patch(self):
        self.client.force_authenticate(self.editor)
        res = self.client.patch(
            f"/api/events/{self.draft.id}/",
            {"status": Event.Status.PUBLISHED},
            format="json",
        )
        self.assertEqual(res.status_code, 200)
        self.draft.refresh_from_db()
        self.assertEqual(self.draft.status, Event.Status.DRAFT)


class EventsSignupApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.association = Association.objects.create(name="Asso 1")
        self.other_association = Association.objects.create(name="Asso 2")

        self.editor = User.objects.create_user(
            email="editor@example.com",
            username="editor",
            password="Password123!",
            user_type="admin",
            association=self.association,
        )
        self.other_editor = User.objects.create_user(
            email="other_editor@example.com",
            username="other_editor",
            password="Password123!",
            user_type="admin",
            association=self.other_association,
        )
        self.member = User.objects.create_user(
            email="member@example.com",
            username="member",
            password="Password123!",
            user_type="user",
        )
        self.member2 = User.objects.create_user(
            email="member2@example.com",
            username="member2",
            password="Password123!",
            user_type="user",
        )

        now = timezone.now()
        self.published = Event.objects.create(
            title="Publié",
            movie_title="Film",
            description="Desc",
            starts_at=now + timezone.timedelta(days=5),
            location="Lyon",
            status=Event.Status.PUBLISHED,
            published_at=now,
            created_by=self.editor,
            association=self.association,
        )
        self.draft = Event.objects.create(
            title="Brouillon",
            movie_title="Film",
            description="Desc",
            starts_at=now + timezone.timedelta(days=6),
            location="Lyon",
            status=Event.Status.DRAFT,
            created_by=self.editor,
            association=self.association,
        )
        self.cancelled = Event.objects.create(
            title="Annulé",
            movie_title="Film",
            description="Desc",
            starts_at=now + timezone.timedelta(days=7),
            location="Lyon",
            status=Event.Status.CANCELLED,
            cancel_reason="Test",
            created_by=self.editor,
            association=self.association,
        )

    def test_member_can_signup_published_event(self):
        self.client.force_authenticate(self.member)
        res = self.client.post(f"/api/events/{self.published.id}/signup/", {}, format="json")
        self.assertEqual(res.status_code, 201)

        res2 = self.client.post(f"/api/events/{self.published.id}/signup/", {}, format="json")
        self.assertEqual(res2.status_code, 400)

    def test_unsubscribe_is_allowed_and_idempotent(self):
        self.client.force_authenticate(self.member)
        self.client.post(f"/api/events/{self.published.id}/signup/", {}, format="json")

        res = self.client.delete(f"/api/events/{self.published.id}/signup/")
        self.assertEqual(res.status_code, 204)

        res2 = self.client.delete(f"/api/events/{self.published.id}/signup/")
        self.assertEqual(res2.status_code, 204)

    def test_signup_requires_published_event(self):
        self.client.force_authenticate(self.member)

        res = self.client.post(f"/api/events/{self.draft.id}/signup/", {}, format="json")
        self.assertEqual(res.status_code, 400)

        res = self.client.post(f"/api/events/{self.cancelled.id}/signup/", {}, format="json")
        self.assertEqual(res.status_code, 400)

    def test_capacity_is_enforced(self):
        now = timezone.now()
        limited = Event.objects.create(
            title="Capacité 1",
            movie_title="Film",
            description="Desc",
            starts_at=now + timezone.timedelta(days=10),
            location="Lyon",
            status=Event.Status.PUBLISHED,
            published_at=now,
            capacity=1,
            created_by=self.editor,
            association=self.association,
        )

        self.client.force_authenticate(self.member)
        res = self.client.post(f"/api/events/{limited.id}/signup/", {}, format="json")
        self.assertEqual(res.status_code, 201)

        self.client.force_authenticate(self.member2)
        res = self.client.post(f"/api/events/{limited.id}/signup/", {}, format="json")
        self.assertEqual(res.status_code, 400)

    def test_editor_can_also_signup(self):
        self.client.force_authenticate(self.editor)
        res = self.client.post(f"/api/events/{self.published.id}/signup/", {}, format="json")
        self.assertEqual(res.status_code, 201)

    def test_participants_list_permissions_and_minimal_payload(self):
        self.client.force_authenticate(self.member)
        self.client.post(f"/api/events/{self.published.id}/signup/", {}, format="json")
        self.client.force_authenticate(self.editor)
        self.client.post(f"/api/events/{self.published.id}/signup/", {}, format="json")

        # Member cannot access participants
        self.client.force_authenticate(self.member)
        res = self.client.get(f"/api/events/{self.published.id}/participants/")
        self.assertEqual(res.status_code, 403)

        # Other association editor cannot access
        self.client.force_authenticate(self.other_editor)
        res = self.client.get(f"/api/events/{self.published.id}/participants/")
        self.assertEqual(res.status_code, 403)

        # Correct association editor can access
        self.client.force_authenticate(self.editor)
        res = self.client.get(f"/api/events/{self.published.id}/participants/")
        self.assertEqual(res.status_code, 200)
        self.assertTrue(isinstance(res.data, list))
        self.assertGreaterEqual(len(res.data), 2)

        first = res.data[0]
        self.assertIn("id", first)
        self.assertIn("username", first)
        self.assertIn("first_name", first)
        self.assertIn("last_name", first)
