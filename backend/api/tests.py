from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from api.models import Message

class APITests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_health_endpoint(self):
        url = reverse('health')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})

    def test_hello_db_creates_message_when_empty(self):
        self.assertEqual(Message.objects.count(), 0)
        
        url = reverse('hello_db')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"content": "Hello World!"})
        self.assertEqual(Message.objects.count(), 1)
        self.assertEqual(Message.objects.first().content, "Hello World!")

    def test_hello_db_returns_existing_message(self):
        msg = Message.objects.create(content="Existing Message")
        self.assertEqual(Message.objects.count(), 1)
        
        url = reverse('hello_db')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"content": "Existing Message"})
        self.assertEqual(Message.objects.count(), 1)

    def test_message_str_method(self):
        msg = Message.objects.create(content="String Representation")
        self.assertEqual(str(msg), "String Representation")
