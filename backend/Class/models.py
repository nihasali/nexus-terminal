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



class StudentAcademicRecord(models.Model):

    student       = models.ForeignKey(
                        'StudentProfile',
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