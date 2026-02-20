from django.shortcuts import render
from .serializers import (CreateTeacherSerializer,SetPasswordSerializer,TeacherListSerializer,TeacherDetailSerializer,
UpdateTeacherSerializer,TeacherProfileCompletionSerializer,TeacherProfileEditSerializer,
StudentListSerializer,CreateStudentSerializer,StudentDetailSerializer,UpdateStudentSerializer,
CreateParentSerializer,ParentListSerializer,UpdateParentSerializer,ParentStudentLinkSerializer)
from .models import TeacherProfile,PasswordSetupToken,StudentProfile,StudentDocument,ParentProfile
from Users.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from .utils import send_set_password_email,generate_admission_number

from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator

from rest_framework.permissions import IsAuthenticated
from Users.authentication import CookieJWTAuthentication
from rest_framework.parsers import MultiPartParser, FormParser
from Users.permissions import IsSchool,IsTeacher
from django.db import transaction
from django.shortcuts import get_object_or_404

class CreateTeacherView(APIView):
    
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self,request):

        print("REQUEST DATA:", request.data)

        if request.user.user_type != 'school':
            return Response({'error':'Not allowed'},status=403)

        serializer=CreateTeacherSerializer(data=request.data)

        if serializer.is_valid():
            data=serializer.validated_data

            user=User.objects.create(
                fullname=data['fullname'],
                email=data['email'],
                user_type='teacher',
                school=request.user.school,
                is_setup_complete=False
            )

            user.set_unusable_password()
            user.save()

            TeacherProfile.objects.create(
                user=user,
                employee_id=data["employee_id"],
                joining_date=data["joining_date"],
                salary=data["salary"],
                qualification=data["qualification"],
                years_of_experience=data["years_of_experience"]
            )

            send_set_password_email(user)

            return Response({
                'message':'Teacher created and password setup send to email'
            })
        
        return Response(serializer.errors,status=400)


class SetPasswordView(APIView):
    def post(self,request):

        print("SET PASSWORD DATA:", request.data)

        serializer = SetPasswordSerializer(data=request.data)

        if serializer.is_valid():
            token=serializer.validated_data['token']
            password=serializer.validated_data['password']

            try:
                record=PasswordSetupToken.objects.get(
                    token=token,
                    is_used=False,
                )

            except:
                return Response({'error':'invalid link'},status=400)

            user=record.user

            user.set_password(password)
            user.save()

            record.is_used=True
            record.save()

            return Response({'message':'Password Set Successfully'})

        else:
            print("SET PASSWORD ERRORS:", serializer.errors)
            return Response(serializer.errors, status=400)

        return Response(serializer.error,status=400)


class TeacherListView(APIView):
    authentication_classes=[CookieJWTAuthentication]
    permission_classes=[IsAuthenticated]

    def get(self,request):

        if request.user.user_type != 'school':
            return Response({'error':'not allowed'},status=400)

        teacher = TeacherProfile.objects.filter(
            user__school = request.user.school
        )

        serializer = TeacherListSerializer(teacher,many=True)

        return Response(serializer.data)


class TeacherDetailView(APIView):
    authentication_classes=[CookieJWTAuthentication]
    permission_classes=[IsAuthenticated]

    def get(self,request,pk):

        if request.user.user_type != 'school':
            return Response({'error':'not allowed'},status=403)

        try:
            teacher = TeacherProfile.objects.get(
                id=pk,
                user__school=request.user.school
            )

        except TeacherProfile.DoesNotExist:
            return Response({'error':'Teacher not found'},status=404)

        serializer=TeacherDetailSerializer(teacher)

        return Response(serializer.data)


class TeacherUpdateView(APIView):
    authentication_classes=[CookieJWTAuthentication]
    permission_classes=[IsAuthenticated]

    def patch(self,request,pk):
        print("REQUEST DATA:", request.data)
        if request.user.user_type != 'school':
            return Response({'error':'not allowed'},status=400)

        
        try:
            teacher = TeacherProfile.objects.get(
                id=pk,
                user__school=request.user.school
            )
        except TeacherProfile.DoesNotExist:
            return Response({'error':'teacher not found'},status=404)

        serializer = UpdateTeacherSerializer(data=request.data,partial=True)

        if serializer.is_valid():

            data = serializer.validated_data

            user = teacher.user

            if "fullname" in data:
                user.fullname = data["fullname"]

            if "phone" in data:
                user.phone = data["phone"]

            user.save()

            if "employee_id" in data:
                teacher.employee_id = data["employee_id"]

            if "joining_date" in data:
                teacher.joining_date = data["joining_date"]

            if "salary" in data:
                teacher.salary = data["salary"]

            if "qualification" in data:
                teacher.qualification = data["qualification"]

            if "years_of_experience" in data:
                teacher.years_of_experience = data["years_of_experience"]

            teacher.save()

            print("SERIALIZER ERRORS:", serializer.errors)

            return Response({"message": "Teacher updated successfully"})

        return Response(serializer.errors, status=400)


