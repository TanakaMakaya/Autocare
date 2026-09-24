from rest_framework import generics, permissions
from .models import ServiceRecord, Vehicle
from .serializers import ServiceRecordSerializer, VehicleSerializer

class VehicleListCreateView(generics.ListCreateAPIView):
    """List all vehicles for the logged-in user, or create a new one."""
    serializer_class = VehicleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only return vehicles owned by the logged-in user
        return Vehicle.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        # Automatically assign the logged-in user as the owner
        serializer.save(owner=self.request.user)


class VehicleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a specific vehicle."""
    serializer_class = VehicleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users can only access their own vehicles
        return Vehicle.objects.filter(owner=self.request.user)


class ServiceListCreateView(generics.ListCreateAPIView):
    serializer_class = ServiceRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Get services for a specific vehicle, ensuring the user owns it
        vehicle_id = self.kwargs['vehicle_id']
        return ServiceRecord.objects.filter(vehicle_id=vehicle_id, owner=self.request.user).order_by('-date')

    def perform_create(self, serializer):
        vehicle_id = self.kwargs['vehicle_id']
        # Ensure the vehicle belongs to the user before allowing a service log
        vehicle = Vehicle.objects.get(id=vehicle_id, owner=self.request.user)
        serializer.save(owner=self.request.user, vehicle=vehicle)

class ServiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ServiceRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ServiceRecord.objects.filter(owner=self.request.user)