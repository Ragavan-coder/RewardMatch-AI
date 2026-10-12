from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, UserSession


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = "__all__"


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "profile")


class RegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    country = serializers.CharField(max_length=50, default="India")
    currency = serializers.CharField(max_length=10, default="INR")
    timezone = serializers.CharField(max_length=50, default="Asia/Kolkata")
    monthly_spend = serializers.IntegerField(default=50000)
    monthly_savings_goal = serializers.IntegerField(default=5000)
    primary_category = serializers.CharField(default="Shopping")
    primary_bank = serializers.CharField(required=False, allow_blank=True)
    primary_upi_id = serializers.CharField(required=False, allow_blank=True)
    primary_upi_app = serializers.CharField(default="Google Pay")
    cards = serializers.ListField(child=serializers.DictField(), required=False, default=list)
    bank_accounts = serializers.ListField(child=serializers.DictField(), required=False, default=list)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
