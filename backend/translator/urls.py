from django.urls import path
from . import views

urlpatterns = [
    
    
    # Add view-based routes here if needed
     path('health/', views.health_check, name='health'),
]

