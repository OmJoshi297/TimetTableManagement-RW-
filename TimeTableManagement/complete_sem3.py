import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'college_timetable.settings')
django.setup()

from timetable.models import Stream, Faculty, Room, Subject, TimeSlot, TimetableEntry

def complete_semester_3():
    # Get MSc AI/ML stream
    msc_aiml = Stream.objects.get(code='MSC_AI_ML')
    
    # Get faculty from Semester 1 for consistency
    sem1_faculty = list(Faculty.objects.filter(
        timetableentry__stream=msc_aiml,
        timetableentry__semester=1
    ).distinct())
    
    # Get existing subjects and create new ones for Sem 3
    subjects_data = [
        'Deep Learning', 'Computer Vision', 'Natural Language Processing',
        'Machine Learning Algorithms', 'Data Mining', 'Neural Networks',
        'AI Ethics', 'Reinforcement Learning', 'Big Data Analytics',
        'Pattern Recognition', 'Robotics', 'Expert Systems', 'BREAK'
    ]
    
    subjects = {}
    for subject_name in subjects_data:
        subject, created = Subject.objects.get_or_create(
            name=subject_name,
            stream=msc_aiml,
            semester=3,
            defaults={'credits': 3 if subject_name != 'BREAK' else 0}
        )
        subjects[subject_name] = subject
    
    # Get rooms
    rooms = list(Room.objects.all())
    
    # Get time slots
    time_slots = {
        '9:00 AM - 11:00 AM': TimeSlot.objects.get(display_name='9:00 AM - 11:00 AM'),
        '11:00 AM - 12:00 PM': TimeSlot.objects.get(display_name='11:00 AM - 12:00 PM'),
        '12:00 PM - 1:00 PM': TimeSlot.objects.get(display_name='12:00 PM - 1:00 PM'),
        '1:00 PM - 2:00 PM': TimeSlot.objects.get(display_name='1:00 PM - 2:00 PM'),
        '2:00 PM - 3:00 PM': TimeSlot.objects.get(display_name='2:00 PM - 3:00 PM'),
        '3:00 PM - 4:00 PM': TimeSlot.objects.get(display_name='3:00 PM - 4:00 PM')
    }
    
    # Complete schedule for Wednesday, Thursday, Friday
    schedule = {
        'Wednesday': [
            ('9:00 AM - 11:00 AM', 'Neural Networks', 'Lecture'),
            ('11:00 AM - 12:00 PM', 'AI Ethics', 'Lecture'),
            ('12:00 PM - 1:00 PM', 'Reinforcement Learning', 'Tutorial'),
            ('1:00 PM - 2:00 PM', 'BREAK', 'Tutorial'),
            ('2:00 PM - 3:00 PM', 'Big Data Analytics', 'Lab'),
            ('3:00 PM - 4:00 PM', 'Pattern Recognition', 'Lab')
        ],
        'Thursday': [
            ('9:00 AM - 11:00 AM', 'Robotics', 'Lecture'),
            ('11:00 AM - 12:00 PM', 'Expert Systems', 'Lecture'),
            ('12:00 PM - 1:00 PM', 'Deep Learning', 'Tutorial'),
            ('1:00 PM - 2:00 PM', 'BREAK', 'Tutorial'),
            ('2:00 PM - 3:00 PM', 'Computer Vision', 'Lab'),
            ('3:00 PM - 4:00 PM', 'Natural Language Processing', 'Lab')
        ],
        'Friday': [
            ('9:00 AM - 11:00 AM', 'Machine Learning Algorithms', 'Lecture'),
            ('11:00 AM - 12:00 PM', 'Data Mining', 'Lecture'),
            ('12:00 PM - 1:00 PM', 'Neural Networks', 'Tutorial'),
            ('1:00 PM - 2:00 PM', 'BREAK', 'Tutorial'),
            ('2:00 PM - 3:00 PM', 'AI Ethics', 'Seminar'),
            ('3:00 PM - 4:00 PM', 'Reinforcement Learning', 'Lab')
        ]
    }
    
    # Get break faculty and room
    break_faculty = Faculty.objects.get(name='')
    break_room = Room.objects.get(name='')
    
    created_count = 0
    for day, classes in schedule.items():
        for time_str, subject_name, class_type in classes:
            # Skip if entry already exists
            if TimetableEntry.objects.filter(
                stream=msc_aiml, semester=3, day_of_week=day,
                time_slot=time_slots[time_str]
            ).exists():
                continue
                
            if subject_name == 'BREAK':
                faculty = break_faculty
                room = break_room
            else:
                faculty = sem1_faculty[created_count % len(sem1_faculty)]
                room = rooms[created_count % len(rooms)]
            
            TimetableEntry.objects.create(
                stream=msc_aiml,
                semester=3,
                subject=subjects[subject_name],
                faculty=faculty,
                room=room,
                day_of_week=day,
                time_slot=time_slots[time_str],
                class_type=class_type
            )
            created_count += 1
    
    print(f"Created {created_count} new entries for Semester 3")
    
    # Show final count
    total = TimetableEntry.objects.filter(stream=msc_aiml, semester=3).count()
    print(f"Total Semester 3 entries: {total}")
    
    for day in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']:
        count = TimetableEntry.objects.filter(
            stream=msc_aiml, semester=3, day_of_week=day
        ).count()
        print(f"{day}: {count} classes")

if __name__ == '__main__':
    complete_semester_3()
