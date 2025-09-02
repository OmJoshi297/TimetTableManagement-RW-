from django.urls import path
from . import views

urlpatterns = [
    path('api/timetable/', views.get_timetable_data, name='get_timetable_data'),
    path('api/streams/', views.get_streams, name='get_streams'),
    path('api/faculty/', views.get_faculty, name='get_faculty'),
    path('api/save/', views.save_timetable_entry, name='save_timetable_entry'),
    path('api/delete/', views.delete_timetable_entry, name='delete_timetable_entry'),
]
