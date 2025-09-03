from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import login as auth_login, logout as auth_logout
from django.contrib.auth.decorators import login_required

def login(request):
    if request.method == 'POST':
        form = AuthenticationForm(data=request.POST)
        if form.is_valid():
            user = form.get_user()
            auth_login(request, user)
            
            # Set session expiry based on 'Remember me' checkbox
            remember_me = request.POST.get('remember_me') == '1'  # Changed from 'on' to '1'
            if not remember_me:
                # Session expires when browser is closed if 'Remember me' is not checked
                request.session.set_expiry(0)
            else:
                # Session expires in 2 weeks if 'Remember me' is checked
                request.session.set_expiry(1209600)  # 2 weeks in seconds
            
            messages.success(request, 'Login successful')
            
            # Create response with remember_me status
            response = redirect('timetable')
            # Set a cookie to indicate successful login with remember_me
            if remember_me:
                response.set_cookie('just_logged_in', '1', max_age=5)  # Short-lived cookie
                
                # Save credentials to localStorage via JavaScript
                response.set_cookie('should_save_credentials', '1', max_age=5)
                response.set_cookie('username', user.username, max_age=5)
                response.set_cookie('password', request.POST.get('password', ''), max_age=5)
                
            return response
    else:
        form = AuthenticationForm()
    return render(request, 'registration/login.html', {'form': form, 'show_success': False})

def logout(request):
    auth_logout(request)
    return redirect('accounts:login')

def register(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            auth_login(request, user)
            return redirect('timetable')
    else:
        form = UserCreationForm()
    return render(request, 'registration/register.html', {'form': form})
