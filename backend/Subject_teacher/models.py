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


class PeriodTiming(models.Model):

    """
    School-wide fixed period timings.
    Period 1 = 08:00–08:45 for ALL classes.
    School admin sets these once — they apply everywhere.
    """

    school = models.ForeignKey(School,on_delete=models.CASCADE, related_name='period_timings')

    period_number = models.IntegerField()
    label = models.CharField(max_length=30, blank=True, null=True)
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        unique_together = ('school', 'period_number')
        ordering = ['period_number']


    def __str__(self):
        return f"Period {self.period_number} ({self.start_time}–{self.end_time})"



class Period(models.Model):

    """
    One slot in the weekly timetable grid.
    Ties a TeachingAssignment to a day + period_number.
    unique_together ensures one subject per slot per class.
    """

    DAYS = [
        ('Monday',    'Monday'),
        ('Tuesday',   'Tuesday'),
        ('Wednesday', 'Wednesday'),
        ('Thursday',  'Thursday'),
        ('Friday',    'Friday'),
        ('Saturday',  'Saturday'),
    ]

    assignment = models.ForeignKey(TeachingAssignment,on_delete=models.CASCADE,related_name='periods')

    day = models.CharField(max_length=10,choices=DAYS)
    period_number = models.IntegerField()

    class Meta:

        ordering = ['day','period_number']

    def __str__(self):
        return (
            f"{self.assignment.classroom} | {self.day} P{self.period_number} | "
            f"{self.assignment.subject.name}"
        )


