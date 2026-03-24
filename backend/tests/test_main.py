import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from api.models import Message

@pytest.fixture
def api_client():
    return APIClient()

@pytest.mark.django_db
def test_health_endpoint(api_client):
    url = reverse('health')
    response = api_client.get(url)
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

@pytest.mark.django_db
def test_hello_db_creates_message_when_empty(api_client):
    assert Message.objects.count() == 0
    url = reverse('hello_db')
    response = api_client.get(url)
    assert response.status_code == 200
    assert response.json() == {"content": "Hello World!"}
    assert Message.objects.count() == 1
    assert Message.objects.first().content == "Hello World!"

@pytest.mark.django_db
def test_hello_db_returns_existing_message(api_client):
    Message.objects.create(content="Existing Message")
    assert Message.objects.count() == 1
    url = reverse('hello_db')
    response = api_client.get(url)
    assert response.status_code == 200
    assert response.json() == {"content": "Existing Message"}
    assert Message.objects.count() == 1

@pytest.mark.django_db
def test_message_str_method():
    msg = Message.objects.create(content="String Representation")
    assert str(msg) == "String Representation"
