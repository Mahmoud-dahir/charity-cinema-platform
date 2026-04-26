from django.urls import path

from .views import DashboardEventsView, DashboardOverviewView


urlpatterns = [
    path("overview/", DashboardOverviewView.as_view(), name="dashboard-overview"),
    path("events/", DashboardEventsView.as_view(), name="dashboard-events"),
]
