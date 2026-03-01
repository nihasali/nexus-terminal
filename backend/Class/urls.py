from django.urls import path
from .views import (
    CreateClassRoomListCreateView,
    ClassRoomDetailView,
    ClassRoomAssignStudentsView,
    ClassRoomAssignTeacherView,
    UnassignedStudentsView,
    AvailableTeachersView,
    AcademicYearsView,
#     StudentAcademicHistoryView,
#     CurrentAcademicRecordView,
#     ClassAcademicRecordsView,
#     UpdateAcademicRecordView,
#     PromoteStudentsView,

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

#     # Full academic history for a student (all years)
#     path('students/<int:student_id>/academic-history/',
#          StudentAcademicHistoryView.as_view()),

#     # Current active record for a student
#     path('students/<int:student_id>/current-record/',
#          CurrentAcademicRecordView.as_view()),

#     # All current records for a class (attendance / marks sheet)
#     path('school-classes/<int:class_id>/academic-records/',
#          ClassAcademicRecordsView.as_view()),

#     # Update roll number / remarks on a specific record
#     path('academic-records/<int:record_id>/',
#          UpdateAcademicRecordView.as_view()),

#     # Promote students from one class to another
#     path('school-classes/<int:class_id>/promote/',
#          PromoteStudentsView.as_view()), 
]