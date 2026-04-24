from django.db import models
from django.utils.dateparse import parse_datetime
from rest_framework import permissions, viewsets
from rest_framework.exceptions import PermissionDenied

from .models import Event
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
		return [IsAssociationEditor()]

	def get_queryset(self):
		qs = Event.objects.all()

		if self.action in ["list", "retrieve"]:
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

		return qs.distinct()

	def perform_create(self, serializer):
		user = self.request.user
		if not getattr(user, "association_id", None):
			raise PermissionDenied("User must be attached to an association to create events")

		serializer.save(created_by=user, association=user.association)

# Create your views here.
