
# core/urls.py
from django.contrib import admin
from django.http import HttpResponse, JsonResponse
from django.urls import path, include
from vehicles.views import UserServicesView


# Simple welcome view
def api_home(request):
    return HttpResponse("AutoCare API is running! <br>Try visiting <a href='/admin/'>/admin/</a> or testing endpoints like <a href='/api/auth/register/'>/api/auth/register/</a>")


def api_home(request):
    return JsonResponse({
        "app": "AutoCare API",
        "version": "1.0",
        "endpoints": {
            "auth": "/api/auth/",
            "vehicles": "/api/vehicles/"
        }
    })

urlpatterns = [
    path('', api_home, name='api_home'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/vehicles/', include('vehicles.urls')), # Add later
    path('api/services/', UserServicesView.as_view(), name='user-services'),

]