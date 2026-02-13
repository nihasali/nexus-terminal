from rest_framework import serializers
from Users.models import User
from .models import TeacherProfile
from django.core.validators import MinValueValidator


class BaseTeacherSerializer(serializers.Serializer):

    fullname=serializers.CharField(max_length=255,min_length=3)
    email=serializers.EmailField()
    phone = serializers.CharField(required=False,allow_blank=True)
    employee_id=serializers.CharField(max_length=50)
    joining_date = serializers.DateField()
    salary=serializers.DecimalField(max_digits=10,decimal_places=2,validators=[MinValueValidator(0)])
    qualification=serializers.CharField(max_length=255,required=False,allow_blank=True)
    years_of_experience=serializers.IntegerField(min_value=0,max_value=50,required=False,allow_null=True)

class CreateTeacherSerializer(BaseTeacherSerializer):

    def validate_email(self,value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                'A user with this email alredy exists'
            )
        
        return value

    def validate(self,data):
        if data['years_of_experience'] > 50:
            raise serializers.ValidationError(
                'Experiance cannot be over 50 years'
            )
        
        if data['years_of_experience'] < 0:
            raise serializers.ValidationError(
                'Experiance cannot be less than 0'
            )

        if data['salary'] < 0:
            raise serializers.ValidationError(
                'Salary cannot be less than $0'
            )

        return data


class SetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField()

    password = serializers.CharField(min_length=8)

    def validate_password(self,value):
        if len(value) < 8:
            raise serializers.ValidationError(
                'Password must be 8 character'
            )
        
        return value


class TeacherListSerializer(serializers.ModelSerializer):

    fullname = serializers.CharField(source="user.fullname")
    email = serializers.CharField(source="user.email")
    phone = serializers.CharField(source="user.phone")
    profile_picture = serializers.ImageField(source='user.profile_picture')
    is_setup_complete = serializers.BooleanField(source="user.is_setup_complete")

    class Meta:
        model = TeacherProfile

        fields = [
            "id",
            "fullname",
            "email",
            "phone",
            "employee_id",
            "joining_date",
            'salary',
            "qualification",
            "years_of_experience",
            'profile_picture',
            'is_setup_complete',
        ]

class TeacherDetailSerializer(serializers.ModelSerializer):
    fullname = serializers.CharField(source='user.fullname')
    email = serializers.CharField(source='user.email')
    phone = serializers.CharField(source='user.phone')
    profile_picture = serializers.ImageField(source='user.profile_picture')
    is_setup_complete = serializers.BooleanField(source='user.is_setup_complete')

    class Meta:
        model=TeacherProfile

        fields = [
            'id',
            'fullname',
            'email',
            'phone',
            'employee_id',
            'joining_date',
            'salary',
            'qualification',
            'years_of_experience',
            'profile_picture',
            'is_setup_complete',
        ]


class UpdateTeacherSerializer(serializers.Serializer):
    fullname = serializers.CharField(
        max_length=255,
        min_length=3,
        required=False
    )

    phone = serializers.CharField(
        required=False,
        allow_blank=True
    )

    employee_id = serializers.CharField(
        max_length=50,
        required=False
    )

    joining_date = serializers.DateField(
        required=False,
        allow_null=True
    )

    salary = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False
    )

    qualification = serializers.CharField(
        required=False,
        allow_blank=True
    )

    years_of_experience = serializers.IntegerField(
        min_value=0,
        max_value=50,
        required=False,
        allow_null=True
    )

    def validate_salary(self, value):
        if value < 0:
            raise serializers.ValidationError("Salary must be greater than zero")
        return value

class TeacherProfileCompletionSerializer(serializers.Serializer):
    phone = serializers.CharField(required=True)
    gender = serializers.ChoiceField(
        choices=[
            ('male','Male'),
            ('female','Female'),
            ('other','Other')
        ],
        required=True
    )

    DOB=serializers.DateField(required=True)

    qualification = serializers.CharField(required=True)
    years_of_experience = serializers.IntegerField(
        required=True,
        min_value=0,
        max_value=50
    )

    profile_picture = serializers.ImageField(required=False)



class TeacherProfileEditSerializer(serializers.Serializer):

    # User fields
    phone = serializers.CharField(required=False)
    gender = serializers.ChoiceField(
        choices=[
            ("male", "Male"),
            ("female", "Female"),
            ("other", "Other"),
        ],
        required=False
    )
    DOB = serializers.DateField(required=False)
    profile_picture = serializers.ImageField(required=False)

    # TeacherProfile fields
    qualification = serializers.CharField(required=False)
    years_of_experience = serializers.IntegerField(
        required=False,
        min_value=0,
        max_value=60
    )