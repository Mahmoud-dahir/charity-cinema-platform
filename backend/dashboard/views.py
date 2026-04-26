from django.db.models import Count, Q
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from events.models import Event, Signup
from interactions.models import Comment, Favorite

from .serializers import DashboardEventSerializer


class IsAssociationMember(permissions.BasePermission):
    """Dashboard is only available for users attached to an association."""

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and getattr(user, "association_id", None))


class DashboardOverviewView(APIView):
    permission_classes = [IsAssociationMember]

    def get(self, request):
        association_id = request.user.association_id

        events_qs = Event.objects.filter(association_id=association_id)

        event_counts = events_qs.aggregate(
            total=Count("id"),
            draft=Count("id", filter=Q(status=Event.Status.DRAFT)),
            published=Count("id", filter=Q(status=Event.Status.PUBLISHED)),
            cancelled=Count("id", filter=Q(status=Event.Status.CANCELLED)),
        )

        totals = {
            "favorites": Favorite.objects.filter(event__association_id=association_id).count(),
            "comments": Comment.objects.filter(event__association_id=association_id).count(),
            "signups": Signup.objects.filter(event__association_id=association_id).count(),
        }

        return Response(
            {
                "events": event_counts,
                "totals": totals,
            }
        )


class DashboardEventsView(APIView):
    permission_classes = [IsAssociationMember]

    def get(self, request):
        association_id = request.user.association_id

        qs = (
            Event.objects.filter(association_id=association_id)
            .annotate(
                favorites_count=Count("favorites", distinct=True),
                comments_count=Count("comments", distinct=True),
                signups_count=Count("signups", distinct=True),
            )
            .order_by("-created_at", "-id")
        )

        return Response(DashboardEventSerializer(qs, many=True).data)