class TeacherProfileView(APIView):
    authentication_classes=[CookieJWTAuthentication]
    permission_classes=[IsTeacher]

    def get(self,request):
        try:
            profile=TeacherProfile.objects.get(user=request.user)

        except TeacherProfile.DoesNotExist:
            return Response({'error':'Profile not found'},status=404)

        data = {
            "fullname": request.user.fullname,
            "email": request.user.email,
            "phone": request.user.phone,
            "employee_id": profile.employee_id,
            "qualification": profile.qualification,
            "years_of_experience": profile.years_of_experience,
            "salary": profile.salary,
            "joining_date": profile.joining_date,
            "is_profile_complete": request.user.is_setup_complete,
            'profile_picture':request.user.profile_picture.url if request.user.profile_picture else None,
            'gender':request.user.gender,
            'DOB':request.user.DOB
        }

        return Response(data)


class TeacherProfileCompletionView(APIView):

    authentication_classes=[CookieJWTAuthentication]
    permission_classes = [IsTeacher]
    parser_classes = (MultiPartParser,FormParser)

    def patch(self,request):

        serializer = TeacherProfileCompletionSerializer(data=request.data,partial=True)

        if serializer.is_valid():

            data = serializer.validated_data
            user = request.user

            if 'phone' in data:
                user.phone=data['phone']

            if 'gender' in data:
                user.gender = data['gender']

            if 'DOB' in data:
                user.DOB = data['DOB']

            if 'profile_picture' in data:
                user.profile_picture = data['profile_picture']

            user.is_setup_complete = True
            user.save()

            profile = TeacherProfile.objects.get(user=user)

            if 'qualification' in data:
                profile.qualification = data['qualification']

            if 'years_of_experience' in data:
                profile.years_of_experience = data['years_of_experience']

            profile.save()

            return Response({'message':'Profile updated successfully'})

        return Response(serializer.errors,status=400)



class TeacherEditProfileView(APIView):

    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get(self, request):

        if request.user.user_type != "teacher":
            return Response({"error": "Not allowed"}, status=403)

        profile = TeacherProfile.objects.get(user=request.user)

        return Response({
            "email": request.user.email,
            "fullname": request.user.fullname,
            "phone": request.user.phone,
            "gender": request.user.gender,
            "DOB": request.user.DOB,
            "profile_picture": request.user.profile_picture.url if request.user.profile_picture else None,
            "qualification": profile.qualification,
            "years_of_experience": profile.years_of_experience,
            "employee_id": profile.employee_id,
            "salary": profile.salary,
        })

    def patch(self, request):

        if request.user.user_type != "teacher":
            return Response({"error": "Not allowed"}, status=403)

        serializer = TeacherProfileEditSerializer(
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            data = serializer.validated_data
            user = request.user
            profile = TeacherProfile.objects.get(user=user)
        
            if "phone" in data:
                user.phone = data["phone"]

            if "gender" in data:
                user.gender = data["gender"]

            if "DOB" in data:
                user.DOB = data["DOB"]

            if "profile_picture" in data:
                user.profile_picture = data["profile_picture"]

            user.save()

            if "qualification" in data:
                profile.qualification = data["qualification"]

            if "years_of_experience" in data:
                profile.years_of_experience = data["years_of_experience"]

            profile.save()

            return Response({"message": "Profile updated successfully"})

        return Response(serializer.errors, status=400)



class CreateStudentView(APIView):
    authentication_classes=[CookieJWTAuthentication]
    permission_classes=[IsSchool]
    parser_classes=(MultiPartParser,FormParser)

    def post(self,request):

        serializer=CreateStudentSerializer(data=request.data)

        if serializer.is_valid():

            data = serializer.validated_data

            school = request.user.school

            admission_number = generate_admission_number(school)

            with transaction.atomic():

                user=User.objects.create(
                    fullname=data['fullname'],
                    email=data['email'],
                    phone=data.get('phone'),
                    gender=data['gender'],
                    DOB=data['DOB'],
                    user_type='student',
                    school=school,
                    is_setup_complete=False

                )

                user.set_unusable_password()
                user.save()

                student=StudentProfile.objects.create(
                    user=user,
                    admission_number=admission_number,
                    roll_number=data["roll_number"],
                    date_of_joining=data["date_of_joining"],
                    blood_group=data.get("blood_group"),
                    guardian_name=data["guardian_name"],
                    guardian_phone=data["guardian_phone"],
                    address=data.get("address"),
                    student_contact=data.get("student_contact"),
                )

                student.save()

                documents = request.FILES.getlist('documents')

                for doc in documents:
                    StudentDocument.objects.create(
                        student=student,
                        file=doc,
                        document_type='id_proof'
                    )

            send_set_password_email(user)

            return Response({
                "message": "Student created successfully",
                "admission_number": admission_number
            })

        return Response(serializer.errors, status=400)



class StudentListView(APIView):
    authentication_classes=[CookieJWTAuthentication]
    permission_classes=[IsSchool]

    def get(self,request):
        school=request.user.school

        students = StudentProfile.objects.filter(
            user__school=school
        ).select_related('user').order_by('-created_at')

        serializer=StudentListSerializer(students,many=True)

        return Response(serializer.data)



class StudentDetailView(APIView):

    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsSchool]

    def get(self, request, pk):

        school = request.user.school

        student = get_object_or_404(
            StudentProfile.objects.select_related("user"),
            pk=pk,
            user__school=school
        )

        serializer = StudentDetailSerializer(student)

        return Response(serializer.data)


