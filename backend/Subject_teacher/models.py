from django.db import models
from Users.models import School
from Profile.models import TeacherProfile
from Class.models import ClassRoom

class Subject(models.Model):

    school = models.ForeignKey(
                School,
                on_delete=models.CASCADE,
                related_name='subjects'
            )
    name   = models.CharField(max_length=100)
    code   = models.CharField(max_length=20, blank=True, null=True) 

    class Meta:
        unique_together = ('school', 'name')
        ordering        = ['name']

    def __str__(self):
        return f"{self.name} ({self.school.name})"




class TeachingAssignment(models.Model):
    """
    One row = one teacher teaches one subject to one class in one year.

    This is the bridge that connects:
      - Timetable  (which period belongs to which teacher+subject+class)
      - Attendance (which teacher marks attendance for which class)
      - Exam marks (which teacher enters marks for which subject+class)
    """
    teacher       = models.ForeignKey(
                        'Profile.TeacherProfile',
                        on_delete=models.CASCADE,
                        related_name='teaching_assignments'
                    )
    classroom     = models.ForeignKey(
                        'Class.ClassRoom',
                        on_delete=models.CASCADE,
                        related_name='subject_teachers'
                    )
    subject       = models.ForeignKey(
                        Subject,
                        on_delete=models.PROTECT,
                        related_name='assignments'
                    )
    academic_year = models.CharField(max_length=20)  
    is_active     = models.BooleanField(default=True)
                    # False = teacher was replaced mid-year but record is kept
    created_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        # A teacher can't teach the same subject to the same class twice in a year
        unique_together = ('teacher', 'classroom', 'subject', 'academic_year')
        ordering        = ['classroom__name', 'classroom__section', 'subject__name']

    def __str__(self):
        return (
            f"{self.teacher.user.fullname} → "
            f"{self.subject.name} → "
            f"{self.classroom} ({self.academic_year})"
        )


