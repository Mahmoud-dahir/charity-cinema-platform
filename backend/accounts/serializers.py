"""
Accounts Serializers
"""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    """User Profile Serializer"""
    
    class Meta:
        model = UserProfile
        fields = [
            'newsletter_subscribed', 'email_notifications',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class UserSerializer(serializers.ModelSerializer):
    """User Serializer"""
    
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 
            'user_type', 'avatar', 'is_verified', 'date_joined',
            'profile'
        ]
        read_only_fields = ['id', 'date_joined', 'is_verified']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """User Registration Serializer"""
    
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ['email', 'username', 'password', 'password2', 'first_name', 'last_name']
    
    def validate_username(self, value):
        """Validate username format (alphanumeric, dash, underscore only)"""
        import re
        if not re.match(r'^[a-zA-Z0-9_-]+$', value):
            raise serializers.ValidationError(
                "Username can only contain letters, numbers, dashes and underscores."
            )
        if len(value) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters long.")
        return value.lower()  # Force lowercase for consistency
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        # Auto-verify user for now (email verification can be added later)
        user.is_verified = True
        user.save()
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """User Update Serializer"""
    
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'avatar']


class ChangePasswordSerializer(serializers.Serializer):
    """Change Password Serializer"""
    
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password2 = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})
        return attrs
