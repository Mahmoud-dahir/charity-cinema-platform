from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Message


@api_view(["GET"])
def health(_request):
    return Response({"status": "ok"})


@api_view(["GET"])
def hello_db(_request):
    if not Message.objects.exists():
        Message.objects.create(content="Hello World!")
    
    msg = Message.objects.first()
    return Response({"content": msg.content})
