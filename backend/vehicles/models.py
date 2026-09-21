from django.db import models
from accounts.models import User

class Vehicle(models.Model):
    FUEL_CHOICES = [
        ('petrol', 'Petrol'),
        ('diesel', 'Diesel'),
        ('hybrid', 'Hybrid'),
        ('electric', 'Electric'),
    ]

    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='vehicles')
    name = models.CharField(max_length=100)
    registration_number = models.CharField(max_length=20, blank=True)
    vin = models.CharField(max_length=17, blank=True)
    manufacturer = models.CharField(max_length=50)
    model = models.CharField(max_length=50)
    year = models.PositiveIntegerField()
    mileage = models.PositiveIntegerField(default=0)
    fuel_type = models.CharField(max_length=10, choices=FUEL_CHOICES, default='petrol')
    photo_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.year} {self.manufacturer} {self.model}"

    class Meta:
        ordering = ['-created_at']