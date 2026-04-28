from rest_framework.routers import DefaultRouter

from .views import EventViewSet, CategoryViewSet

router = DefaultRouter()
router.register(r"events", EventViewSet, basename="event")
router.register(r"categories", CategoryViewSet, basename="category")

urlpatterns = router.urls
