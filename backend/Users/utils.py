from django.core.mail import send_mail
from .models import PasswordResetToken
from django.conf import settings
import uuid

def send_otp_email(email,otp):
    subject = 'otp verification code'

    message = f"""
    Welcome to School Management System

    Your OTP code is: {otp}

    This OTP is valid for 5 minutes.
    """

    send_mail(
        subject,
        message,
        "no-reply@school.com",
        [email]
    )



def send_password_reset_email(user):
    token = str(uuid.uuid4())

    PasswordResetToken.objects.create(user=user, token=token)

    link    = f"http://localhost:5173/reset-password/{token}"
    subject = "Reset your password — NEXUS TERMINAL"
    message = f"""
Hello {user.fullname},

We received a request to reset your password.

Click the link below to set a new password:

{link}

This link expires in 24 hours.

If you did not request this, you can safely ignore this email.

Thank you,
NEXUS Terminal
    """

    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        [user.email],
        fail_silently=False,
    )