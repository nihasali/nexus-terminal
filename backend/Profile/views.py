from django.shortcuts import render
from .serializers import CreateTeacherSerializer,SetPasswordSerializer,TeacherListSerializer,TeacherDetailSerializer,UpdateTeacherSerializer,TeacherProfileCompletionSerializer,TeacherProfileEditSerializer
from .models import TeacherProfile,PasswordSetupToken
from Users.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from .utils import send_set_password_email

from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator

from rest_framework.permissions import IsAuthenticated
from Users.authentication import CookieJWTAuthentication
from rest_framework.parsers import MultiPartParser, FormParser
from Users.permissions import IsSchool,IsTeacher

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

            # Update User fields
            if "phone" in data:
                user.phone = data["phone"]

            if "gender" in data:
                user.gender = data["gender"]

            if "DOB" in data:
                user.DOB = data["DOB"]

            if "profile_picture" in data:
                user.profile_picture = data["profile_picture"]

            user.save()

            # Update TeacherProfile fields
            if "qualification" in data:
                profile.qualification = data["qualification"]

            if "years_of_experience" in data:
                profile.years_of_experience = data["years_of_experience"]

            profile.save()

            return Response({"message": "Profile updated successfully"})

        return Response(serializer.errors, status=400)