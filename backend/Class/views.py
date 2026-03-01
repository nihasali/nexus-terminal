from django.shortcuts import render
from Users.models import User,School
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import ClassRoom
from .serializers import (CreateClassRoomSerializer,ClassRoomDetailSerializer,ClassRoomListSerializer,
ClassStudentSerializer,ClassTeacherSerializer,AssignStudentsSerializer,AssignTeacherSerializer,

)

# from .serializers import StudentAcademicRecordSerializer,StudentAcademicRecordListSerializer,AcademicRecordClassroomSerializer,
# UpdateAcademicRecordSerializer,PromoteStudentsSerializer

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


# class StudentAcademicHistoryView(APIView):
#     """
#     student records will be accessible for every roles.
#     """

#     authentication_classes = [CookieJWTAuthentication]
#     permission_classes = [IsAuthenticated]

#     def get(self,request,student_id):
        
#         student = get_object_or_404(
#             StudentProfile,
#             pk = student_id,
#             user__school=request.user.school
#         )

#         records = StudentAcademicRecord.objects.filter(
#             student = student
#         ).select_related('classroom__class_teacher__user').order_by('-academic_year')

#         serializer = StudentAcademicRecordListSerializer(records,many=True)

#         return Response(serializer.data)


# class ClassAcademicRecordsView(APIView):
#     """
#     Returns all StudentAcademicRecords for students currently in this class.
#     Useful for building the attendance sheet and exam marks sheet.
#     Accessible by: school, class teacher of this class.
#     """
#     authentication_classes = [CookieJWTAuthentication]
#     permission_classes     = [IsSchool,IsTeacher]

#     def get(self,request,class_id):
        
#         classroom = get_object_or_404(
#             ClassRoom,
#             pk = class_id,
#             school = request.user.school
#         )

#         records = StudentAcademicRecord.objects.filter(
#             classroom = classroom,
#             academic_year = academic_year,
#             is_current = True
#         ).select_related(
#             'student__user',
#             'classroom__class_teacher__user'
#         ).order_by('roll_number', 'student__user__fullname')

#         serializer = StudentAcademicRecordSerializer(records, many=True)
#         return Response(serializer.data)


# class UpdateAcademicRecordView(APIView):
#     """
#     Update roll number or remarks on a specific record.
#     Only the school can do this.
#     """
#     authentication_classes = [CookieJWTAuthentication]
#     permission_classes     = [IsSchool,IsTeacher]

#     def patch(self,request,record_id):

#         record = get_object_or_404(
#             StudentAcademicRecord,
#             pk = record_id,
#             classroom__school = request.user.school
#         )

#         serializer = UpdateAcademicRecordSerializer(
#             record,data = request.data,partial=True
#         )

#         if serializer.is_valid():
#             serializer.save()
#             return Response(StudentAcademicRecordSerializer(record).data)

#         return Response(serializer.errors,status==400)


# class PromoteStudentsView(APIView):
#     """
#     School selects students from a class and promotes them to a target class.

#     What happens:
#       1. Current academic record is closed (is_current=False, promoted=True/False)
#       2. Student's classroom FK is updated to the target class
#       3. Signal fires → new StudentAcademicRecord is created for the new year

#     """

#     authentication_classes = [CookieJWTAuthentication]
#     permission_classes = [IsSchool]

#     def post(self,request,class_id):

#         source_class = get_object_or_404(
#             ClassRoom,
#             pk = class_id,
#             school = request.user.school
#         )

#         serializer = PromoteStudentsSerializer(data = request.data)

#         if not serializer.is_valid():
#             return Response(serializer.errors,status=400)

        
#         student_ids = serializer.validated_data['student_ids']
#         target_class_id = serializer.validated_data['target_class_id']
#         promoted = serializer.validated_data['promoted']
#         remarks = serializer.validated_data['remarks']

#         target_class = get_object_or_404(
#             ClassRoom,
#             pk = target_class_id,
#             school = request.user.school
#         )

#         if source_class.pk == target_class.pk:
#             return Response(
#                 {'error':'Source and target class cannot be the same.'},
#                 status=400
#             )

#         students = StudentProfile.objects.filter(
#             pk__in = student_ids,
#             classroom=source_class,
#             user__school = request.user.school
#         )

#         if students.count() != len(student_ids):
#             return Response(
#                 {'error': 'Some students were not found in this class.'},
#                 status=400
#             )


#         promoted_count = 0

#         for student in students:
#             try:
#                 current_record = StudentAcademicRecord.objects.get(
#                     student=student,
#                     academic_year = source_class.academic_year,
#                     is_current = True
#                 )

#                 current_record.close(promoted=promoted,remarks=remarks)  # activating the clase function on models,and triggering the signals

#             except StudentAcademicRecord.DoesNotExist:
#                 pass

#             student.classroom = target_class
#             student.save()

#             promoted_count+=1


#         return Response({
#             'message': f'{promoted_count} student(s) moved to '
#                        f'Class {target_class.name} {target_class.section or ""} '
#                        f'({target_class.academic_year}).',
#             'promoted_count': promoted_count,
#         })


# class CurrentAcademicRecordView(APIView):
#     """
   
#     Returns the student's current active academic record.
#     Used by school,teacher, student dashboard and parent dashboard .
#     """
#     authentication_classes = [CookieJWTAuthentication]
#     permission_classes     = [IsAuthenticated]


#     def get(self,request,student_id):

#         student = get_object_or_404(
#             StudentProfile,
#             pk = class_id,
#             user__school = request.user.school
#         )

#         record = StudentAcademicRecord.objects.filter(
#             student = student,
#             is_current = True
#         ).select_related(
#             'classroom__class_teacher__user'
#         ).first()

#         if not record:
#             return Response(
#                 {'error': 'No active academic record found for this student.'},
#                 status=404
#             )

#         serializer = StudentAcademicRecordSerializer(record)
#         return Response(serializer.data)