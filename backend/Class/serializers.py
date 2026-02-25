from rest_framework import serializers
from Users.models import User
from Profile.models import TeacherProfile,StudentProfile,StudentDocument,ParentProfile
from .models import ClassRoom
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