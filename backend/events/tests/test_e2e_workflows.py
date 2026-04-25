import io
import shutil
import tempfile

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.test.utils import override_settings
from django.utils import timezone
from PIL import Image
from rest_framework.test import APIClient

from accounts.models import Association, AssociationRequest
from events.models import Event


User = get_user_model()


def _make_png(name: str = "image.png"):
    buf = io.BytesIO()
    image = Image.new("RGB", (2, 2), color=(255, 0, 0))
    image.save(buf, format="PNG")
    return SimpleUploadedFile(name=name, content=buf.getvalue(), content_type="image/png")


class E2EWorkflowsTests(TestCase):
    def setUp(self):
        self._media_root = tempfile.mkdtemp(prefix="test-media-")
        self._override_media = override_settings(MEDIA_ROOT=self._media_root)
        self._override_media.enable()

        self.client = APIClient()

        self.staff_password = "Password123!"
        self.staff = User.objects.create_user(
            email="staff@example.com",
            username="staff",
            password=self.staff_password,
            first_name="Staff",
            last_name="User",
            is_staff=True,
        )

    def tearDown(self):
        try:
            self._override_media.disable()
        finally:
            shutil.rmtree(self._media_root, ignore_errors=True)

    def _register(self, email: str, username: str, password: str = "StrongPass123!"):
        res = self.client.post(
            "/api/accounts/register/",
            {
                "email": email,
                "username": username,
                "password": password,
                "password2": password,
                "first_name": "First",
                "last_name": "Last",
            },
            format="json",
        )
        self.assertEqual(res.status_code, 201)
        return {
            "access": res.data["access"],
            "refresh": res.data["refresh"],
            "user": res.data["user"],
            "password": password,
        }

    def _login(self, email: str, password: str):
        res = self.client.post(
            "/api/accounts/login/",
            {"email": email, "password": password},
            format="json",
        )
        self.assertEqual(res.status_code, 200)
        self.assertIn("access", res.data)
        return res.data["access"]

    def _auth_as_token(self, access: str):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

    def _clear_auth(self):
        self.client.credentials()

    def test_e2e_editor_workflow_association_request_events_images_publish_modify_cancel(self):
        # User registers then logs in
        reg = self._register("editor1@example.com", "editor1")
        access = self._login("editor1@example.com", reg["password"])
        self._auth_as_token(access)

        # Create association request
        res = self.client.post(
            "/api/accounts/association-requests/",
            {"name": "Cine Club", "description": "Desc", "website_url": "https://cine.example"},
            format="json",
        )
        self.assertEqual(res.status_code, 201)
        req_id = res.data["id"]

        # Staff approves request
        staff_client = APIClient()
        staff_login = staff_client.post(
            "/api/accounts/login/",
            {"email": self.staff.email, "password": self.staff_password},
            format="json",
        )
        self.assertEqual(staff_login.status_code, 200)
        staff_client.credentials(HTTP_AUTHORIZATION=f"Bearer {staff_login.data['access']}")

        approve = staff_client.post(
            f"/api/accounts/association-requests/{req_id}/approve/",
            {"review_note": "ok"},
            format="json",
        )
        self.assertEqual(approve.status_code, 200)
        self.assertEqual(approve.data["status"], AssociationRequest.Status.APPROVED)

        # Create 3 events with images then publish
        now = timezone.now()
        event_ids: list[str] = []
        for i in range(1, 4):
            payload = {
                "title": f"Event {i}",
                "movie_title": f"Film {i}",
                "description": "Desc",
                "starts_at": (now + timezone.timedelta(days=10 + i)).isoformat(),
                "location": "Lyon",
                "capacity": 10,
                "cover_image": _make_png(f"event_{i}.png"),
            }
            create = self.client.post("/api/events/", payload, format="multipart")
            self.assertEqual(create.status_code, 201, create.data)
            event_id = create.data["id"]
            event_ids.append(event_id)

            publish = self.client.post(f"/api/events/{event_id}/publish/", {}, format="json")
            self.assertEqual(publish.status_code, 200)
            self.assertEqual(publish.data["status"], Event.Status.PUBLISHED)

        # Modify 1 event
        patch = self.client.patch(
            f"/api/events/{event_ids[0]}/",
            {"title": "Event 1 (modifié)", "location": "Villeurbanne"},
            format="json",
        )
        self.assertEqual(patch.status_code, 200)
        self.assertEqual(patch.data["title"], "Event 1 (modifié)")

        # Cancel ("retire de publication") another event
        cancel = self.client.post(
            f"/api/events/{event_ids[1]}/cancel/",
            {"cancel_reason": "Annulé"},
            format="json",
        )
        self.assertEqual(cancel.status_code, 200)
        self.assertEqual(cancel.data["status"], Event.Status.CANCELLED)

    def test_e2e_member_workflow_search_detail_like_signup_unsubscribe_comment_logout(self):
        # Setup: published events from an existing association/editor
        association = Association.objects.create(name="Asso")
        editor = User.objects.create_user(
            email="editor2@example.com",
            username="editor2",
            password="Password123!",
            first_name="Ed",
            last_name="Itor",
            user_type="admin",
            association=association,
        )

        now = timezone.now()
        event1 = Event.objects.create(
            title="Soirée Film",
            movie_title="Interstellar",
            description="Desc",
            starts_at=now + timezone.timedelta(days=5),
            location="Lyon",
            status=Event.Status.PUBLISHED,
            published_at=now,
            created_by=editor,
            association=association,
        )
        event2 = Event.objects.create(
            title="Projection",
            movie_title="Inception",
            description="Desc",
            starts_at=now + timezone.timedelta(days=6),
            location="Lyon 1",
            status=Event.Status.PUBLISHED,
            published_at=now,
            created_by=editor,
            association=association,
        )

        # User registers then logs in
        reg = self._register("member1@example.com", "member1")
        access = self._login("member1@example.com", reg["password"])
        self._auth_as_token(access)

        # Search events using filters
        res = self.client.get("/api/events/?q=In&location=lyon&status=published")
        self.assertEqual(res.status_code, 200)
        self.assertGreaterEqual(len(res.data), 2)

        # Consult event details
        detail = self.client.get(f"/api/events/{event1.id}/")
        self.assertEqual(detail.status_code, 200)
        self.assertEqual(detail.data["id"], event1.id)

        # Like one event
        fav = self.client.post(f"/api/events/{event1.id}/favorite/", {}, format="json")
        self.assertEqual(fav.status_code, 201)

        # Sign up to 2 events
        s1 = self.client.post(f"/api/events/{event1.id}/signup/", {}, format="json")
        self.assertEqual(s1.status_code, 201)
        s2 = self.client.post(f"/api/events/{event2.id}/signup/", {}, format="json")
        self.assertEqual(s2.status_code, 201)

        # Unsubscribe from 1 event
        u1 = self.client.delete(f"/api/events/{event2.id}/signup/")
        self.assertEqual(u1.status_code, 204)

        # Leave 4 comments on the other event
        for i in range(4):
            c = self.client.post(
                f"/api/events/{event1.id}/comments/",
                {"body": f"Comment {i}"},
                format="json",
            )
            self.assertEqual(c.status_code, 201)

        comments = self.client.get(f"/api/events/{event1.id}/comments/")
        self.assertEqual(comments.status_code, 200)
        self.assertGreaterEqual(len(comments.data), 4)

        # Logout (JWT is stateless: we just clear auth header)
        self._clear_auth()
        post_after_logout = self.client.post(
            f"/api/events/{event1.id}/comments/",
            {"body": "Should fail"},
            format="json",
        )
        self.assertEqual(post_after_logout.status_code, 401)
