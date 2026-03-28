from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.health, name='health'),
    path('transcribe/', views.transcribe_file, name='transcribe_file'),
]

