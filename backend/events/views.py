from django.db import models
from django.db import transaction
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from interactions.models import Comment, Favorite
from interactions.serializers import CommentSerializer

from .models import Event, Signup
from .serializers import EventSerializer


class IsAssociationEditor(permissions.BasePermission):
	"""Allow writes only for users attached to an association.

	Per the domain doc, an "admin/editor" is a user linked to an Association.
	"""

	def has_permission(self, request, view):
		user = request.user
		if not user or not user.is_authenticated:
			return False
		if getattr(user, "is_staff", False) or getattr(user, "is_superuser", False):
			return True
		return bool(getattr(user, "association_id", None))

	def has_object_permission(self, request, view, obj: Event):
		user = request.user
		if getattr(user, "is_staff", False) or getattr(user, "is_superuser", False):
			return True
		return bool(user.is_authenticated and user.association_id and obj.association_id == user.association_id)


class EventViewSet(viewsets.ModelViewSet):
	queryset = Event.objects.all()
	serializer_class = EventSerializer

	def get_permissions(self):
		if self.action in ["list", "retrieve"]:
			return [permissions.AllowAny()]
		if self.action in ["signup"]:
			return [permissions.IsAuthenticated()]
		if self.action in ["favorite"]:
			return [permissions.IsAuthenticated()]
		if self.action in ["comments"]:
			if self.request.method == "GET":
				return [permissions.AllowAny()]
			return [permissions.IsAuthenticated()]
		return [IsAssociationEditor()]

	def get_queryset(self):
		user = self.request.user
		qs = Event.objects.annotate(
			favorites_count=models.Count("favorites", distinct=True),
			comments_count=models.Count("comments", distinct=True),
			signups_count=models.Count("signups", distinct=True),
		)

		if user and user.is_authenticated:
			qs = qs.annotate(
				is_favorited=models.Exists(Favorite.objects.filter(user=user, event=models.OuterRef("pk"))),
				is_signed_up=models.Exists(Signup.objects.filter(user=user, event=models.OuterRef("pk"))),
			)
		else:
			qs = qs.annotate(
				is_favorited=models.Value(False, output_field=models.BooleanField()),
				is_signed_up=models.Value(False, output_field=models.BooleanField()),
			)

		if self.action in ["list", "retrieve", "signup", "favorite", "comments"]:
			user = self.request.user
			if not user or not user.is_authenticated:
				qs = qs.filter(status__in=[Event.Status.PUBLISHED, Event.Status.CANCELLED])
			else:
				# Member: published/cancelled only.
				if not getattr(user, "association_id", None) and not (getattr(user, "is_staff", False) or getattr(user, "is_superuser", False)):
					qs = qs.filter(status__in=[Event.Status.PUBLISHED, Event.Status.CANCELLED])
				else:
					# Association editor: also see drafts for own association (or own drafts).
					qs = qs.filter(
						models.Q(status__in=[Event.Status.PUBLISHED, Event.Status.CANCELLED])
						| models.Q(status=Event.Status.DRAFT, association_id=user.association_id)
						| models.Q(status=Event.Status.DRAFT, created_by=user)
					)

		# Filters for visitor use-cases.
		status_param = self.request.query_params.get("status")
		if status_param:
			qs = qs.filter(status=status_param)

		category = self.request.query_params.get("category")
		if category:
			qs = qs.filter(categories__slug=category)

		location = self.request.query_params.get("location")
		if location:
			qs = qs.filter(location__icontains=location)

		q = self.request.query_params.get("q")
		if q:
			qs = qs.filter(
				models.Q(title__icontains=q)
				| models.Q(movie_title__icontains=q)
				| models.Q(description__icontains=q)
				| models.Q(location__icontains=q)
			)

		date_from = self.request.query_params.get("date_from")
		if date_from:
			dt = parse_datetime(date_from)
			if dt:
				qs = qs.filter(starts_at__gte=dt)

		date_to = self.request.query_params.get("date_to")
		if date_to:
			dt = parse_datetime(date_to)
			if dt:
				qs = qs.filter(starts_at__lte=dt)

		favorited = self.request.query_params.get("favorited")
		if favorited == "true" and self.request.user and self.request.user.is_authenticated:
			qs = qs.filter(favorites__user=self.request.user)

		signedup = self.request.query_params.get("signedup")
		if signedup == "true" and self.request.user and self.request.user.is_authenticated:
			qs = qs.filter(signups__user=self.request.user)

		return qs.distinct()

	def perform_create(self, serializer):
		user = self.request.user
		if not getattr(user, "association_id", None):
			raise PermissionDenied("User must be attached to an association to create events")

		serializer.save(created_by=user, association=user.association)

	@action(detail=True, methods=["post", "delete"], url_path="signup")
	def signup(self, request, pk=None):
		user = request.user
		event: Event = self.get_object()

		if request.method == "DELETE":
			Signup.objects.filter(user=user, event=event).delete()
			return Response(status=status.HTTP_204_NO_CONTENT)

		if event.status != Event.Status.PUBLISHED:
			return Response({"detail": "Event must be published to sign up"}, status=status.HTTP_400_BAD_REQUEST)

		# Enforce capacity if defined, safely under concurrent signups.
		with transaction.atomic():
			event_locked = Event.objects.select_for_update().get(pk=event.pk)
			if Signup.objects.filter(user=user, event=event_locked).exists():
				return Response({"detail": "Already signed up"}, status=status.HTTP_400_BAD_REQUEST)
			if event_locked.capacity is not None:
				current = Signup.objects.filter(event=event_locked).count()
				if current >= event_locked.capacity:
					return Response({"detail": "Event is full"}, status=status.HTTP_400_BAD_REQUEST)

			signup = Signup.objects.create(user=user, event=event_locked)

		return Response({"id": signup.id, "event": event.id, "user": user.id}, status=status.HTTP_201_CREATED)

	@action(detail=True, methods=["post", "delete"], url_path="favorite")
	def favorite(self, request, pk=None):
		user = request.user
		event: Event = self.get_object()

		if request.method == "DELETE":
			Favorite.objects.filter(user=user, event=event).delete()
			return Response(status=status.HTTP_204_NO_CONTENT)

		if event.status != Event.Status.PUBLISHED:
			return Response({"detail": "Event must be published to be favorited"}, status=status.HTTP_400_BAD_REQUEST)

		favorite, created = Favorite.objects.get_or_create(user=user, event=event)
		if not created:
			return Response({"detail": "Already favorited"}, status=status.HTTP_400_BAD_REQUEST)

		return Response({"id": favorite.id, "event": event.id, "user": user.id}, status=status.HTTP_201_CREATED)

	@action(detail=True, methods=["get", "post"], url_path="comments")
	def comments(self, request, pk=None):
		event: Event = self.get_object()

		if request.method == "GET":
			qs = Comment.objects.filter(event=event).select_related("user").order_by("created_at", "id")
			return Response(CommentSerializer(qs, many=True).data, status=status.HTTP_200_OK)

		# POST
		if event.status != Event.Status.PUBLISHED:
			return Response({"detail": "Event must be published to comment"}, status=status.HTTP_400_BAD_REQUEST)

		serializer = CommentSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		comment = Comment.objects.create(
			user=request.user,
			event=event,
			body=serializer.validated_data["body"],
		)
		return Response(CommentSerializer(comment).data, status=status.HTTP_201_CREATED)

	@action(detail=True, methods=["get"], url_path="participants")
	def participants(self, request, pk=None):
		event: Event = self.get_object()
		# Uses IsAssociationEditor permission class (incl. object-level association check)
		# and is only accessible for users attached to an association.
		participants = (
			Signup.objects.filter(event=event)
			.select_related("user")
			.order_by("created_at")
		)

		data = [
			{
				"id": s.user.id,
				"username": s.user.username,
				"first_name": s.user.first_name,
				"last_name": s.user.last_name,
			}
			for s in participants
		]
		return Response(data, status=status.HTTP_200_OK)

	@action(detail=True, methods=["post"])
	def publish(self, request, pk=None):
		event: Event = self.get_object()

		if event.status == Event.Status.PUBLISHED:
			return Response({"detail": "Event is already published"}, status=status.HTTP_400_BAD_REQUEST)
		if event.status == Event.Status.CANCELLED:
			return Response({"detail": "Cancelled event cannot be published"}, status=status.HTTP_400_BAD_REQUEST)
		if event.status != Event.Status.DRAFT:
			return Response({"detail": "Only draft events can be published"}, status=status.HTTP_400_BAD_REQUEST)

		event.status = Event.Status.PUBLISHED
		event.published_at = timezone.now()
		event.cancel_reason = ""
		event.save(update_fields=["status", "published_at", "cancel_reason", "updated_at"])

		return Response(self.get_serializer(event).data, status=status.HTTP_200_OK)

	@action(detail=True, methods=["post"])
	def cancel(self, request, pk=None):
		event: Event = self.get_object()

		if event.status == Event.Status.CANCELLED:
			return Response({"detail": "Event is already cancelled"}, status=status.HTTP_400_BAD_REQUEST)

		cancel_reason = (request.data or {}).get("cancel_reason")
		if not cancel_reason or not str(cancel_reason).strip():
			return Response({"cancel_reason": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)

		event.status = Event.Status.CANCELLED
		event.cancel_reason = str(cancel_reason).strip()
		event.save(update_fields=["status", "cancel_reason", "updated_at"])

		return Response(self.get_serializer(event).data, status=status.HTTP_200_OK)

# Create your views here.
