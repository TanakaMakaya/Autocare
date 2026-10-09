from rest_framework import serializers
from .models import Reminder, ServiceRecord, Vehicle, VehicleDocument

class VehicleSerializer(serializers.ModelSerializer):
    owner_name = serializers.SerializerMethodField()

    class Meta:
        model = Vehicle
        fields = [
            'id', 'owner', 'owner_name', 'name', 'registration_number',
            'vin', 'manufacturer', 'model', 'year', 'mileage',
            'fuel_type', 'photo_url', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at']

    def get_owner_name(self, obj):
        return f"{obj.owner.first_name} {obj.owner.last_name}"

class ServiceRecordSerializer(serializers.ModelSerializer):
    # Add this line to include the vehicle name in the JSON response
    vehicle_name = serializers.CharField(source='vehicle.name', read_only=True)

    class Meta:
        model = ServiceRecord
        fields = [
            'id', 'vehicle', 'vehicle_name', 'service_type', 'custom_name', 'date', 
            'mileage', 'parts_cost', 'labor_cost', 'total_cost', 
            'notes', 'invoice_url', 'created_at'
        ]
        read_only_fields = ['owner', 'created_at', 'vehicle']

class VehicleDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleDocument
        fields = ['id', 'vehicle', 'title', 'category', 'file_url', 'created_at']
        read_only_fields = ['owner', 'created_at', 'vehicle'] # Prevents the 400 error!


class ReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reminder
        fields = ['id', 'vehicle', 'title', 'due_date', 'due_mileage', 'notes', 'is_completed', 'created_at']
        read_only_fields = ['owner', 'created_at', 'vehicle'] # Prevents 400 errors

class ReminderSerializer(serializers.ModelSerializer):
    # Add these two lines to include vehicle details
    vehicle_name = serializers.CharField(source='vehicle.name', read_only=True)
    vehicle_reg = serializers.CharField(source='vehicle.registration_number', read_only=True)

    class Meta:
        model = Reminder
        fields = ['id', 'vehicle', 'vehicle_name', 'vehicle_reg', 'title', 'due_date', 'due_mileage', 'notes', 'is_completed', 'created_at']
        read_only_fields = ['owner', 'created_at', 'vehicle']