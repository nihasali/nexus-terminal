from django.shortcuts import render
from Users.models import User,School
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import ClassRoom,StudentAcademicRecord,AttendanceSession,Attendance
from .serializers import (CreateClassRoomSerializer,ClassRoomDetailSerializer,ClassRoomListSerializer,
ClassStudentSerializer,ClassTeacherSerializer,AssignStudentsSerializer,AssignTeacherSerializer,
StudentAcademicRecordSerializer,StudentAcademicRecordListSerializer,AcademicRecordClassroomSerializer,
UpdateAcademicRecordSerializer,PromoteStudentsSerializer,
MonthlyAttendanceSummarySerializer,AttendanceSessionSerializer,BulkMarkAttendanceSerializer,MarkAttendanceRowSerializer,AttendanceRecordSerializer,
AttendancestudentSerializer

)
from datetime import datetime

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
    permission_classes = [IsSchool | IsTeacher]

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



class StudentAcademicHistoryView(APIView):
    """
    student records will be accessible for every roles.
    """

    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self,request,student_id):
        
        student = get_object_or_404(
            StudentProfile,
            pk = student_id,
            user__school=request.user.school
        )

        records = StudentAcademicRecord.objects.filter(
            student = student
        ).select_related('classroom__class_teacher__user').order_by('-academic_year')

        serializer = StudentAcademicRecordListSerializer(records,many=True)

        return Response(serializer.data)


class ClassAcademicRecordsView(APIView):
    """
    Returns all StudentAcademicRecords for students currently in this class.
    Useful for building the attendance sheet and exam marks sheet.
    Accessible by: school, class teacher of this class.
    """
    authentication_classes = [CookieJWTAuthentication]
    permission_classes     = [IsSchool,IsTeacher]

    def get(self,request,class_id):
        
        classroom = get_object_or_404(
            ClassRoom,
            pk = class_id,
            school = request.user.school
        )

        records = StudentAcademicRecord.objects.filter(
            classroom = classroom,
            academic_year = academic_year,
            is_current = True
        ).select_related(
            'student__user',
            'classroom__class_teacher__user'
        ).order_by('roll_number', 'student__user__fullname')

        serializer = StudentAcademicRecordSerializer(records, many=True)
        return Response(serializer.data)


class UpdateAcademicRecordView(APIView):
    """
    Update roll number or remarks on a specific record.
    Only the school can do this.
    """
    authentication_classes = [CookieJWTAuthentication]
    permission_classes     = [IsSchool,IsTeacher]

    def patch(self,request,record_id):

        record = get_object_or_404(
            StudentAcademicRecord,
            pk = record_id,
            classroom__school = request.user.school
        )

        serializer = UpdateAcademicRecordSerializer(
            record,data = request.data,partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(StudentAcademicRecordSerializer(record).data)

        return Response(serializer.errors,status==400)


class PromoteStudentsView(APIView):
    """
    School selects students from a class and promotes them to a target class.

    What happens:
      1. Current academic record is closed (is_current=False, promoted=True/False)
      2. Student's classroom FK is updated to the target class
      3. Signal fires → new StudentAcademicRecord is created for the new year

    """

    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsSchool]

    def post(self,request,class_id):

        source_class = get_object_or_404(
            ClassRoom,
            pk = class_id,
            school = request.user.school
        )

        serializer = PromoteStudentsSerializer(data = request.data)

        if not serializer.is_valid():
            return Response(serializer.errors,status=400)

        
        student_ids = serializer.validated_data['student_ids']
        target_class_id = serializer.validated_data['target_class_id']
        promoted = serializer.validated_data['promoted']
        remarks = serializer.validated_data['remarks']

        target_class = get_object_or_404(
            ClassRoom,
            pk = target_class_id,
            school = request.user.school
        )

        if source_class.pk == target_class.pk:
            return Response(
                {'error':'Source and target class cannot be the same.'},
                status=400
            )

        students = StudentProfile.objects.filter(
            pk__in = student_ids,
            classroom=source_class,
            user__school = request.user.school
        )

        if students.count() != len(student_ids):
            return Response(
                {'error': 'Some students were not found in this class.'},
                status=400
            )


        promoted_count = 0

        for student in students:
            try:
                current_record = StudentAcademicRecord.objects.get(
                    student=student,
                    academic_year = source_class.academic_year,
                    is_current = True
                )

                current_record.close(promoted=promoted,remarks=remarks)  # activating the clase function on models,and triggering the signals

            except StudentAcademicRecord.DoesNotExist:
                pass

            student.classroom = target_class
            student.save()

            promoted_count+=1


        return Response({
            'message': f'{promoted_count} student(s) moved to '
                       f'Class {target_class.name} {target_class.section or ""} '
                       f'({target_class.academic_year}).',
            'promoted_count': promoted_count,
        })


