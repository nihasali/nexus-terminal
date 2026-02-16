from django.urls import path
from .views import (
    CreateTeacherView, SetPasswordView,
    TeacherListView,TeacherDetailView,TeacherUpdateView,
    TeacherProfileCompletionView,TeacherProfileView,TeacherEditProfileView,
    CreateStudentView,StudentListView,StudentDetailView,StudentEditView
    
)

urlpatterns = [
    path('school-teachers/create/',CreateTeacherView.as_view()),
    path('set-password/',SetPasswordView.as_view()),
    path('school-teachers/list/',TeacherListView.as_view()),
    path('school-teachers/details/<int:pk>/',TeacherDetailView.as_view()),
    path('school-teachers/update/<int:pk>/',TeacherUpdateView.as_view()),
    path('teacher/complete-profile/',TeacherProfileCompletionView.as_view()),
    path('teacher/profile/',TeacherProfileView.as_view()),
    path("teacher/edit-profile/", TeacherEditProfileView.as_view()),
    path("school-students/create/", CreateStudentView.as_view()),
    path("school-students/list/", StudentListView.as_view()),
    path("school-students/details/<int:pk>/", StudentDetailView.as_view()),
    path("school-students/edit/<int:pk>/", StudentEditView.as_view()),

]