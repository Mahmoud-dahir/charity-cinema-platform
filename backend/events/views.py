from django.db import models
from django.utils.dateparse import parse_datetime
from rest_framework import permissions, viewsets

from .models import Event
from .serializers import EventSerializer


class IsAdminUserType(permissions.BasePermission):
	"""Allow access to platform admins.

	Current user model includes a `user_type` field (see accounts.User).
	We accept either `user_type == 'admin'` or staff flag.
	"""

	def has_permission(self, request, view):
		user = request.user
		if not user or not user.is_authenticated:
			return False
		if getattr(user, "is_staff", False) or getattr(user, "is_superuser", False):
			return True
		return getattr(user, "user_type", None) == "admin"


class EventViewSet(viewsets.ModelViewSet):
	queryset = Event.objects.all()
	serializer_class = EventSerializer

	def get_permissions(self):
		if self.action in ["list", "retrieve"]:
			return [permissions.AllowAny()]
		return [IsAdminUserType()]

	def get_queryset(self):
		qs = Event.objects.all()

		# Read endpoints: only published events for visitors/members.
		if self.action in ["list", "retrieve"]:
			user = self.request.user
			is_admin = bool(
				user
				and user.is_authenticated
				and (
					getattr(user, "is_staff", False)
					or getattr(user, "is_superuser", False)
					or getattr(user, "user_type", None) == "admin"
				)
			)
			if not is_admin:
				qs = qs.filter(status=Event.Status.PUBLISHED)

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
		serializer.save(created_by=self.request.user)

# Create your views here.
