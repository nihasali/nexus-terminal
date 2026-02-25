from django.db import models
from Users.models import User,School
from cloudinary.models import CloudinaryField

class TeacherProfile(models.Model):
    user = models.OneToOneField(
        User,on_delete=models.CASCADE,
        related_name='teacher_profile'
    )
    employee_id = models.CharField(max_length=50)
    joining_date = models.DateField()
    department_id = models.CharField(max_length=50,blank=True,null=True)
    salary = models.DecimalField(max_digits=10,decimal_places=2,default=0)
    qualification=models.CharField(max_length=255,blank=True,null=True)
    years_of_experience=models.IntegerField(blank=True,null=True)
    created_at=models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.user.fullname}-{self.employee_id}'

class PasswordSetupToken(models.Model):

    user=models.ForeignKey(User,on_delete=models.CASCADE,related_name='setup_tokens')
    token=models.CharField(max_length=100,unique=True)
    created_at=models.DateTimeField(auto_now_add=True)
    is_used=models.BooleanField(default=False)

    def __str__(self):
        return self.user.email



class StudentProfile(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="student_profile"
    )

    admission_number = models.CharField(
        max_length=50,
        unique=True
    )

    classroom  = models.ForeignKey(
        'Class.ClassRoom',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='students'
    )

    roll_number = models.CharField(max_length=50)

    date_of_joining = models.DateField()

    blood_group = models.CharField(
        max_length=15,
        blank=True,
        null=True
    )

    guardian_name = models.CharField(max_length=255)

    guardian_phone = models.CharField(max_length=20)

    address = models.CharField(max_length=255,blank=True, null=True)

    student_contact = models.CharField(
        max_length=20,
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.fullname} - {self.admission_number}"


class StudentDocument(models.Model):
    student = models.ForeignKey(StudentProfile,on_delete=models.CASCADE,related_name='document')

    document_type=models.CharField(max_length=100,blank=True,null=True)

    file = CloudinaryField('student_document')

    updated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.student.user.fullname}-{self.document_type}'


class ParentProfile(models.Model):
    user       = models.OneToOneField(User, on_delete=models.CASCADE, related_name='parent_profile')
    students   = models.ManyToManyField(StudentProfile, related_name='parents', blank=True)
    occupation = models.CharField(max_length=100, blank=True, null=True)
    relation   = models.CharField(
        max_length=50,
        choices=[("father","Father"), ("mother","Mother"), ("guardian","Guardian")],
        blank=True, null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.user.fullname
