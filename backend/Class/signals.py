# from django.db.models.signals import post_save
# from django.dispatch import receiver
# from Profile.models import StudentProfile
# from .models import ClassRoom,StudentAcademicRecord
# # from django.shortcuts import get_or_create

# @receiver(post_save, sender=StudentProfile)
# def create_academic_record_on_classroom_assignment(sender,instance,**kwargs):

#     if instance.classroom is None:
#         return

#     academic_year = instance.classroom.academic_year


#     record,created = StudentAcademicRecord.objects.get_or_create(
#         student = instance,
#         academic_year = academic_year,
#         default = {
#             'classroom':instance.classroom,
#             'is_current': True
#         }
#     )

#     # If record already existed but classroom changed (e.g. section transfer),
#     # update the classroom on the record too. 

#     if not created and record.classroom != instance.classroom:
#         record.classroom = instance.classroom
#         record.save()