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
    association_name = serializers.CharField(source="association.name", read_only=True)

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
            "association_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_by",
            "association",
            "status",
            "cancel_reason",
            "published_at",
            "created_at",
            "updated_at",
        ]
