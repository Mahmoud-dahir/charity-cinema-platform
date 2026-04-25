from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from accounts.models import Association
from events.models import Event


User = get_user_model()


class FavoritesApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.association = Association.objects.create(name="Asso")
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
        self.cancelled = Event.objects.create(
            title="Annulé",
            movie_title="Film",
            description="Desc",
            starts_at=now + timezone.timedelta(days=6),
            location="Lyon",
            status=Event.Status.CANCELLED,
            cancel_reason="Test",
            created_by=self.editor,
            association=self.association,
        )
        self.draft = Event.objects.create(
            title="Draft",
            movie_title="Film",
            description="Desc",
            starts_at=now + timezone.timedelta(days=7),
            location="Lyon",
            status=Event.Status.DRAFT,
            created_by=self.editor,
            association=self.association,
        )

    def test_favorite_requires_auth(self):
        res = self.client.post(f"/api/events/{self.published.id}/favorite/", {}, format="json")
        self.assertEqual(res.status_code, 401)

    def test_member_can_favorite_published_event(self):
        self.client.force_authenticate(self.member)
        res = self.client.post(f"/api/events/{self.published.id}/favorite/", {}, format="json")
        self.assertEqual(res.status_code, 201)

        res2 = self.client.post(f"/api/events/{self.published.id}/favorite/", {}, format="json")
        self.assertEqual(res2.status_code, 400)

        res3 = self.client.delete(f"/api/events/{self.published.id}/favorite/")
        self.assertEqual(res3.status_code, 204)

        res4 = self.client.delete(f"/api/events/{self.published.id}/favorite/")
        self.assertEqual(res4.status_code, 204)

    def test_favorite_is_refused_on_cancelled(self):
        self.client.force_authenticate(self.member)
        res = self.client.post(f"/api/events/{self.cancelled.id}/favorite/", {}, format="json")
        self.assertEqual(res.status_code, 400)

    def test_member_cannot_favorite_draft_event(self):
        self.client.force_authenticate(self.member)
        res = self.client.post(f"/api/events/{self.draft.id}/favorite/", {}, format="json")
        self.assertEqual(res.status_code, 404)


class CommentsApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.association = Association.objects.create(name="Asso")
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
        self.other = User.objects.create_user(
            email="other@example.com",
            username="other",
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
        self.cancelled = Event.objects.create(
            title="Annulé",
            movie_title="Film",
            description="Desc",
            starts_at=now + timezone.timedelta(days=6),
            location="Lyon",
            status=Event.Status.CANCELLED,
            cancel_reason="Test",
            created_by=self.editor,
            association=self.association,
        )

    def test_list_comments_is_public(self):
        res = self.client.get(f"/api/events/{self.published.id}/comments/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data, [])

    def test_post_comment_requires_auth(self):
        res = self.client.post(
            f"/api/events/{self.published.id}/comments/",
            {"body": "Hello"},
            format="json",
        )
        self.assertEqual(res.status_code, 401)

    def test_user_can_post_multiple_comments_on_same_event(self):
        self.client.force_authenticate(self.member)
        res1 = self.client.post(
            f"/api/events/{self.published.id}/comments/",
            {"body": "Premier"},
            format="json",
        )
        self.assertEqual(res1.status_code, 201)
        res2 = self.client.post(
            f"/api/events/{self.published.id}/comments/",
            {"body": "Deuxième"},
            format="json",
        )
        self.assertEqual(res2.status_code, 201)

        res_list = self.client.get(f"/api/events/{self.published.id}/comments/")
        self.assertEqual(res_list.status_code, 200)
        self.assertEqual(len(res_list.data), 2)

    def test_comment_is_refused_on_cancelled_event(self):
        self.client.force_authenticate(self.member)
        res = self.client.post(
            f"/api/events/{self.cancelled.id}/comments/",
            {"body": "Test"},
            format="json",
        )
        self.assertEqual(res.status_code, 400)

    def test_edit_and_delete_comment_author_only(self):
        self.client.force_authenticate(self.member)
        res = self.client.post(
            f"/api/events/{self.published.id}/comments/",
            {"body": "Original"},
            format="json",
        )
        self.assertEqual(res.status_code, 201)
        comment_id = res.data["id"]

        self.client.force_authenticate(self.other)
        res = self.client.patch(f"/api/comments/{comment_id}/", {"body": "Hack"}, format="json")
        self.assertEqual(res.status_code, 403)
        res = self.client.delete(f"/api/comments/{comment_id}/")
        self.assertEqual(res.status_code, 403)

        self.client.force_authenticate(self.member)
        res = self.client.patch(f"/api/comments/{comment_id}/", {"body": "Modifié"}, format="json")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["body"], "Modifié")

        res = self.client.delete(f"/api/comments/{comment_id}/")
        self.assertEqual(res.status_code, 204)
