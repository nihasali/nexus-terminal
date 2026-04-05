from rest_framework import serializers
from Users.models import User
from Profile.models import TeacherProfile,StudentProfile,StudentDocument,ParentProfile
from Class.models import ClassRoom
from django.db.models import Count, Q
from .models import Subject,TeachingAssignment,PeriodTiming,Period

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Subject
        fields = ['id', 'name', 'code']

class CreateSubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['name','code']

    def validate_name(self,value):
        school = self.context['request'].user.school

        qs = Subject.objects.filter(school=school,name__iexact = value.strip())

        if self.instance:
            qs = qs.exclude(pk = self.instance.pk)

        if qs.exists():
            raise serializers.ValidationError(
                f"Subject {value} already exists in your school"
            )

        return value.strip()


class AssignmentTeacherSerializer(serializers.ModelSerializer):

    fullname = serializers.CharField(source='user.fullname')
    email = serializers.EmailField(source='user.email')
    profile_picture = serializers.SerializerMethodField()

    class Meta:                          # ← this was missing
        model  = TeacherProfile
        fields = ['id', 'fullname', 'email', 'profile_picture']

    def get_profile_picture(self,obj):
        return obj.user.profile_picture.url if obj.user.profile_picture else None



class AssignmentClassroomSerializer(serializers.ModelSerializer):
    """Lightweight classroom info embedded in assignment responses."""
    class Meta:
        model  = ClassRoom
        fields = ['id', 'name', 'section', 'academic_year']


class TeachingAssignmentSerializer(serializers.ModelSerializer):

    teacher = AssignmentTeacherSerializer(read_only=True)
    classroom = AssignmentClassroomSerializer(read_only=True)
    subject = SubjectSerializer(read_only=True)

    class Meta:
        model = TeachingAssignment
        fields = ['id','teacher','classroom','subject','academic_year','is_active','created_at']


class CreateTeachingAssignmentSerializer(serializers.Serializer):

    teacher_id = serializers.IntegerField()
    classroom_id = serializers.IntegerField()
    subject_id = serializers.IntegerField()
    academic_year = serializers.CharField(max_length=20)

    def validate(self,data):

        school = self.context['request'].user.school
        teacher_id = data['teacher_id']
        classroom_id = data['classroom_id']
        subject_id = data['subject_id']
        academic_year = data['academic_year']

        try:
            teacher = TeacherProfile.objects.get(pk=teacher_id,user__school=school)
        except TeacherProfile.DoesNotExist:
            raise serializers.ValidationError({'teacher_id': 'Teacher not found in your school.'})

        try:
            classroom = ClassRoom.objects.get(pk = classroom_id,school=school)
        except ClassRoom.DoesNotExist:
            raise serializers.ValidationError({'classroom_id': 'Class not found in your school.'})

        try:
            subject = Subject.objects.get(pk = subject_id,school=school)
        except Subject.DoesNotExist:
            raise serializers.ValidationError({'subject_id': 'Subject not found in your school.'})

        
        if TeachingAssignment.objects.filter(
            teacher = teacher,
            classroom = classroom,
            subject = subject,
            academic_year = academic_year
        ).exists():
            raise serializers.ValidationError(
                f"{teacher.user.fullname} is already assigned to teach "
                f"{subject.name} in {classroom} for {academic_year}."
            )

        
        data['teacher'] = teacher
        data['classroom'] = classroom
        data['subject'] = subject

        return data



class PeriodTimingSerializer(serializers.ModelSerializer):

    class Meta:
        model = PeriodTiming
        fields = ['id','period_number','label','start_time','end_time']

class PeriodSlotSerializer(serializers.ModelSerializer):

    """
    A single timetable slot — used inside the grid response.
    """

    subject_name = serializers.CharField(source='assignment.subject.name')
    subject_id = serializers.IntegerField(source='assignment.subject.id')
    teacher_name = serializers.CharField(source='assignment.teacher.user.fullname')
    teacher_id = serializers.IntegerField(source='assignment.teacher.id')
    assignment_id = serializers.IntegerField(source='assignment.id')

    class Meta:
        model = Period
        fields = [
            'id', 'day', 'period_number',
            'subject_name', 'subject_id',
            'teacher_name', 'teacher_id',
            'assignment_id',
        ]


class TimetableGridSerializer(serializers.Serializer):

    """
    Full timetable grid for a class.
    Shape: { timings: [...], days: { Monday: { 1: slot|null, 2: slot|null ... } } }
    """

    classroom = serializers.DictField()
    timings = PeriodTimingSerializer(many=True)
    days = serializers.DictField()


