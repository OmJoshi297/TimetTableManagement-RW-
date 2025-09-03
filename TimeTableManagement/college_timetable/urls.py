"""college_timetable URL Configuration"""
from django.contrib import admin
from django.urls import path, include
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import views as auth_views, login
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView
from django.http import HttpResponseRedirect
from accounts import views as accounts_views

def redirect_to_login(request):
    if request.user.is_authenticated:
        return HttpResponseRedirect('/timetable/')
    return HttpResponseRedirect('/accounts/login/')

@login_required(login_url='accounts:login')
def timetable_view(request):
    return render(request, 'timetable.html')

# Define the URL patterns for accounts
class CustomLoginView(auth_views.LoginView):
    template_name = 'registration/login.html'
    
    def form_valid(self, form):
        remember_me = self.request.POST.get('remember_me', False)
        if not remember_me:
            # Set session to expire when browser is closed if 'Remember me' is not checked
            self.request.session.set_expiry(0)
        else:
            # Set session to expire in 2 weeks (Django default) if 'Remember me' is checked
            self.request.session.set_expiry(60 * 60 * 24 * 14)  # 2 weeks in seconds
        return super().form_valid(form)

def custom_login(request, *args, **kwargs):
    return CustomLoginView.as_view()(request, *args, **kwargs)

accounts_patterns = ([    
    path('login/', custom_login, name='login'),
    path('logout/', auth_views.LogoutView.as_view(next_page='accounts:login'), name='logout'),
    path('register/', accounts_views.register, name='register'),
], 'accounts')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', redirect_to_login),
    path('timetable/', login_required(timetable_view, login_url='accounts:login'), name='timetable'),
    path('timetable/', include('timetable.urls')),
    path('accounts/', include(accounts_patterns)),
] + static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])
