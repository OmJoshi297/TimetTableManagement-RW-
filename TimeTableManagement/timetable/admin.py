from django.contrib import admin
from .models import Stream, Faculty, Room, Subject, TimeSlot, TimetableEntry

@admin.register(Stream)
class StreamAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'duration', 'total_semesters']
    search_fields = ['name', 'code']

@admin.register(Faculty)
class FacultyAdmin(admin.ModelAdmin):
    list_display = ['name', 'specialization', 'email']
    search_fields = ['name', 'specialization']

@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ['name', 'room_type', 'capacity']
    list_filter = ['room_type']

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'stream', 'semester', 'credits']
    list_filter = ['stream', 'semester']
    search_fields = ['name', 'code']

@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    list_display = ['display_name', 'start_time', 'end_time']

@admin.register(TimetableEntry)
class TimetableEntryAdmin(admin.ModelAdmin):
    list_display = ['stream', 'semester', 'subject', 'faculty', 'day_of_week', 'time_slot', 'room']
    list_filter = ['stream', 'semester', 'day_of_week', 'class_type']
    search_fields = ['subject__name', 'faculty__name']
