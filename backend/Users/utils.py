from django.core.mail import send_mail

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