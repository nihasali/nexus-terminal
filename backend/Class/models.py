from django.db import models
from Users.models import School,User
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



class StudentAcademicRecord(models.Model):

    student       = models.ForeignKey(
                        'Profile.StudentProfile',
                        on_delete=models.CASCADE,
                        related_name='academic_records'
                    )
    classroom     = models.ForeignKey(
                        'ClassRoom',
                        on_delete=models.PROTECT,   # PROTECT — never lose history
                        related_name='academic_records'
                    )
    academic_year = models.CharField(max_length=20)  # "2025-26"
    roll_number   = models.CharField(max_length=20, blank=True, null=True)
    is_current    = models.BooleanField(default=True)
                    # True  → this is the student's active year
                    # False → this is a past year record
    promoted      = models.BooleanField(default=False)
                    # Set to True when school promotes the student
    remarks       = models.TextField(blank=True, null=True)
    created_at    = models.DateTimeField(auto_now_add=True)
    updated_at    = models.DateTimeField(auto_now=True)

    class Meta:
        # One record per student per year — no duplicates
        unique_together = ('student', 'academic_year')
        ordering        = ['-academic_year']

    def __str__(self):
        return (
            f"{self.student.user.fullname} | "
            f"{self.classroom} | "
            f"{self.academic_year}"
        )

    def close(self, promoted: bool, remarks: str = ""):
        """
        Called when the academic year ends or student is promoted.
        Marks this record as past and records the outcome.
        """
        self.is_current = False
        self.promoted   = promoted
        self.remarks    = remarks
        self.save()


class Attendance(models.Model):
    """
    one row per student per data
    it is tied to studentacademicrecord not to studentprofile
    this can get us attendance that linked to the correct year
    """

    STATUS_CHOICES=[
        ('present','Present'),
        ('absent','Absent'),
        ('late','Late')
    ]

    academic_record = models.ForeignKey(
                          'StudentAcademicRecord',
                          on_delete=models.CASCADE,
                          related_name='attendance_records'
                      )
    date            = models.DateField()
    status          = models.CharField(max_length=10, choices=STATUS_CHOICES)
    marked_by       = models.ForeignKey(
                          User,
                          on_delete=models.SET_NULL,
                          null=True,
                          related_name='marked_attendances'
                      )
    note            = models.TextField(blank=True, null=True) 
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        # One attendance record per student per day
        unique_together = ('academic_record', 'date')
        ordering        = ['-date']

    def __str__(self):
        return (
            f"{self.academic_record.student.user.fullname} | "
            f"{self.date} | {self.status}"
        )



class AttendanceSession(models.Model):

    """
    it tracks the attendance for the date given and notify that attendance is tken or not
    """

    classroom = models.ForeignKey(
        'ClassRoom',
        on_delete=models.CASCADE,
        related_name='attendance_sessions'
    )

    date = models.DateField()
    marked_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='attendance_sessions'
    )

    is_complete = models.BooleanField(default=False)

    created_at= models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('classroom','date')
        ordering = ['-date']

    def __str__(self):
        return f"{self.classroom} | {self.date} | {'Done' if self.is_complete else 'Pending'}"

