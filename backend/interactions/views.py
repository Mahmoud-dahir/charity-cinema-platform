from rest_framework import mixins, permissions, viewsets

from .models import Comment
from .serializers import CommentSerializer


class IsCommentAuthor(permissions.BasePermission):
	def has_object_permission(self, request, view, obj: Comment):
		return bool(request.user and request.user.is_authenticated and obj.user_id == request.user.id)


class CommentViewSet(mixins.UpdateModelMixin, mixins.DestroyModelMixin, viewsets.GenericViewSet):
	queryset = Comment.objects.select_related("user", "event")
	serializer_class = CommentSerializer
	http_method_names = ["patch", "delete", "options", "head"]

	def get_permissions(self):
		return [permissions.IsAuthenticated(), IsCommentAuthor()]
