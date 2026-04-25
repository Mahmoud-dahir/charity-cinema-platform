"""
Accounts Views
"""
from django.utils import timezone
from rest_framework import viewsets, generics, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from .models import Association, AssociationRequest, UserProfile
from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    UserUpdateSerializer,
    ChangePasswordSerializer,
    UserProfileSerializer,
    AssociationRequestCreateSerializer,
    AssociationRequestSerializer,
)

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT Token Serializer with user data"""
    
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom JWT Token View"""
    serializer_class = CustomTokenObtainPairSerializer


class UserRegistrationView(generics.CreateAPIView):
    """User Registration View"""
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)


class UserViewSet(viewsets.ModelViewSet):
    """User ViewSet"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)
    
    def get_serializer_class(self):
        if self.action in ['update', 'partial_update', 'update_profile']:
            return UserUpdateSerializer
        return UserSerializer
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user profile"""
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['put', 'patch'])
    def update_profile(self, request):
        """Update current user profile"""
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data)
    
    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """Change user password"""
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        if not request.user.check_password(serializer.validated_data['old_password']):
            return Response(
                {'error': 'Wrong old password'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        
        return Response({'message': 'Password changed successfully'})
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def check_username(self, request):
        """Check if username is available"""
        username = request.data.get('username', '').lower()
        
        if not username:
            return Response(
                {'error': 'Username is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        exists = User.objects.filter(username=username).exists()
        
        return Response({
            'available': not exists,
            'username': username
        })
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def check_email(self, request):
        """Check if email already exists"""
        email = request.data.get('email')
        
        if not email:
            return Response(
                {'error': 'Email is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        exists = User.objects.filter(email=email).exists()
        
        return Response({
            'exists': exists,
            'email': email
        })


class UserProfileViewSet(viewsets.ModelViewSet):
    """User Profile ViewSet"""
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return UserProfile.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user profile settings"""
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(profile)
        return Response(serializer.data)
    
    @action(detail=False, methods=['put', 'patch'])
    def update_preferences(self, request):
        """Update user preferences"""
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class IsStaffUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)


class AssociationRequestViewSet(viewsets.ModelViewSet):
    queryset = AssociationRequest.objects.select_related("requested_by")
    serializer_class = AssociationRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post", "patch", "delete", "options", "head"]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return AssociationRequest.objects.all().select_related("requested_by")
        return AssociationRequest.objects.filter(requested_by=user).select_related("requested_by")

    def get_serializer_class(self):
        if self.action == "create":
            return AssociationRequestCreateSerializer
        return AssociationRequestSerializer

    def perform_create(self, serializer):
        serializer.save(requested_by=self.request.user)

    def create(self, request, *args, **kwargs):
        user = request.user
        if getattr(user, "association_id", None):
            return Response({"detail": "User is already attached to an association"}, status=status.HTTP_400_BAD_REQUEST)

        pending = AssociationRequest.objects.filter(requested_by=user, status=AssociationRequest.Status.PENDING).first()
        if pending:
            return Response(AssociationRequestSerializer(pending).data, status=status.HTTP_200_OK)

        return super().create(request, *args, **kwargs)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated, IsStaffUser])
    def approve(self, request, pk=None):
        association_request: AssociationRequest = self.get_object()
        if association_request.status != AssociationRequest.Status.PENDING:
            return Response({"detail": "Only pending requests can be approved"}, status=status.HTTP_400_BAD_REQUEST)

        association = Association.objects.create(
            name=association_request.name,
            description=association_request.description,
            website_url=association_request.website_url,
        )

        user = association_request.requested_by
        user.association = association
        if getattr(user, "user_type", None) != "admin":
            user.user_type = "admin"
        user.save(update_fields=["association", "user_type"])

        association_request.status = AssociationRequest.Status.APPROVED
        association_request.reviewed_at = timezone.now()
        association_request.review_note = (request.data or {}).get("review_note", "")
        association_request.save(update_fields=["status", "reviewed_at", "review_note", "updated_at"])

        return Response(AssociationRequestSerializer(association_request).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated, IsStaffUser])
    def reject(self, request, pk=None):
        association_request: AssociationRequest = self.get_object()
        if association_request.status != AssociationRequest.Status.PENDING:
            return Response({"detail": "Only pending requests can be rejected"}, status=status.HTTP_400_BAD_REQUEST)

        association_request.status = AssociationRequest.Status.REJECTED
        association_request.reviewed_at = timezone.now()
        association_request.review_note = (request.data or {}).get("review_note", "")
        association_request.save(update_fields=["status", "reviewed_at", "review_note", "updated_at"])

        return Response(AssociationRequestSerializer(association_request).data, status=status.HTTP_200_OK)
