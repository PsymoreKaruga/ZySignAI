from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.health, name='health'),
    path('transcribe/', views.transcribe_file, name='transcribe_file'),
    path('youtube/', views.youtube_captions, name='youtube_captions'),
    path('gloss/', views.gloss_text, name='gloss_text'),
]