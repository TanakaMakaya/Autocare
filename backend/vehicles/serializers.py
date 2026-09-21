from rest_framework import serializers
from .models import Vehicle

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