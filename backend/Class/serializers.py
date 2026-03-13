from rest_framework import serializers
from Users.models import User
from Profile.models import TeacherProfile,StudentProfile,StudentDocument,ParentProfile
from .models import ClassRoom,StudentAcademicRecord,Attendance,AttendanceSession
from django.db.models import Count, Q


class ClassTeacherSerializer(serializers.ModelSerializer):
    
    fullname        = serializers.CharField(source='user.fullname')
    email           = serializers.CharField(source='user.email')
    phone           = serializers.CharField(source='user.phone')
    profile_picture = serializers.SerializerMethodField()

    class Meta:
        model  = TeacherProfile
        fields = ['id', 'fullname', 'email', 'phone', 'profile_picture']

    def get_profile_picture(self, obj):
        return obj.user.profile_picture.url if obj.user.profile_picture else None



class ClassStudentSerializer(serializers.ModelSerializer):
    """Lightweight student info for the roster inside a class detail view."""
    fullname        = serializers.CharField(source='user.fullname')
    email           = serializers.CharField(source='user.email')
    profile_picture = serializers.SerializerMethodField()

    class Meta:
        model  = StudentProfile
        fields = ['id', 'fullname', 'email', 'admission_number',
                  'roll_number', 'profile_picture']

    def get_profile_picture(self, obj):
        return obj.user.profile_picture.url if obj.user.profile_picture else None


class ClassRoomListSerializer(serializers.ModelSerializer):
    """Used in list view — no full roster, just counts."""
    class_teacher = ClassTeacherSerializer(read_only=True)
    total_students = serializers.IntegerField(read_only=True)

    class Meta:
        model  = ClassRoom
        fields = ['id', 'name', 'section', 'academic_year',
                  'class_teacher', 'total_students', 'created_at']



class ClassRoomDetailSerializer(serializers.ModelSerializer):
    """Used in detail view — full student roster included."""
    class_teacher = ClassTeacherSerializer(read_only=True)
    students      = ClassStudentSerializer(many=True, read_only=True)
    total_students = serializers.IntegerField(read_only=True)

    class Meta:
        model  = ClassRoom
        fields = ['id', 'name', 'section', 'academic_year',
                  'class_teacher', 'students', 'total_students', 'created_at']


class CreateClassRoomSerializer(serializers.ModelSerializer):

    class_teacher_id = serializers.IntegerField(required=False,allow_null=True)

    class Meta:
        model = ClassRoom
        fields = ['name','section','academic_year','class_teacher_id']

    def validate(self,data):

        school = self.context['request'].user.school
        name = data.get('name',getattr(self.instance,'name',None))
        section = data.get('section',getattr(self.instance,'section',None))
        year = data.get('academic_year',getattr(self.instance,'academic_year',None))

        
        qs = ClassRoom.objects.filter(
            school=school,name=name,
            section=section or '',academic_year=year
        )

        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)

        if qs.exists():
            raise serializers.ValidationError(
                f"Class {name}{('-' + section) if section else ''}"
                f'already exists for {year}'
            )

        return data

    def validate_class_teacher_id(self,value):
        if value is None:
            return None

        school = self.context['request'].user.school

        try:
            teacher = TeacherProfile.objects.filter(pk=value,user__school=school)

        except TeacherProfile.DoesNotExist:
            raise serializers.ValidationError("Teacher not found in your school.")

        if hasattr(teacher,'class_teacher_of'):
            existing = teacher.class_teacher_of

            if self.instance is None or existing.pk != self.instance.pk:
                raise serializers.ValidationError(
                    f"This Teacher is already class Teacher of"
                    f"Class {existing.name} {existing.section or ''}"
                )

        return value


class AssignStudentsSerializer(serializers.Serializer):
    admission_numbers = serializers.ListField(
        child=serializers.CharField(),
        min_length=1
    )


class AssignTeacherSerializer(serializers.Serializer):
    teacher_id = serializers.IntegerField(allow_null=True)




class AcademicRecordClassroomSerializer(serializers.ModelSerializer):
    """Minimal classroom info embedded inside academic record."""
    class_teacher_name = serializers.SerializerMethodField()

    class Meta:
        model  = ClassRoom
        fields = ['id', 'name', 'section', 'academic_year', 'class_teacher_name']

    def get_class_teacher_name(self, obj):
        if obj.class_teacher:
            return obj.class_teacher.user.fullname
        return None



