from django.urls import path
from .views import (
    SubjectListCreateView,
    SubjectDetailView,
    TeachingAssignmentListCreateView,
    TeachingAssignmentDetailView,
    ClassTeachingAssignmentsView,
    TeacherAssignmentsView,
    MyAssignmentsView,
)

urlpatterns = [
    # ── Subjects ──
    path('subjects/',
         SubjectListCreateView.as_view()),

    path('subjects/<int:pk>/',
         SubjectDetailView.as_view()),

    # ── Teaching Assignments ──
    path('teaching-assignments/',
         TeachingAssignmentListCreateView.as_view()),

    path('teaching-assignments/<int:pk>/',
         TeachingAssignmentDetailView.as_view()),

    # Assignments for a specific class
    path('school-classes/<int:class_id>/assignments/',
         ClassTeachingAssignmentsView.as_view()),

    # Assignments for a specific teacher (school/admin view)
    path('teachers/<int:teacher_id>/assignments/',
         TeacherAssignmentsView.as_view()),

    # Assignments for the logged-in teacher (self view)
    path('my-assignments/',
         MyAssignmentsView.as_view()),
]