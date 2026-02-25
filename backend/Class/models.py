from django.db import models
from Users.models import School
from Profile.models import TeacherProfile

class ClassRoom(models.Model):

    school        = models.ForeignKey(
                        School,
                        on_delete=models.CASCADE,
                        related_name='classrooms'
                    )
    name          = models.CharField(max_length=50)
    section       = models.CharField(max_length=10, blank=True, null=True)
    academic_year = models.CharField(max_length=20)
    class_teacher = models.OneToOneField(
                        TeacherProfile,
                        on_delete=models.SET_NULL,
                        null=True, blank=True,
                        related_name='class_teacher_of'
                    )
    created_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('school', 'name', 'section', 'academic_year')
        ordering        = ['name', 'section']

    def __str__(self):
        sec = f" - {self.section}" if self.section else ""
        return f"Class {self.name}{sec} ({self.academic_year})"

    @property
    def student_count(self):
        return self.students.count()