class StudentEditView(APIView):
    authentication_classes=[CookieJWTAuthentication]
    permission_classes=[IsSchool]
    parser_classes=(MultiPartParser,FormParser)

    def get(self,request,pk):
        school = request.user.school

        student = get_object_or_404(
            StudentProfile.objects.select_related('user'),
            pk=pk,
            user__school=school
        )
        serializer = UpdateStudentSerializer(student)

        return Response(serializer.data)

    
    def patch(self,request,pk):

        school = request.user.school

        student = get_object_or_404(
            StudentProfile.objects.select_related('user'),
            pk=pk,
            user__school=school
        )

        serializer = UpdateStudentSerializer(
            student,
            data = request.data,
            partial = True
        )

        if serializer.is_valid():
            serializer.save()

            delete_ids = request.data.getlist('delete_documents')
            if delete_ids:
                StudentDocument.objects.filter(
                    id__in=delete_ids,student=student
                ).delete()

            new_docs = request.FILES.getlist('documents')
            for doc in new_docs:
                StudentDocument.objects.create(
                    student=student,
                    file = doc,
                    document_type='id_proof'

                )

            return Response({'message':'Student updated successfully'})

        return Response(serializer.errors,status=400)


class CreateParentView(APIView):

    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsSchool]

    def post(self,request):
        serializer = CreateParentSerializer(data=request.data)

        if serializer.is_valid():
            data = serializer.validated_data
            school = request.user.school

            admission_numbers=data.get('admission_numbers',[])

            if admission_numbers:
                students = StudentProfile.objects.filter(
                    admission_number__in = admission_numbers,
                    user__school = school
                )

                found = set(students.values_list('admission_number',flat= True))
                invalid = set(admission_numbers)-found

                if invalid:
                    return Response(
                        {'error': f'Students not found: {", ".join(invalid)}'},
                        status=400
                    )

            with transaction.atomic():
                user = User.objects.create(
                    fullname=data['fullname'],
                    email     = data['email'],
                    phone     = data.get('phone'),
                    gender    = data.get('gender'),
                    DOB       = data.get('DOB'),
                    user_type = 'parent',
                    school    = school,
                    is_setup_complete = False
                )

                user.set_unusable_password()
                user.save()

                parent = ParentProfile.objects.create(
                    user = user,
                    occupation = data.get('occupation'),
                    relation = data.get('relation')
                )

                if admission_numbers:
                    parent.students.set(students)

            send_set_password_email(user)

            return Response({'message':'Parent created succesfully'},status=201)

        return Response(serializers.errors,status=400)


