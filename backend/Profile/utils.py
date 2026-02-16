from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.conf import settings
import uuid
from .models import PasswordSetupToken,StudentProfile
from datetime import datetime


def generate_setup_token(user):

    token=str(uuid.uuid4())

    PasswordSetupToken.objects.create(
        user=user,
        token=token
    )

    return token

def send_set_password_email(user):
    token = generate_setup_token(user)

    link = f"http://localhost:5173/set-password/{token}"

    subject = 'Set your password - NEXUS TERMINAL'

    message = f"""
    Hello {user.fullname},

    Your {user.user_type} account has been created.

    Please click the link below to set your password:

    {link}

    Thank you.
    """

    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        [user.email],
        fail_silently=False
    )




def generate_admission_number(school):
    current_year = datetime.now().year

    student_count = StudentProfile.objects.filter(
        user__school=school,
        created_at__year=current_year
    ).count() + 1

    return f'{school.tenant_id}-{current_year}-{str(student_count).zfill(4)}'