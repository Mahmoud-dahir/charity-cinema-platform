from rest_framework import serializers

from .models import Event, EventCategory, EventImage


class EventCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = EventCategory
        fields = ["id", "name", "slug", "parent"]
        read_only_fields = ["id"]


class EventImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventImage
        fields = ["id", "image", "alt_text", "position"]
        read_only_fields = ["id"]


class EventSerializer(serializers.ModelSerializer):
    categories = serializers.SlugRelatedField(
        many=True,
        slug_field="slug",
        queryset=EventCategory.objects.all(),
        required=False,
    )

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep["categories"] = EventCategorySerializer(instance.categories.all(), many=True, context=self.context).data
        rep["images"] = EventImageSerializer(instance.images.all(), many=True, context=self.context).data
        return rep
    association_name = serializers.CharField(source="association.name", read_only=True)
    favorites_count = serializers.IntegerField(read_only=True, default=0)
    comments_count = serializers.IntegerField(read_only=True, default=0)
    signups_count = serializers.IntegerField(read_only=True, default=0)
    is_favorited = serializers.BooleanField(read_only=True, default=False)
    is_signed_up = serializers.BooleanField(read_only=True, default=False)

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
            "favorites_count",
            "comments_count",
            "signups_count",
            "is_favorited",
            "is_signed_up",
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