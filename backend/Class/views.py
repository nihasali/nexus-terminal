from django.shortcuts import render
from Users.models import User,School
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import ClassRoom
from .serializers import (CreateClassRoomSerializer,ClassRoomDetailSerializer,ClassRoomListSerializer,
ClassStudentSerializer,ClassTeacherSerializer,AssignStudentsSerializer,AssignTeacherSerializer
)
from Profile.models import TeacherProfile,PasswordSetupToken,StudentProfile,StudentDocument,ParentProfile
from django.db.models import Count, Q
from rest_framework import status

from rest_framework.permissions import IsAuthenticated
from Users.authentication import CookieJWTAuthentication
from rest_framework.parsers import MultiPartParser, FormParser
from Users.permissions import IsSchool,IsTeacher,IsStudent,IsParent
from django.db import transaction
from django.shortcuts import get_object_or_404

class CreateClassRoomListCreateView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsSchool]

    def get(self,request):

        school = request.user.school

        classrooms = ClassRoom.objects.filter(
            school=school
        ).select_related(
            'class_teacher__user'
        ).annotate(
            total_students=Count('students')
        ).order_by('name','section')

        year = request.query_params.get('year')
        search = request.query_params.get('search')

        if year:
            classrooms = classrooms.filter(academic_year=year)

        if search:
            classrooms = classrooms.filter(
                Q(name__icontains=search) |
                Q(section__icontain=search)
            )

        serializer=ClassRoomListSerializer(classrooms,many=True)

        return Response(serializer.data)

    
    def post(self,request):
        school = request.user.school

        serializer = CreateClassRoomSerializer(
            data = request.data,
            context = {'request':request}
        )

        if serializer.is_valid():
            teacher_id = serializer.validated_data.pop('class_teacher_id', None)
            classroom  = serializer.save(school=school)

            if teacher_id:
                try:
                    teacher = TeacherProfile.objects.filter(pk=teacher_id,user__school=school).first()
                    classroom.class_teacher=teacher
                    classroom.save()
            
                except TeacherProfile.DoesNotExist:
                    pass

            result = ClassRoom.objects.filter(pk=classroom.pk).annotate(
                total_students=Count('students')
            ).first()

            return Response(
                ClassRoomDetailSerializer(result).data,
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) 


class ClassRoomDetailView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes     = [IsSchool]

    def get_object(self, pk, request):
        # Scope to School tenant — a school can never access another school's class
        return get_object_or_404(ClassRoom, pk=pk, school=request.user.school)

    def get(self,request,pk):
        self.get_object(pk,request)

        classroom = ClassRoom.objects.filter(pk=pk).annotate(
            total_students=Count('students')
        ).prefetch_related('students__user').select_related(
            'class_teacher__user'
        ).first()

        return Response(ClassRoomDetailSerializer(classroom).data)

    
    def patch(self,request,pk):

        classroom=self.get_object(pk,request)
        serializer=CreateClassRoomSerializer(
            ClassRoom,
            data = request.data,
            partial=True,
            context={'request':request}
        )

        if serializer.is_valid():
            teacher_id = serializer.validated_data.pop('class_teacher_id', None)
            classroom  = serializer.save()

            if 'class_teacher_id' in request.data:
                if teacher_id is None:
                    classroom.class_teacher=None

                else:
                    try:
                        teacher = TeacherProfile.objects.get(
                            pk=teacher_id,
                            user__school=request.user.school  
                        )
                        classroom.class_teacher = teacher

                    except TeacherProfile.DoesNotExist:
                        pass
                
                classroom.save()

            result = ClassRoom.objects.filter(pk=pk).annotate(
                total_students=Count('students')
            ).first()

            return Response(ClassRoomDetailSerializer(result).data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self,request,pk):
        classroom=self.get_object(pk,request)

        classroom.students.update(classroom=None)
        classroom.delete()
        return Response({'message':'deletion is successfull !'},status=status.HTTP_204_NO_CONTENT)
        