class CurrentAcademicRecordView(APIView):
    """
   
    Returns the student's current active academic record.
    Used by school,teacher, student dashboard and parent dashboard .
    """
    authentication_classes = [CookieJWTAuthentication]
    permission_classes     = [IsAuthenticated]


    def get(self,request,student_id):

        student = get_object_or_404(
            StudentProfile,
            pk = class_id,
            user__school = request.user.school
        )

        record = StudentAcademicRecord.objects.filter(
            student = student,
            is_current = True
        ).select_related(
            'classroom__class_teacher__user'
        ).first()

        if not record:
            return Response(
                {'error': 'No active academic record found for this student.'},
                status=404
            )

        serializer = StudentAcademicRecordSerializer(record)
        return Response(serializer.data)



def verify_class_teacher_access(request, classroom):
    """
    Returns None if access is allowed.
    Returns a 403 Response if access is denied.
    School admins always pass. Teachers must be the class teacher.
    """
    if request.user.user_type == 'school':
        return None  # school admin has full access

    if request.user.user_type == 'teacher':
        try:
            teacher = TeacherProfile.objects.get(user=request.user)
            if hasattr(teacher, 'class_teacher_of') and teacher.class_teacher_of.pk == classroom.pk:
                return None  # this teacher IS the class teacher of this class
        except TeacherProfile.DoesNotExist:
            pass

    return Response(
        {'error': 'Only the class teacher of this class can perform this action.'},
        status=403
    )


class AttendanceSheetView(APIView):
    """
    GET /attendance/classes/<class_id>/sheet/?date=YYYY-MM-DD
    Returns all students in the class with their attendance status
    for the given date. If not yet marked, status is null.
    Used by the teacher to open the daily attendance sheet.
    """
    authentication_classes = [CookieJWTAuthentication]
    permission_classes     = [IsSchool | IsTeacher]

    def get(self,request,class_id):

        
        classroom = get_object_or_404(
            ClassRoom,
            pk=class_id,
            school=request.user.school
        )

        denied = verify_class_teacher_access(request, classroom)
        if denied:
            return denied

        date_str = request.query_params.get('date')

        if not date_str:
            from datetime import date
            target_date = date.today()

        else:
            try:
                from datetime import datetime
                target_date = datetime.strptime(date_str,'%Y-%m-%d').date()
            
            except ValueError:
                return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=400)


        records = StudentAcademicRecord.objects.filter(
            classroom=classroom,
            is_current=True
        ).select_related('student__user')

        existing = {
            a.academic_record_id : a for a in Attendance.objects.filter(
                academic_record__in = records,
                date = target_date
            )
        }

        session = AttendanceSession.objects.filter(
            classroom = classroom,
            date = target_date
        ).first()

        sheet = []
        for record in records.order_by('roll_number','student__user__fullname'):
            att = existing.get(record.id)
            sheet.append({
                'academic_record_id':record.id,
                'fullname':record.student.user.fullname,
                'admission_number':record.student.admission_number,
                'roll_number':record.roll_number,
                'profile_picture':    (
                    record.student.user.profile_picture.url
                    if record.student.user.profile_picture else None
                ),
                'attendance_id': att.id if att else None,
                'status':        att.status if att else None,
                'note':          att.note if att else None,
            })

        return Response({
            'date':target_date.isoformat(),
            'classroom':    {
                'id':            classroom.id,
                'name':          classroom.name,
                'section':       classroom.section,
                'academic_year': classroom.academic_year,
            },
            'session':      AttendanceSessionSerializer(session).data if session else None,
            'total_students': len(sheet),
            'sheet': sheet
        })


