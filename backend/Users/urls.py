from django.urls import path
from .views import (
    SchoolSignupRequestView,
    SignupOtpVerifyView,
    LoginView,
    SchoolLogout,
    CurrentUserView,
    RefreshTokenView
)

urlpatterns = [
    path('signup/', SchoolSignupRequestView.as_view()),
    path('verify-otp/', SignupOtpVerifyView.as_view()),
    path('login/', LoginView.as_view()),
    path('logout/', SchoolLogout.as_view()),
    path('current-user/', CurrentUserView.as_view()),
    path('refresh-token/', RefreshTokenView.as_view()),
]