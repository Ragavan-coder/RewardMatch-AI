import uuid
from datetime import timedelta
from typing import List, Dict, Any

from django.utils import timezone
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from apps.financial_profiles.models import CreditCardRecord, BankAccountRecord
from .models import UserProfile, UserSession
from .serializers import RegisterSerializer, LoginSerializer
from .authentication import get_authorized_user_or_raise


def attach_cards_to_user(user: User, cards_data: List[Dict[str, Any]]) -> None:
    """Helper to associate onboarded credit cards with a user."""
    for c in cards_data:
        CreditCardRecord.objects.create(
            user=user,
            name=c.get("name", "Tata Neu Infinity HDFC Bank"),
            bank_name=c.get("bank_name", "HDFC Bank"),
            card_number_masked=f"•••• •••• •••• {c.get('last_4', '4821')}",
            network=c.get("network", "RuPay"),
            credit_limit=c.get("credit_limit", 150000),
            reward_points=c.get("reward_points", 5000),
            rupay_on_upi_linked=c.get("rupay_on_upi", True),
        )


def attach_banks_to_user(user: User, banks_data: List[Dict[str, Any]], fallback_name: str = "") -> None:
    """Helper to associate onboarded bank accounts with a user."""
    for b in banks_data:
        BankAccountRecord.objects.create(
            user=user,
            bank_name=b.get("bank_name", "HDFC Bank"),
            account_type=b.get("account_type", "Salary"),
            account_number_masked=f"•••• •••• {b.get('last_4', '3491')}",
            upi_id=b.get("upi_id", f"{fallback_name.lower().replace(' ', '')}@okhdfcbank" if fallback_name else "user@okhdfcbank"),
            primary_upi_app=b.get("primary_upi_app", "Google Pay"),
            is_primary=b.get("is_primary", True),
            rupay_credit_linked=b.get("rupay_credit_linked", True),
        )


class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"detail": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        email = data["email"].strip().lower()
        name = data["name"].strip()
        password = data["password"]

        if User.objects.filter(email=email).exists():
            return Response({"detail": "User with this email already exists."}, status=status.HTTP_400_BAD_REQUEST)

        username = f"{email.split('@')[0]}_{uuid.uuid4().hex[:6]}"
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=name,
        )

        profile = UserProfile.objects.create(
            user=user,
            phone=data.get("phone"),
            country=data.get("country", "India"),
            currency=data.get("currency", "INR"),
            timezone=data.get("timezone", "Asia/Kolkata"),
            monthly_spend=data.get("monthly_spend", 50000),
            monthly_savings_goal=data.get("monthly_savings_goal", 5000),
            primary_category=data.get("primary_category", "Shopping"),
            primary_bank=data.get("primary_bank"),
            primary_upi_id=data.get("primary_upi_id"),
            primary_upi_app=data.get("primary_upi_app", "Google Pay"),
            profile_completed=True,
        )

        cards_data = data.get("cards", [])
        if cards_data:
            attach_cards_to_user(user, cards_data)

        banks_data = data.get("bank_accounts", [])
        if banks_data:
            attach_banks_to_user(user, banks_data, fallback_name=name)

        token = uuid.uuid4().hex
        UserSession.objects.create(
            user=user,
            session_token=token,
            expires_at=timezone.now() + timedelta(days=7),
        )

        return Response({
            "success": True,
            "message": "User registered and profile stored in MySQL successfully.",
            "token": token,
            "user": {
                "id": user.id,
                "name": name,
                "email": user.email,
                "is_demo": False,
                "phone": profile.phone,
                "primary_bank": profile.primary_bank,
                "primary_upi_id": profile.primary_upi_id,
                "cards_count": len(cards_data),
                "bank_accounts_count": len(banks_data),
            }
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"detail": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data["email"].strip().lower()
        password = serializer.validated_data["password"]

        user = User.objects.filter(email=email).first()
        if not user or not user.check_password(password):
            return Response({"detail": "Invalid email or password."}, status=status.HTTP_401_UNAUTHORIZED)

        token = uuid.uuid4().hex
        UserSession.objects.create(
            user=user,
            session_token=token,
            expires_at=timezone.now() + timedelta(days=7),
        )

        profile = getattr(user, "profile", None)
        cards_count = user.cards.count() if hasattr(user, "cards") else 0
        banks_count = user.bank_accounts.count() if hasattr(user, "bank_accounts") else 0

        return Response({
            "success": True,
            "message": "Authentication successful.",
            "token": token,
            "user": {
                "id": user.id,
                "name": user.first_name or user.username,
                "email": user.email,
                "is_demo": False,
                "phone": profile.phone if profile else None,
                "primary_bank": profile.primary_bank if profile else None,
                "primary_upi_id": profile.primary_upi_id if profile else None,
                "cards_count": cards_count,
                "bank_accounts_count": banks_count,
            }
        })


class LogoutView(APIView):
    def post(self, request):
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        if token:
            UserSession.objects.filter(session_token=token).update(is_active=False)
        return Response({"success": True, "message": "Logged out successfully."})


class MeView(APIView):
    def get(self, request):
        user = get_authorized_user_or_raise(request)
        profile = getattr(user, "profile", None)
        cards_count = user.cards.count() if hasattr(user, "cards") else 0
        banks_count = user.bank_accounts.count() if hasattr(user, "bank_accounts") else 0

        return Response({
            "id": user.id,
            "name": user.first_name or user.username,
            "email": user.email,
            "is_demo": False,
            "phone": profile.phone if profile else None,
            "primary_bank": profile.primary_bank if profile else "HDFC Bank",
            "primary_upi_id": profile.primary_upi_id if profile else "user@okhdfcbank",
            "cards_count": cards_count,
            "bank_accounts_count": banks_count,
        })


class OnboardingView(APIView):
    def post(self, request):
        user_id = request.data.get("user_id", 1)
        user = User.objects.filter(id=user_id).first()
        if not user:
            email = request.data.get("email", "ragavan@example.com")
            user = User.objects.filter(email=email).first()
            if not user:
                user = User.objects.create_user(
                    username=f"user_{uuid.uuid4().hex[:6]}",
                    email=email,
                    password="Password@123",
                    first_name=request.data.get("name", "User"),
                )

        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.phone = request.data.get("phone", profile.phone)
        profile.monthly_spend = request.data.get("monthly_spend", profile.monthly_spend)
        profile.primary_category = request.data.get("primary_category", profile.primary_category)
        profile.primary_bank = request.data.get("primary_bank", profile.primary_bank)
        profile.primary_upi_id = request.data.get("primary_upi_id", profile.primary_upi_id)
        profile.primary_upi_app = request.data.get("primary_upi_app", profile.primary_upi_app)
        profile.profile_completed = True
        profile.save()

        cards_data = request.data.get("cards", [])
        if cards_data:
            attach_cards_to_user(user, cards_data)

        banks_data = request.data.get("bank_accounts", [])
        if banks_data:
            attach_banks_to_user(user, banks_data, fallback_name=user.first_name)

        return Response({
            "id": user.id,
            "name": user.first_name,
            "email": user.email,
            "is_demo": False,
            "phone": profile.phone,
            "primary_bank": profile.primary_bank,
            "primary_upi_id": profile.primary_upi_id,
            "cards_count": user.cards.count() if hasattr(user, "cards") else len(cards_data),
            "bank_accounts_count": user.bank_accounts.count() if hasattr(user, "bank_accounts") else len(banks_data),
        })
