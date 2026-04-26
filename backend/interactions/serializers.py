from rest_framework import serializers

from .models import Comment


class CommentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    first_name = serializers.CharField(source="user.first_name", read_only=True)

    class Meta:
        model = Comment
        fields = [
            "id",
            "event",
            "user",
            "username",
            "first_name",
            "body",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "event",
            "user",
            "username",
            "first_name",
            "created_at",
            "updated_at",
        ]
