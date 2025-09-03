from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout as auth_logout
from .models import Stream, Faculty, Room, Subject, TimeSlot, TimetableEntry
import json

@login_required(login_url='accounts:login')
def timetable_view(request):
    return render(request, 'timetable.html')

@login_required(login_url='accounts:login')
def get_timetable_data(request):
    stream_code = request.GET.get('stream')
    semester = request.GET.get('semester')
    
    if not stream_code or not semester:
        return JsonResponse({'error': 'Stream and semester required'}, status=400)
    
    try:
        stream = Stream.objects.get(code=stream_code)
        entries = TimetableEntry.objects.filter(
            stream=stream,
            semester=int(semester)
        ).select_related('subject', 'faculty', 'room', 'time_slot')
        
        timetable_data = {}
        for entry in entries:
            key = f"{entry.day_of_week}-{entry.time_slot.display_name}"
            timetable_data[key] = {
                'subjectName': entry.subject.name,
                'facultyName': entry.faculty.name,
                'classType': entry.class_type,
                'room': entry.room.name,
                'day': entry.day_of_week,
                'timeSlot': entry.time_slot.display_name
            }
        
        return JsonResponse(timetable_data)
    
    except Stream.DoesNotExist:
        return JsonResponse({'error': 'Stream not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@login_required(login_url='accounts:login')
def get_streams(request):
    streams = Stream.objects.all()
    stream_data = {}
    for stream in streams:
        stream_data[stream.code] = {
            'name': stream.name,
            'duration': stream.duration,
            'totalSemesters': stream.total_semesters,
            'description': stream.description
        }
    return JsonResponse(stream_data)

@login_required(login_url='accounts:login')
def get_faculty(request):
    faculty = Faculty.objects.all()
    faculty_data = {}
    for f in faculty:
        faculty_data[f.name] = f.specialization
    return JsonResponse(faculty_data)

@csrf_exempt
@login_required(login_url='accounts:login')
@require_http_methods(["POST"])
def save_timetable_entry(request):
    try:
        data = json.loads(request.body)
        
        stream = Stream.objects.get(code=data['stream'])
        subject = Subject.objects.get(name=data['subjectName'], stream=stream, semester=data['semester'])
        faculty = Faculty.objects.get(name=data['facultyName'])
        room = Room.objects.get(name=data['room'])
        time_slot = TimeSlot.objects.get(display_name=data['timeSlot'])
        
        # Check if entry already exists
        existing_entry = TimetableEntry.objects.filter(
            stream=stream,
            semester=data['semester'],
            day_of_week=data['day'],
            time_slot=time_slot
        ).first()
        
        if existing_entry:
            # Update existing entry
            existing_entry.subject = subject
            existing_entry.faculty = faculty
            existing_entry.room = room
            existing_entry.class_type = data['classType']
            existing_entry.save()
        else:
            # Create new entry
            TimetableEntry.objects.create(
                stream=stream,
                semester=data['semester'],
                subject=subject,
                faculty=faculty,
                room=room,
                day_of_week=data['day'],
                time_slot=time_slot,
                class_type=data['classType']
            )
        
        return JsonResponse({'success': True})
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@login_required(login_url='accounts:login')
@require_http_methods(["DELETE", "POST"])
def delete_timetable_entry(request):
    try:
        data = json.loads(request.body)
        
        stream = Stream.objects.get(code=data['stream'])
        time_slot = TimeSlot.objects.get(display_name=data['timeSlot'])
        
        TimetableEntry.objects.filter(
            stream=stream,
            semester=data['semester'],
            day_of_week=data['day'],
            time_slot=time_slot
        ).delete()
        
        return JsonResponse({'success': True})
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
