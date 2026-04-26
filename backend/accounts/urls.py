"""
Accounts URLs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    UserRegistrationView,
    CustomTokenObtainPairView,
    UserViewSet,
    UserProfileViewSet,
    AssociationRequestViewSet,
    AssociationViewSet,
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'profiles', UserProfileViewSet, basename='userprofile')
router.register(r'association-requests', AssociationRequestViewSet, basename='associationrequest')
router.register(r'associations', AssociationViewSet, basename='association')

urlpatterns = [
    # Authentication
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # ViewSets
    path('', include(router.urls)),
]