class BulkMarkAttendanceView(APIView):
    """
    POST /attendance/classes/<class_id>/mark/
    Teacher submits attendance for the whole class for a date.
    Uses get_or_create + update so it's safe to call multiple times
    (teacher can correct mistakes before marking complete).

    Payload:
    {
        "date": "2025-03-01",
        "records": [
            {"academic_record_id": 1, "status": "present", "note": ""},
            {"academic_record_id": 2, "status": "absent",  "note": "Sick"},
            ...
        ]
    }
    """
    authentication_classes = [CookieJWTAuthentication]
    permission_classes     = [IsSchool | IsTeacher]

    def post(self, request, class_id):

        classroom = get_object_or_404(
            ClassRoom,
            pk=class_id,
            school=request.user.school
        )

        denied = verify_class_teacher_access(request, classroom)
        if denied:
            return denied

        serializer = BulkMarkAttendanceSerializer(data = request.data)
        if not serializer.is_valid():
            return Response(serializer.errors,status=400)

        target_date = serializer.validated_data['date']
        rows = serializer.validated_data['records']

        record_ids = [r['academic_record_id'] for r in rows]
        valid_records = StudentAcademicRecord.objects.filter(
            id__in=record_ids,
            classroom=classroom,
            is_current =  True
        )

        valid_ids = set(valid_records.values_list('id', flat=True))
        invalid   = set(record_ids) - valid_ids
        if invalid:
            return Response(
                {'error': f'Invalid academic record IDs for this class: {list(invalid)}'},
                status=400
            )

        created_count = 0
        updated_count = 0
        for row in rows:
            att,created = Attendance.objects.get_or_create(
                academic_record_id = row['academic_record_id'],
                date = target_date,
                defaults={
                    'status':    row['status'],
                    'note':      row.get('note', ''),
                    'marked_by': request.user,
                }
            )

            if not created:
                att.status = row['status']
                att.note = row.get('note','')
                att.marked_by = request.user
                att.save()
                updated_count+=1
            else:
                created_count+=1

        
        session,_ = AttendanceSession.objects.get_or_create(
            classroom=classroom,
            date=target_date,
            defaults = {'marked_by':request.user}
        )

        return Response({
            'message':       f'Attendance saved for {target_date}.',
            'date':          target_date.isoformat(),
            'created':       created_count,
            'updated':       updated_count,
            'total':         len(rows),
            'is_complete':   session.is_complete,
        })




class SubmitAttendanceView(APIView):

    authentication_classes = [CookieJWTAuthentication]
    permission_classes     = [IsSchool | IsTeacher]


    def post(self, request, class_id):
        classroom = get_object_or_404(ClassRoom, pk=class_id, school=request.user.school)
        
        denied = verify_class_teacher_access(request, classroom)
        if denied:
            return denied

        date_str = request.query_params.get('date')
        target_date = datetime.strptime(date_str, '%Y-%m-%d').date()

        # Auto-fill any students not yet marked as present
        records = StudentAcademicRecord.objects.filter(
            classroom=classroom, is_current=True
        )
        existing_ids = set(
            Attendance.objects.filter(
                academic_record__in=records, date=target_date
            ).values_list('academic_record_id', flat=True)
        )
        for record in records:
            if record.id not in existing_ids:
                Attendance.objects.create(
                    academic_record=record,
                    date=target_date,
                    status='present',       # default unfilled = present
                    marked_by=request.user,
                )

        session, _ = AttendanceSession.objects.get_or_create(
            classroom=classroom, date=target_date,
            defaults={'marked_by': request.user}
        )
        session.is_complete = True
        session.save()

        return Response({'message': f'Attendance submitted for {target_date}.'})




class ClassAttendanceHistoryView(APIView):
    """
    GET /attendance/classes/<class_id>/history/
    Returns all attendance sessions for a class — which dates have been marked.
    Optional filter: ?month=2025-03
    Used for the calendar view on the teacher dashboard.
    """
    authentication_classes = [CookieJWTAuthentication]
    permission_classes     = [IsSchool | IsTeacher]

    def get(self, request, class_id):

        

        classroom = get_object_or_404(
            ClassRoom,
            pk=class_id,
            school=request.user.school
        )

        denied = verify_class_teacher_access(request, classroom)
        if denied:
            return denied

        sessions = AttendanceSession.objects.filter(
            classroom=classroom
        ).order_by('-date')

        month = request.query_params.get('month')   # "2025-03"
        if month:
            try:
                year, mon = month.split('-')
                sessions = sessions.filter(
                    date__year=int(year),
                    date__month=int(mon)
                )
            except (ValueError, AttributeError):
                pass

        return Response(AttendanceSessionSerializer(sessions, many=True).data)


