from django.urls import include, path

from .views import health, hello_db

urlpatterns = [
    path("health/", health, name="health"),
    path("hello-db/", hello_db, name="hello_db"),
    path("accounts/", include("accounts.urls")),
]
