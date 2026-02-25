from django.urls import path
from .views import (
    CreateClassRoomListCreateView,
    ClassRoomDetailView,
    ClassRoomAssignStudentsView,
    ClassRoomAssignTeacherView,
    UnassignedStudentsView,
    AvailableTeachersView,
    AcademicYearsView,
)

urlpatterns = [
    # Class CRUD
    path('school-classes/',
         CreateClassRoomListCreateView.as_view()),

    path('school-classes/<int:pk>/',
         ClassRoomDetailView.as_view()),

    # Assign / remove students (POST = add, DELETE = remove)
    path('school-classes/<int:pk>/assign-students/',
         ClassRoomAssignStudentsView.as_view()),

    # Assign / change / remove class teacher
    path('school-classes/<int:pk>/assign-teacher/',
         ClassRoomAssignTeacherView.as_view()),

    # Dropdown helpers
    path('school-students/unassigned/',
         UnassignedStudentsView.as_view()),

    path('school-teachers/available/',
         AvailableTeachersView.as_view()),

    path('school-classes/academic-years/',
         AcademicYearsView.as_view()),
]