class ClassRoomAssignStudentsView(APIView):

    authentication_classes = [CookieJWTAuthentication]
    permission_classes     = [IsSchool]

    def get_object(self, pk, request):
        return get_object_or_404(ClassRoom, pk=pk, school=request.user.school)

    
    def post(self,request,pk):

        school = request.user.school

        classroom=self.get_object(pk,request)

        serializer = AssignStudentsSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors,status=400)

        admission_numbers = serializer.validated_data['admission_numbers']


        students = StudentProfile.objects.filter(
            admission_number__in=admission_numbers,
            user__school=school
        )


        found = set(students.values_list('admission_number',flat=True))
        missing = set(admission_numbers) - found

        if missing:
            return Response(
                {'error': f"Students not found in your school: {', '.join(missing)}"},
                status=400
            )

        already_elsewhere=students.filter(
            classroom__isnull=False
        ).exclude(classroom=classroom)

        if already_elsewhere.exists():
            names = [
                f"{s.admission_number} (currently in Class "
                f"{s.classroom.name} {s.classroom.section or ''})"
                for s in already_elsewhere
            ]
            return Response(
                {'error': f"These students are already in another class: "
                          f"{', '.join(names)}. Remove them from their current class first."},
                status=400
            )

        
        students.update(classroom=classroom)

        result = ClassRoom.objects.filter(pk=pk).annotate(
            total_students=Count('students')
        ).prefetch_related('students__user').select_related('class_teacher__user').first()

        return Response(ClassRoomDetailSerializer(result).data)

    def delete(self, request, pk):
        classroom  = self.get_object(pk, request)
        serializer = AssignStudentsSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        admission_numbers = serializer.validated_data['admission_numbers']

        students = StudentProfile.objects.filter(
            admission_number__in=admission_numbers,
            classroom=classroom,
            user__school=request.user.school
        )
        students.update(classroom=None)

        result = ClassRoom.objects.filter(pk=pk).annotate(
            total_students=Count('students')
        ).prefetch_related('students__user').select_related('class_teacher__user').first()


        return Response(ClassRoomDetailSerializer(result).data)


class ClassRoomAssignTeacherView(APIView):
    
    authentication_classes = [CookieJWTAuthentication]
    permission_classes     = [IsSchool]

    def post(self, request, pk):
        classroom  = get_object_or_404(ClassRoom, pk=pk, school=request.user.school)
        serializer = AssignTeacherSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        teacher_id = serializer.validated_data['teacher_id']

        if teacher_id is None:
            classroom.class_teacher=None
            classroom.save()

        else:
            teacher = get_object_or_404(
                TeacherProfile,
                pk=teacher_id,
                user__school=request.user.school
            )

            if hasattr(teacher,'class_teacher_of') and teacher.class_teacher_of.pk != pk:
                existing = teacher.class_teacher_of

                return Response(
                    {'error': f"This teacher is already class teacher of "
                              f"Class {existing.name} {existing.section or ''}."},
                    status=400
                )

            classroom.class_teacher=teacher
            classroom.save()

        
        result = ClassRoom.objects.filter(pk=pk).annotate(
            total_students=Count('students')
        ).prefetch_related('students__user').select_related('class_teacher__user').first()

        return Response(ClassRoomDetailSerializer(result).data)


class UnassignedStudentsView(APIView):

    """
    GET → students in this school not yet assigned to any classroom.
    Used by the Add Students slide panel dropdown.
    """
    authentication_classes = [CookieJWTAuthentication]
    permission_classes     = [IsSchool]

    def get(self,request):

        students = StudentProfile.objects.filter(
            user__school=request.user.school,
            classroom__isnull=True
        ).select_related('user').order_by('user__fullname')

        serializer = ClassStudentSerializer(students,many=True)
        return Response(serializer.data)


class AvailableTeachersView(APIView):

    authentication_classes = [CookieJWTAuthentication]
    permission_classes     = [IsSchool]

    def get(self,request):
        teachers = TeacherProfile.objects.filter(
            user__school = request.user.school,
            class_teacher_of__isnull=True
        ).select_related('user').order_by('user__fullname')

        serializer = ClassTeacherSerializer(teachers, many=True)
        return Response(serializer.data)


class AcademicYearsView(APIView):
    """
    GET → distinct academic years used by this school's classrooms.
    Used by the year filter dropdown on ClassList.
    """
    authentication_classes = [CookieJWTAuthentication]
    permission_classes     = [IsSchool]


    def get(self,request):
        years = (
            ClassRoom.objects
            .filter(school=request.user.school)
            .values_list('academic_year', flat=True)
            .distinct()
            .order_by('-academic_year')
        )
        return Response(list(years))