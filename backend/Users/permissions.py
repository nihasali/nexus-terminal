from rest_framework.permissions import BasePermission

class IsTeacher(BasePermission):
    def has_permission(self,request,view):
        return request.user.is_authenticated and request.user.user_type=='teacher'

class IsSchool(BasePermission):
    def has_permission(self,request,view):
        return request.user.is_authenticated and request.user.user_type=='school'

class IsStudent(BasePermission):
    def has_permission(self,request,view):
        return request.user.is_authenticated and request.user.user_type=='student'

class IsParent(BasePermission):
    def has_permission(self,request,view):
        return request.user.is_authenticated and request.user.user_type=='parent'