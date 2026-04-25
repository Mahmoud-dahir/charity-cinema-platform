from django.conf import settings
from django.db import models


class Favorite(models.Model):
	user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="favorites")
	event = models.ForeignKey("events.Event", on_delete=models.CASCADE, related_name="favorites")
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		constraints = [
			models.UniqueConstraint(fields=["user", "event"], name="uniq_favorite_user_event"),
		]
		indexes = [
			models.Index(fields=["event", "created_at"]),
			models.Index(fields=["user", "created_at"]),
		]

	def __str__(self) -> str:
		return f"Favorite(user={self.user_id}, event={self.event_id})"


class Comment(models.Model):
	user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="comments")
	event = models.ForeignKey("events.Event", on_delete=models.CASCADE, related_name="comments")
	body = models.TextField()

	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		indexes = [
			models.Index(fields=["event", "created_at"]),
			models.Index(fields=["user", "created_at"]),
		]
		ordering = ["created_at", "id"]

	def __str__(self) -> str:
		return f"Comment(user={self.user_id}, event={self.event_id})"
