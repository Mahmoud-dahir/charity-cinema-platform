from django.urls import path

from .views import health, hello_db

urlpatterns = [
    path("health/", health, name="health"),
    path("hello-db/", hello_db, name="hello_db"),
]
