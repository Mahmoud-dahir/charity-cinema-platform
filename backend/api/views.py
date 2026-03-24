from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import Message

@api_view(["GET"])
@permission_classes([AllowAny])
def health(_request):
    return Response({"status": "ok"})

@api_view(["GET"])
@permission_classes([AllowAny])
def hello_db(_request):
    if not Message.objects.exists():
        Message.objects.create(content="Hello World!")
    
    msg = Message.objects.first()
    return Response({"content": msg.content})