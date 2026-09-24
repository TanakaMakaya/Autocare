from django.urls import path
from .views import ServiceDetailView, ServiceListCreateView, VehicleListCreateView, VehicleDetailView

urlpatterns = [
    path('', VehicleListCreateView.as_view(), name='vehicle-list-create'),
    path('<int:pk>/', VehicleDetailView.as_view(), name='vehicle-detail'),
    path('<int:vehicle_id>/services/', ServiceListCreateView.as_view(), name='service-list'),
    path('<int:vehicle_id>/services/<int:pk>/', ServiceDetailView.as_view(), name='service-detail'),
]