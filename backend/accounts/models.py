from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # We use email as the unique identifier instead of username
    email = models.EmailField(unique=True)
    is_fleet_manager = models.BooleanField(default=False)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    
    # Remove username field from default AbstractUser
    username = None 

    def __str__(self):
        return self.email