class StudentAcademicRecordSerializer(serializers.ModelSerializer):
    """
    Full academic record — used in student profile history
    and school/teacher views.
    """
    classroom     = AcademicRecordClassroomSerializer(read_only=True)
    student_name  = serializers.CharField(source='student.user.fullname', read_only=True)
    admission_number = serializers.CharField(source='student.admission_number', read_only=True)

    class Meta:
        model  = StudentAcademicRecord
        fields = [
            'id', 'student_name', 'admission_number',
            'classroom', 'academic_year',
            'roll_number', 'is_current', 'promoted',
            'remarks', 'created_at',
        ]


class StudentAcademicRecordListSerializer(serializers.ModelSerializer):
    """
    Lightweight — used in lists (e.g. class roster with year info).
    No nested student — the student is already known from context.
    """
    classroom = AcademicRecordClassroomSerializer(read_only=True)

    class Meta:
        model  = StudentAcademicRecord
        fields = [
            'id', 'classroom', 'academic_year',
            'roll_number', 'is_current', 'promoted', 'remarks',
        ]


class PromoteStudentsSerializer(serializers.Serializer):

    student_ids = serializers.ListField(child=serializers.IntegerField(),min_length=1)
    target_class_id = serializers.IntegerField()
    promoted = serializers.BooleanField(default=True)
    remarks = serializers.CharField(required=False,allow_blank=True,default='')



class UpdateAcademicRecordSerializer(serializers.ModelSerializer):
    """For updating roll number or remarks on an existing record."""
    class Meta:
        model  = StudentAcademicRecord
        fields = ['roll_number', 'remarks']




class AttendancestudentSerializer(serializers.ModelSerializer):

    """used when to embed the student info to attendence sheet rows"""

    fullname = serializers.CharField(source='student.user.fullname')
    profile_picture = serializers.SerializerMethodField()
    admission_number = serializers.CharField(source='student.admission_number')

    class Meta:
        model = StudentAcademicRecord
        fields = ['id','fullname','admission_number','profile_picture','roll_number']

    def get_profile_picture(self,obj):
        return obj.student.user.profile_picture.url if obj.student.user.profile_picture else None


class AttendanceRecordSerializer(serializers.ModelSerializer):

    """ single attendance row - student + their status for a date """

    student = AttendancestudentSerializer(source='academic_record',read_only=True)

    class Meta:
        model = Attendance
        fields = ['id','student','date','status','note','updated_at']


class AttendanceSheetSerializer(serializers.Serializer):
    """
    Used when the teacher opens the attendance sheet.
    Returns all students in the class with their status for the date
    (or null if not yet marked).
    """
    academic_record_id = serializers.IntegerField()
    fullname           = serializers.CharField()
    admission_number   = serializers.CharField()
    roll_number        = serializers.CharField(allow_null=True)
    profile_picture    = serializers.CharField(allow_null=True)
    attendance_id      = serializers.IntegerField(allow_null=True)
    status             = serializers.CharField(allow_null=True)
    note               = serializers.CharField(allow_null=True)


class MarkAttendanceRowSerializer(serializers.Serializer):
    """ one row in bulkmark payloadd"""
    academic_record_id = serializers.IntegerField()
    status = serializers.ChoiceField(choices=['present','absent','late'])
    note = serializers.CharField(required=False, allow_blank=True, default='')


class BulkMarkAttendanceSerializer(serializers.Serializer):
    """
    Payload sent when teacher submits attendance for the day.
    Contains the date and a list of rows — one per student.
    """

    date = serializers.DateField()
    records = serializers.ListField(
        child = MarkAttendanceRowSerializer(),
        min_length = 1
    )

class AttendanceSessionSerializer(serializers.ModelSerializer):

    marked_by_name = serializers.CharField(source='marked_by.fullname',read_only=True)

    class Meta:
        model  = AttendanceSession
        fields = ['id', 'date', 'is_complete', 'marked_by_name', 'created_at', 'updated_at']



class MonthlyAttendanceSummarySerializer(serializers.Serializer):
    """Per-student monthly summary."""
    academic_record_id = serializers.IntegerField()
    fullname           = serializers.CharField()
    admission_number   = serializers.CharField()
    roll_number        = serializers.CharField(allow_null=True)
    profile_picture    = serializers.CharField(allow_null=True)
    total_days         = serializers.IntegerField()
    present            = serializers.IntegerField()
    absent             = serializers.IntegerField()
    late               = serializers.IntegerField()
    attendance_percent = serializers.FloatField()
