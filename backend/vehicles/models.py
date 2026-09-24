from django.db import models
from django.conf import settings  

class Vehicle(models.Model):
    FUEL_CHOICES = [
        ('petrol', 'Petrol'),
        ('diesel', 'Diesel'),
        ('hybrid', 'Hybrid'),
        ('electric', 'Electric'),
    ]

    # Use settings.AUTH_USER_MODEL instead of importing User directly
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='vehicles')
    
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

class ServiceRecord(models.Model):
    vehicle = models.ForeignKey('Vehicle', related_name='services', on_delete=models.CASCADE)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    # Service Details
    service_type = models.CharField(max_length=50) # e.g., 'Oil Service', 'Custom'
    custom_name = models.CharField(max_length=100, blank=True, null=True)
    date = models.DateField()
    mileage = models.IntegerField()
    
    # Costs
    parts_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    labor_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Extras
    notes = models.TextField(blank=True)
    invoice_url = models.URLField(blank=True, null=True) # Supabase link
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.service_type} for {self.vehicle.name} on {self.date}"