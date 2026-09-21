from django.contrib import admin
from .models import Vehicle

@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ('name', 'manufacturer', 'model', 'year', 'mileage', 'owner', 'fuel_type')
    list_filter = ('manufacturer', 'fuel_type', 'year')
    search_fields = ('name', 'registration_number', 'vin', 'manufacturer', 'model')