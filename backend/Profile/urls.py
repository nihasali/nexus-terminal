from django.urls import path
from .views import (
    CreateTeacherView, SetPasswordView,
    TeacherListView,TeacherDetailView,TeacherUpdateView
    
)

urlpatterns = [
    path('school-teachers/create/',CreateTeacherView.as_view()),
    path('set-password/',SetPasswordView.as_view()),
    path('school-teachers/list/',TeacherListView.as_view()),
    path('school-teachers/details/<int:pk>/',TeacherDetailView.as_view()),
    path('school-teachers/update/<int:pk>/',TeacherUpdateView.as_view())
]