class ParentListView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes     = [IsSchool]

    def get(self, request):
        school  = request.user.school
        parents = ParentProfile.objects.filter(
            user__school=school
        ).select_related('user').prefetch_related('students__user')

        serializer = ParentListSerializer(parents, many=True)
        return Response(serializer.data)


class StudentLookupView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsSchool]

    def get(self, request):
        num = request.query_params.get("admission_number")
        student = get_object_or_404(
            StudentProfile, admission_number=num, user__school=request.user.school
        )
        return Response({
            "admission_number": student.admission_number,
            "fullname": student.user.fullname,
        })



class ParentDetailView(APIView):
    authentication_classes=[CookieJWTAuthentication]
    permission_classes = [IsSchool]

    def get(self,request,pk):
        
        school = request.user.school

        parent = get_object_or_404(
            ParentProfile.objects.select_related('user').prefetch_related('students__user'),
            pk = pk,
            user__school = school
        )

        serializer = ParentListSerializer(parent)
        return Response(serializer.data)


    def patch(self,request,pk):

        school = request.user.school
        parent = get_object_or_404(ParentProfile,pk=pk,user__school=school)

        serializer = UpdateParentSerializer(data=request.data,partial=True)

        if serializer.is_valid():
            data = serializer.validated_data

            for field in ['fullname','phone','gender','DOB']:
                if field in data:
                    setattr(parent.user,field,data[field])

            parent.user.save()

            for field in ['occupation','relation']:
                if field in data:
                    setattr(parent,field,data[field])

            parent.save()

            return Response({'message':'Updated Profile Successfully'})

        return Response(serializer.errors,status=400)


    def delete(self,request,pk):
        school = request.user.school
        parent = get_object_or_404(ParentProfile,pk=pk,user__school=school)
        parent.user.delete()
        return Response({'message':'Parent Deleted successfully'})



class ParentStudentLinkView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes=[IsSchool]

    def post(self,request,pk):
        school = request.user.school
        parent = get_object_or_404(ParentProfile,pk=pk,user__school=school)

        serializer = ParentStudentLinkSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors,status=400)

        admission_numbers = serializer.validated_data['admission_numbers']

        students = StudentProfile.objects.filter(
            admission_number__in = admission_numbers,
            user__school = school
        )

        found = set(students.values_list('admission_number',flat = True))
        invalid = set(admission_numbers)-found
        if invalid:
            return Response(
                {'error': f'Students not found: {", ".join(invalid)}'},
                status=400
            )

        already_linked = set(
            parent.students.filter(
                admission_number__in = admission_numbers
            ).values_list('admission_number',flat = True)
        )

        if already_linked:
            return Response(
                {'error': f'Already linked to this parent: {", ".join(already_linked)}'},
                status=400
            )

        parent.students.add(*students)

        return Response({
            'message':  f'{students.count()} student(s) linked successfully',
            'linked':   list(found),
        })

    def delete(self,request,pk):

        school = request.user.school
        parent = get_object_or_404(ParentProfile, pk=pk, user__school=school)

        serializer = ParentStudentLinkSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        admission_numbers = serializer.validated_data['admission_numbers']

        students = StudentProfile.objects.filter(
            admission_number__in=admission_numbers,
            user__school=school
        )

        parent.students.remove(*students)

        return Response({
            'message': f'{students.count()} student(s) unlinked successfully'
        })



class ParentDashboardView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        parent = request.user.parent_profile
        return Response({
            "children": [
                { "id": s.id, "fullname": s.user.fullname }
                for s in parent.students.select_related("user").all()
            ],
            "announcements": []
        })


class ParentProfileView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        parent = request.user.parent_profile
        students = parent.students.select_related("user").all()
        return Response({
            "fullname":   request.user.fullname,
            "email":      request.user.email,
            "phone":      request.user.phone,
            "gender":     request.user.gender,
            "DOB":        request.user.DOB,
            "profile_picture": request.user.profile_picture.url if request.user.profile_picture else None,
            "occupation": parent.occupation,
            "relation":   parent.relation,
            "students": [
                { "id": s.id, "fullname": s.user.fullname, "admission_number": s.admission_number }
                for s in students
            ],
        })


class ParentProfileUpdateView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def patch(self,request):
        user = request.user

        if 'profile_picture' in request.FILES:
            user.profile_picture = request.FILES['profile_picture']
            user.save()

        return Response({'profile_picture':user.profile_picture.url if user.profile_picture else None})



