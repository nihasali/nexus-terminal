from rest_framework import serializers
from .models import User


class SchoolSignupOTPSerializer(serializers.Serializer):
    fullname = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField()



class LoginSerializer(serializers.Serializer):

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)