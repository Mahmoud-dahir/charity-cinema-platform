from rest_framework import serializers
from events.serializers import EventCategorySerializer, EventImageSerializer


class DashboardEventSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField()
    movie_title = serializers.CharField()
    description = serializers.CharField(allow_blank=True)
    starts_at = serializers.DateTimeField()
    ends_at = serializers.DateTimeField(allow_null=True)
    location = serializers.CharField()
    status = serializers.CharField()
    capacity = serializers.IntegerField(allow_null=True)
    published_at = serializers.DateTimeField(allow_null=True)
    cancel_reason = serializers.CharField(allow_blank=True)
    cover_image = serializers.ImageField(allow_null=True)

    favorites_count = serializers.IntegerField()
    comments_count = serializers.IntegerField()
    signups_count = serializers.IntegerField()

    categories = EventCategorySerializer(many=True, read_only=True)
    images = EventImageSerializer(many=True, read_only=True)
