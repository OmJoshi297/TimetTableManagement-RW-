"""college_timetable URL Configuration"""
from django.contrib import admin
from django.urls import path, include
from django.shortcuts import render
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static

def timetable_view(request):
    return render(request, 'timetable.html')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', timetable_view, name='timetable'),
    path('timetable/', include('timetable.urls')),
] + static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])
