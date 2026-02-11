from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import SchoolSignupOTPSerializer, VerifyOTPSerializer,LoginSerializer
from .models import OTPVerification, User,School
from .utils import send_otp_email

from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

from rest_framework.permissions import IsAuthenticated
from .authentication import CookieJWTAuthentication

from django.utils.text import slugify
import uuid

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

            if user is not None and user.user_type=='school':
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
                        'user_type':user.user_type
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
            'user_type':user.user_type
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