class StudentAttendanceView(APIView):
    """
    GET /attendance/students/<student_id>/
    Returns a student's full attendance history.
    Optional filters: ?month=2025-03  or  ?year=2025
    Accessible by: school, the student themselves, their parents.
    """
    authentication_classes = [CookieJWTAuthentication]
    permission_classes     = [IsAuthenticated]

    def get(self, request, student_id):

        student = get_object_or_404(StudentProfile, pk=student_id)

        # Role-based access check
        if request.user.user_type == 'parent':
            parent = get_object_or_404(ParentProfile, user=request.user)
            if not parent.students.filter(id=student_id).exists():
                return Response({'error': 'Access denied.'}, status=403)

        elif request.user.user_type == 'student':
            if student.user != request.user:
                return Response({'error': 'Access denied.'}, status=403)

        elif request.user.user_type == 'school':
            if student.user.school != request.user.school:
                return Response({'error': 'Access denied.'}, status=403)

        elif request.user.user_type == 'teacher':
            try:
                teacher = TeacherProfile.objects.get(user=request.user)
                assigned_class_ids = teacher.teaching_assignments.filter(
                    is_active=True
                ).values_list('classroom_id', flat=True)
                if not StudentAcademicRecord.objects.filter(
                    student=student,
                    classroom_id__in=assigned_class_ids,
                    is_current=True
                ).exists():
                    return Response({'error': 'Access denied.'}, status=403)
            except TeacherProfile.DoesNotExist:
                return Response({'error': 'Access denied.'}, status=403)

        else:
            return Response({'error': 'Access denied.'}, status=403)

        record = StudentAcademicRecord.objects.filter(
            student=student,
            is_current = True
        ).first()


        if not record:
            return Response({'error': 'No active academic record found.'}, status=404)

        attendance = Attendance.objects.filter(
            academic_record=record
        ).order_by('-date')


        month = request.query_params.get('month')
        year  = request.query_params.get('year')
        if month:
            try:
                y, m = month.split('-')
                attendance = attendance.filter(date__year=int(y), date__month=int(m))
            except (ValueError, AttributeError):
                pass
        elif year:
            try:
                attendance = attendance.filter(date__year=int(year))
            except ValueError:
                pass

        total = attendance.count()
        present = attendance.filter(status='present').count()
        absent  = attendance.filter(status='absent').count()
        late    = attendance.filter(status='late').count()
        percent = round((present+late)/total * 100,1) if total > 0 else 0.0


        return Response({
            'student': {
                'id':               student.id,
                'fullname':         student.user.fullname,
                'admission_number': student.admission_number,
                'classroom':        f"Class {record.classroom.name} {record.classroom.section or ''}".strip(),
                'academic_year':    record.academic_year,
            },
            'summary': {
                'total_days':         total,
                'present':            present,
                'absent':             absent,
                'late':               late,
                'attendance_percent': percent,
            },
            'records': AttendanceRecordSerializer(attendance, many=True).data,
        })




class MonthlyAttendanceSummaryView(APIView):
    """
    GET /attendance/classes/<class_id>/monthly-summary/?month=2025-03
    Returns per-student attendance summary for a month.
    Used for the monthly report on the school dashboard.
    """
    authentication_classes = [CookieJWTAuthentication]
    permission_classes     = [IsSchool | IsTeacher]

    def get(self, request, class_id):

        

        classroom = get_object_or_404(
            ClassRoom,
            pk=class_id,
            school=request.user.school
        )

        denied = verify_class_teacher_access(request, classroom)
        if denied:
            return denied

        month = request.query_params.get('month')
        if not month:
            from datetime import date
            today = date.today()
            year, mon = today.year, today.month
        else:
            try:
                year, mon = month.split('-')
                year, mon = int(year), int(mon)
            except (ValueError, AttributeError):
                return Response({'error': 'Invalid month format. Use YYYY-MM.'}, status=400)

        records = StudentAcademicRecord.objects.filter(
            classroom=classroom,
            is_current=True
        ).select_related('student__user')

        # Count total school days in this month (dates where sessions exist)
        total_days = AttendanceSession.objects.filter(
            classroom=classroom,
            date__year=year,
            date__month=mon
        ).count()

        summary = []
        for record in records.order_by('roll_number', 'student__user__fullname'):
            qs      = Attendance.objects.filter(
                academic_record=record,
                date__year=year,
                date__month=mon
            )
            present = qs.filter(status='present').count()
            absent  = qs.filter(status='absent').count()
            late    = qs.filter(status='late').count()
            total   = qs.count()
            percent = round((present + late) / total * 100, 1) if total > 0 else 0.0

            summary.append({
                'academic_record_id': record.id,
                'fullname':           record.student.user.fullname,
                'admission_number':   record.student.admission_number,
                'roll_number':        record.roll_number,
                'profile_picture': (
                    record.student.user.profile_picture.url
                    if record.student.user.profile_picture else None
                ),
                'total_days':         total_days,
                'present':            present,
                'absent':             absent,
                'late':               late,
                'attendance_percent': percent,
            })

        return Response({
            'month':      f'{year}-{str(mon).zfill(2)}',
            'total_days': total_days,
            'classroom': {
                'id':      classroom.id,
                'name':    classroom.name,
                'section': classroom.section,
            },
            'students': summary,
        })




class MyClassView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes     = [IsTeacher]

    def get(self, request):
        try:
            teacher = TeacherProfile.objects.get(user=request.user)
            classroom = teacher.class_teacher_of
            return Response({
                'id':            classroom.id,
                'name':          classroom.name,
                'section':       classroom.section,
                'academic_year': classroom.academic_year,
                'student_count': classroom.students.count(),
            })
        except (TeacherProfile.DoesNotExist, ClassRoom.DoesNotExist, AttributeError):
            return Response({'error': 'No class assigned.'}, status=404)