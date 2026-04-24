from rest_framework import serializers

from .models import Event, EventCategory


class EventCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = EventCategory
        fields = ["id", "name", "slug", "parent"]
        read_only_fields = ["id"]


class EventSerializer(serializers.ModelSerializer):
    categories = serializers.SlugRelatedField(
        many=True,
        slug_field="slug",
        queryset=EventCategory.objects.all(),
        required=False,
    )

    class Meta:
        model = Event
        fields = [
            "id",
            "title",
            "movie_title",
            "description",
            "starts_at",
            "ends_at",
            "location",
            "status",
            "capacity",
            "cancel_reason",
            "published_at",
            "cover_image",
            "categories",
            "created_by",
            "association",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_by",
            "association",
            "published_at",
            "created_at",
            "updated_at",
        ]
