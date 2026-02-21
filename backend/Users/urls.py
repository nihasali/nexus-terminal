from django.urls import path
from .views import (
    SchoolSignupRequestView,
    SignupOtpVerifyView,
    LoginView,
    SchoolLogout,
    CurrentUserView,
    RefreshTokenView,
    ForgotPasswordView,
    ValidateResetTokenView,
    ResetPasswordView

)

urlpatterns = [
    path('signup/', SchoolSignupRequestView.as_view()),
    path('verify-otp/', SignupOtpVerifyView.as_view()),
    path('login/', LoginView.as_view()),
    path('logout/', SchoolLogout.as_view()),
    path('current-user/', CurrentUserView.as_view()),
    path('refresh-token/', RefreshTokenView.as_view()),
    path('forgot-password/', ForgotPasswordView.as_view()),
    path('reset-password/validate/<str:token>/', ValidateResetTokenView.as_view()),
    path('reset-password/', ResetPasswordView.as_view())
]