from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import SchoolSignupOTPSerializer, VerifyOTPSerializer,LoginSerializer,ForgotPasswordSerializer,ResetPasswordSerializer
from .models import OTPVerification, User,School,PasswordResetToken
from Profile.models import TeacherProfile
from .utils import send_otp_email,send_password_reset_email

from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

from rest_framework.permissions import IsAuthenticated
from .authentication import CookieJWTAuthentication

from django.utils.text import slugify
import uuid

from .permissions import IsTeacher,IsSchool

class SchoolSignupRequestView(APIView):
    def post(self,request):
        serializer = SchoolSignupOTPSerializer(data = request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']

            if User.objects.filter(email=email).exists():
                return Response(
                    {'error':'Email is registered'},
                    status = status.HTTP_400_BAD_REQUEST
                )
            
            otp = OTPVerification.generate_otp()

            OTPVerification.objects.create(
                email=email,
                otp=otp
            )

            send_otp_email(email,otp)

            request.session['signup_data']=serializer.validated_data

            return Response(
                {'message': 'OTP sent to email'}
            )
        
        return Response(serializer.errors, status=400)


class SignupOtpVerifyView(APIView):
    def post(self,request):
        serializer = VerifyOTPSerializer(data=request.data)

        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp = serializer.validated_data['otp']

            try:
                otp_record = OTPVerification.objects.filter(email=email).last()

                if not otp_record:
                    return Response({'error':'OTP not found'},status=400)

                if not otp_record.is_valid():
                    return Response({'error':'OTP expired'},status=400)

                if otp_record.otp != otp:
                    return Response({'error':'Invalid OTP'},status=400)

                signup_data = request.session.get('signup_data')
                print("SESSION DATA:", request.session.get('signup_data'))

                if not signup_data:
                    return Response({'error':'session expired'},status = 400)

                school = School.objects.create(
                    name=signup_data['fullname'],
                    email=signup_data['email'],
                    tenant_id = slugify(signup_data['fullname']) + "-" + str(uuid.uuid4())[:6]
                )

                user = User.objects.create_user(
                    email = signup_data['email'],
                    password = signup_data['password'],
                    fullname = signup_data['fullname'],
                    user_type = 'school',
                    school=school
                )
                user.save()
                otp_record.delete()

                return Response({'message':'Your account created succesfully'})
                

            except Exception as e:
                return Response({"error": str(e)}, status=400)
            
        return Response(serializer.errors,status=400)


class LoginView(APIView):
    def post(self,request):
        serializer = LoginSerializer(data = request.data)

        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']

            user = authenticate(email=email,password=password)

            if user is not None:
                refresh = RefreshToken.for_user(user)
                access_token = refresh.access_token

                response = Response()

                response.set_cookie(
                    key='access_token',
                    value=str(refresh.access_token),
                    httponly=True,
                    samesite='LAX'
                )
                response.set_cookie(
                    key='refresh_token',
                    value=str(refresh),
                    httponly=True,
                    samesite='LAX'
                )

                response.data={
                    'message':'Login successful',
                    'user':{
                        'email':user.email,
                        'fullname':user.fullname,
                        'user_type':user.user_type,
                        'is_setup_complete':user.is_setup_complete,
                    }
                }

                return response

            return Response(
                {'error':'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)


class SchoolLogout(APIView):
    def post(self,request):
        response = Response()
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        print('haiiiiiiiiiiiiiiiiiiiiii')
        response.data={'message':'logout successful'}
        return response



class CurrentUserView(APIView):
    authentication_classes=[CookieJWTAuthentication]
    permission_classes=[IsAuthenticated]

    def get(self,request):
        user=request.user

        return Response({
            'email':user.email,
            'fullname':user.fullname,
            'user_type':user.user_type,
            "is_setup_complete": request.user.is_setup_complete,
        })



class RefreshTokenView(APIView):

    def post(self, request):

        refresh_token = request.COOKIES.get('refresh_token')

        if not refresh_token:
            return Response({"error": "No refresh token"}, status=401)

        try:
            token = RefreshToken(refresh_token)
            access_token = token.access_token

            response = Response()

            response.set_cookie(
                key='access_token',
                value=str(access_token),
                httponly=True,
                samesite='Lax'
            )

            response.data = {"message": "Token refreshed"}

            return response

        except Exception:
            return Response({"error": "Invalid refresh token"}, status=401)



class ForgotPasswordView(APIView):
    authentication_classes=[]
    permission_classes = []

    def post(self,request):

        serializer = ForgotPasswordSerializer(data = request.data)

        if serializer.is_valid():
            email = serializer.validated_data['email']

            try:
                user = User.objects.get(email=email)

                PasswordResetToken.objects.filter(user=user,is_used=False).delete()

                send_password_reset_email(user)

            except User.DoesNotExist:
                pass

        return Response({'message':'If this email is registered.Password reset link has been sent'})


class ValidateResetTokenView(APIView):
    authentication_classes=[]
    permission_classes = []

    def get(self,request,token):

        try:
            reset_token = PasswordResetToken.objects.get(token=token)
            if reset_token.is_valid():
                return Response({'valid':True})

            return Response({'error':'Token expired'},status=400)

        except PasswordResetToken.DoesNotExist:
            return Response({'error':'Invalid token'},status=400)



class ResetPasswordView(APIView):
    authentication_classes=[]
    permission_classes = []

    def post(self,request):

        serializer = ResetPasswordSerializer(data=request.data)

        if serializer.is_valid():
            
            token = serializer.validated_data['token']
            password = serializer.validated_data['password']

            try:
                reset_token = PasswordResetToken.objects.get(token=token)

                if not reset_token.is_valid():
                    return Response({'error':'Token has expired or already used'},status=400)

                user = reset_token.user
                user.set_password(password)
                user.save()

                reset_token.is_used=True
                reset_token.save()

                return Response({'message':'Password reset successfully.'})


            except PasswordResetToken.DoesNotExist:
                return Response({'error':'Invalid reset token.'},status=400)

        
        return Response(serializers.errors,status=400)