from rest_framework import generics, permissions
from .models import Vehicle
from .serializers import VehicleSerializer

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