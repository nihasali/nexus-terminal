from django.db import models
from Users.models import User

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

