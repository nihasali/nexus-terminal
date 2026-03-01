from django.shortcuts import render
from Users.models import User,School
from rest_framework.views import APIView
from rest_framework.response import Response
from Class.models import ClassRoom
from .models import Subject,TeachingAssignment

from .serializers import (
    SubjectSerializer,CreateSubjectSerializer,AssignmentTeacherSerializer,AssignmentClassroomSerializer,
    TeachingAssignmentSerializer,CreateTeachingAssignmentSerializer,
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


class SubjectListCreateView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsSchool]

    def get(self,request):
        subjects = Subject.objects.filter(school=request.user.school)
        serializer = SubjectSerializer(subjects,many=True)
        return Response(serializer.data)

    def post(self,request):

        serializer = CreateSubjectSerializer(data=request.data,context = {'request':request})

        if serializer.is_valid():
            subject = serializer.save(school = request.user.school)
            return Response(SubjectSerializer(subject).data,status=201)

        return Response(serializer.errors,status=400)

class SubjectDetailView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsSchool]

    def get_object(self,pk,request):
        return get_object_or_404(Subject,pk=pk,school=request.user.school)

    def patch(self,request,pk):

        subject = self.get_object(pk,request)

        serializer = CreateSubjectSerializer(
            subject,
            data = request.data,
            partial = True,context={'request':request}
        )

        if serializer.is_valid():
            serializer.save()
            return Response(SubjectSerializer(subject).data)

        return Response(serializer.errors,status=400)

    def delete(self,request,pk):
        subject = self.get_object(pk,request)

        if subject.assignments.exists():
            return Response(
                {'error': f"Cannot delete '{subject.name}' — it has active teaching "
                          f"assignments. Remove those assignments first."},
                status=400
            )
        
        subject.delete()
        return Response(status=204)


class TeachingAssignmentListCreateView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes     = [IsSchool]

    def get(self,request):

        assignments = TeachingAssignment.objects.filter(
            classroom__school=request.user.school
        ).select_related(
            'teacher__user',
            'classroom',
            'subject'
        )

        classroom_id = request.query_params.get('classroom_id')
        teacher_id = request.query_params.get('teacher_id')
        year = request.query_params.get('year')
        subject_id = request.query_params.get('subject_id')
        is_active = request.query_params.get('is_active')

        if classroom_id: assignments = assignments.filter(classroom_id=classroom_id)
        if teacher_id:   assignments = assignments.filter(teacher_id=teacher_id)
        if year:         assignments = assignments.filter(academic_year=year)
        if subject_id:   assignments = assignments.filter(subject_id=subject_id)
        if is_active is not None:
            assignments = assignments.filter(is_active=is_active.lower() == 'true')

        serializer = TeachingAssignmentSerializer(assignments,many=True)
        return Response(serializer.data)


    def post(self,request):

        serializer = CreateTeachingAssignmentSerializer(
            data = request.data,
            context = {'request':request}
        )

        if serializer.is_valid():
            vd = serializer.validated_data
            assignment = TeachingAssignment.objects.create(
                teacher = vd['teacher'],
                classroom = vd['classroom'],
                subject = vd['subject'],
                academic_year = vd['academic_year']
            )

            return Response(
                TeachingAssignmentSerializer(assignment).data,
                status=201
            )
        return Response(serializer.errors,status=400)


class TeachingAssignmentDetailView(APIView):

    authentication_classes = [CookieJWTAuthentication]
    permission_classes     = [IsSchool]

    def get_object(self,pk,request):
        return get_object_or_404(
            TeachingAssignment,
            pk=pk,
            classroom__school=request.user.school
        )

    def patch(self,request,pk):
        assignment = self.get_object(pk,request)

        is_active = request.data.get('is_active')
        if is_active is None:
            return Response({'error': 'Only is_active can be updated.'}, status=400)

        assignment.is_active = bool(is_active)
        assignment.save()
        return Response(TeachingAssignmentSerializer(assignment).data)

    def delete(self,request,pk):
        assignment = self.get_object(pk,request)
        assignment.delete()
        return Response(status=204)


class ClassTeachingAssignmentsView(APIView):
    """
    GET /school-classes/<class_id>/assignments/
    All teaching assignments for a specific class.
    Used in ClassDetail to show which teacher teaches which subject.
    Accessible by: school, teachers of that class.
    """
    authentication_classes = [CookieJWTAuthentication]
    permission_classes     = [IsAuthenticated]

    def get(self,request,class_id):
        classroom = get_object_or_404(
            ClassRoom,
            pk=class_id,
            school = request.user.school
        )

        assignments = TeachingAssignment.objects.filter(
            classroom=classroom,
            academic_year = classroom.academic_year,
            is_active=True
        ).select_related('teacher__user','subject')

        serializer = TeachingAssignmentSerializer(assignments,many=True)
        return Response(serializer.data)



class TeacherAssignmentsView(APIView):
    """
    GET /Subject_teacher/teachers/<teacher_id>/assignments/
    All classes a teacher is assigned to — current and past.
    Used in teacher dashboard and teacher profile.
    Optional filter: ?year=2025-26
    """
    authentication_classes = [CookieJWTAuthentication]
    permission_classes     = [IsAuthenticated]

    def get(self,request,teacher_id):

        teacher = get_object_or_404(
            TeacherProfile,
            pk = teacher_id,
            user__school=request.user.school
        )

        assignments = TeachingAssignment.objects.filter(
            teacher=teacher
        ).select_related('classroom','subject')

        year = request.query_params.get('year')
        if year:
            assignments = assignments.filter(academic_year=year)

        serializer = TeachingAssignmentSerializer(assignments, many=True)
        return Response(serializer.data)



class MyAssignmentsView(APIView):
    """
    GET /Profile/my-assignments/
    For the logged-in teacher — returns their own teaching assignments.
    Used by teacher dashboard to show "My Classes" and "My Subjects".
    """
    authentication_classes = [CookieJWTAuthentication]
    permission_classes     = [IsTeacher]

    def get(self, request):
        teacher = get_object_or_404(TeacherProfile, user=request.user)

        assignments = TeachingAssignment.objects.filter(
            teacher=teacher,
            is_active=True
        ).select_related('classroom', 'subject')

        year = request.query_params.get('year')
        if year:
            assignments = assignments.filter(academic_year=year)

        # Group by classroom for easy frontend rendering
        grouped = {}
        for a in assignments:
            class_key = f"{a.classroom.id}"
            if class_key not in grouped:
                grouped[class_key] = {
                    'classroom': {
                        'id':            a.classroom.id,
                        'name':          a.classroom.name,
                        'section':       a.classroom.section,
                        'academic_year': a.classroom.academic_year,
                    },
                    'subjects': []
                }
            grouped[class_key]['subjects'].append({
                'assignment_id': a.id,
                'subject_id':    a.subject.id,
                'subject_name':  a.subject.name,
                'subject_code':  a.subject.code,
            })

        return Response(list(grouped.values()))