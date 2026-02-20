from django.urls import path
from .views import (
    CreateTeacherView, SetPasswordView,
    TeacherListView,TeacherDetailView,TeacherUpdateView,
    TeacherProfileCompletionView,TeacherProfileView,TeacherEditProfileView,
    CreateStudentView,StudentListView,StudentDetailView,StudentEditView,
    CreateParentView,ParentListView,StudentLookupView,ParentDetailView,ParentStudentLinkView,ParentDashboardView,ParentProfileView,ParentProfileUpdateView,

    
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
    path('school-parents/create/', CreateParentView.as_view()),
    path('school-parents/list/',  ParentListView.as_view()),
    path('school-students/lookup/', StudentLookupView.as_view()),
    path('school-parents/details/<int:pk>/', ParentDetailView.as_view()),
    path('school-parents/<int:pk>/link-students/', ParentStudentLinkView.as_view()),
    path("parent/dashboard/", ParentDashboardView.as_view()),
    path("parent/profile/",        ParentProfileView.as_view()),
    path("parent/profile/update/", ParentProfileUpdateView.as_view()),

]