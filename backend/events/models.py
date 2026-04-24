from django.conf import settings
from django.db import models
from django.utils.text import slugify

from accounts.models import Association


class EventCategory(models.Model):
	name = models.CharField(max_length=120)
	slug = models.SlugField(max_length=140, unique=True)
	parent = models.ForeignKey(
		"self",
		on_delete=models.SET_NULL,
		null=True,
		blank=True,
		related_name="children",
	)

	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ["name"]

	def save(self, *args, **kwargs):
		if not self.slug:
			self.slug = slugify(self.name)
		super().save(*args, **kwargs)

	def __str__(self) -> str:
		return self.name


class Event(models.Model):
	class Status(models.TextChoices):
		DRAFT = "draft", "Draft"
		PUBLISHED = "published", "Published"
		CANCELLED = "cancelled", "Cancelled"

	title = models.CharField(max_length=255)
	movie_title = models.CharField(max_length=255)
	description = models.TextField(blank=True)
	starts_at = models.DateTimeField()
	ends_at = models.DateTimeField(blank=True, null=True)
	location = models.CharField(max_length=255)
	status = models.CharField(max_length=16, choices=Status.choices, default=Status.DRAFT)
	capacity = models.PositiveIntegerField(blank=True, null=True)

	cancel_reason = models.CharField(max_length=255, blank=True)
	published_at = models.DateTimeField(blank=True, null=True)

	cover_image = models.ImageField(upload_to="events/", blank=True, null=True)

	categories = models.ManyToManyField(
		EventCategory,
		through="EventCategoryLink",
		related_name="events",
		blank=True,
	)

	created_by = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.PROTECT,
		related_name="created_events",
	)

	association = models.ForeignKey(
		Association,
		on_delete=models.PROTECT,
		related_name="events",
	)

	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		indexes = [
			models.Index(fields=["status", "starts_at"]),
			models.Index(fields=["starts_at"]),
			models.Index(fields=["movie_title"]),
		]
		ordering = ["starts_at"]

	def __str__(self) -> str:
		return f"{self.title} ({self.starts_at})"


class EventCategoryLink(models.Model):
	event = models.ForeignKey(Event, on_delete=models.CASCADE)
	category = models.ForeignKey(EventCategory, on_delete=models.CASCADE)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		constraints = [
			models.UniqueConstraint(fields=["event", "category"], name="uniq_event_category"),
		]

	def __str__(self) -> str:
		return f"{self.event_id} -> {self.category_id}"


class EventImage(models.Model):
	event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="images")
	image = models.ImageField(upload_to="events/")
	alt_text = models.CharField(max_length=255, blank=True)
	position = models.PositiveIntegerField(default=0)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ["position", "id"]
		constraints = [
			models.UniqueConstraint(fields=["event", "position"], name="uniq_event_image_position"),
		]

	def __str__(self) -> str:
		return f"Image {self.id} for event {self.event_id}"


class Signup(models.Model):
	user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="signups")
	event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="signups")
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		constraints = [
			models.UniqueConstraint(fields=["user", "event"], name="uniq_signup_user_event"),
		]
		indexes = [
			models.Index(fields=["event", "created_at"]),
			models.Index(fields=["user", "created_at"]),
		]

	def __str__(self) -> str:
		return f"Signup(user={self.user_id}, event={self.event_id})"

# Create your models here.
