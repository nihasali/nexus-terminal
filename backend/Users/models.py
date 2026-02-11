from django.db import models
from django.contrib.auth.models import AbstractBaseUser,PermissionsMixin
from cloudinary.models import CloudinaryField
import random
from django.utils import timezone
from .managers import UserManager


class School(models.Model):

    tenant_id = models.SlugField(unique=True)

    name = models.CharField(max_length=255)

    email = models.EmailField()

    phone = models.CharField(max_length=20, blank=True, null=True)

    address = models.TextField(blank=True, null=True)

    status = models.CharField(
        max_length=20,
        choices=[
            ("active", "Active"),
            ("inactive", "Inactive"),
            ("suspended", "Suspended"),
            ("trial", "Trial"),
        ],
        default="trial"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class User(AbstractBaseUser,PermissionsMixin):
    fullname = models.CharField(max_length=255)
    username = models.CharField(max_length=20,unique=True,blank=True,null=True)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20,null=True,blank=True)
    DOB = models.DateField(blank=True,null=True)
    gender = models.CharField(
        max_length=10,
        choices=[
            ('male', 'Male'),
            ('female', 'Female'),
            ('other', 'Other'),
        ],
        null=True,
        blank=True
    )
    user_type = models.CharField(
        max_length=20,
        choices=[
            ('school', 'School'),
            ('teacher', 'Teacher'),
            ('student', 'Student'),
            ('parent', 'Parent'),
        ]
    )
    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    status = models.CharField(
        max_length=20,
        choices=[
            ('active', 'Active'),
            ('inactive', 'Inactive'),
            ('suspended', 'Suspended'),
        ],
        default='active'
    )

    profile_picture = CloudinaryField('profile', null=True, blank=True)

    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    is_setup_complete = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['fullname']

    def __str__(self):
        return self.email
        


class OTPVerification(models.Model):
    email = models.EmailField()
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_valid(self):
        return timezone.now() < self.created_at + timezone.timedelta(minutes=5)

    @staticmethod
    def generate_otp():
        return str(random.randint(100000, 999999))