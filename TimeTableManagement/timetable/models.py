from django.db import models

class Stream(models.Model):
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)
    duration = models.CharField(max_length=20)
    total_semesters = models.IntegerField()
    description = models.TextField()
    
    def __str__(self):
        return f"{self.name} ({self.code})"

class Faculty(models.Model):
    name = models.CharField(max_length=100)
    specialization = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=15, blank=True)
    
    class Meta:
        verbose_name_plural = "Faculties"
    
    def __str__(self):
        return self.name

class Room(models.Model):
    name = models.CharField(max_length=50)
    capacity = models.IntegerField(default=0)
    room_type = models.CharField(max_length=20, choices=[
        ('Classroom', 'Classroom'),
        ('Lab', 'Lab'),
        ('Auditorium', 'Auditorium'),
        ('Seminar Hall', 'Seminar Hall'),
    ], default='Classroom')
    
    def __str__(self):
        return self.name

class Subject(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    credits = models.IntegerField(default=3)
    stream = models.ForeignKey(Stream, on_delete=models.CASCADE)
    semester = models.IntegerField()
    
    def __str__(self):
        return f"{self.name} ({self.code})"

class TimeSlot(models.Model):
    start_time = models.TimeField()
    end_time = models.TimeField()
    display_name = models.CharField(max_length=30)
    
    def __str__(self):
        return self.display_name

class TimetableEntry(models.Model):
    DAYS_OF_WEEK = [
        ('Monday', 'Monday'),
        ('Tuesday', 'Tuesday'),
        ('Wednesday', 'Wednesday'),
        ('Thursday', 'Thursday'),
        ('Friday', 'Friday'),
        ('Saturday', 'Saturday'),
    ]
    
    CLASS_TYPES = [
        ('Lecture', 'Lecture'),
        ('Lab', 'Lab'),
        ('Tutorial', 'Tutorial'),
        ('Seminar', 'Seminar'),
    ]
    
    stream = models.ForeignKey(Stream, on_delete=models.CASCADE)
    semester = models.IntegerField()
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    day_of_week = models.CharField(max_length=10, choices=DAYS_OF_WEEK)
    time_slot = models.ForeignKey(TimeSlot, on_delete=models.CASCADE)
    class_type = models.CharField(max_length=10, choices=CLASS_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['stream', 'semester', 'day_of_week', 'time_slot']
        verbose_name = "Timetable Entry"
        verbose_name_plural = "Timetable Entries"
    
    def __str__(self):
        return f"{self.stream.code} Sem{self.semester} - {self.subject.name} - {self.day_of_week} {self.time_slot}"
