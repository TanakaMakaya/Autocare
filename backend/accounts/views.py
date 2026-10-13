from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User
from .serializers import RegisterSerializer, UserSerializer
from rest_framework.views import APIView 

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user



class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not old_password or not new_password:
            return Response({'error': 'Please provide both old and new passwords.'}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Verify the old password
        if not request.user.check_password(old_password):
            return Response({'error': 'Your current password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Basic validation for the new password
        if len(new_password) < 8:
            return Response({'error': 'New password must be at least 8 characters long.'}, status=status.HTTP_400_BAD_REQUEST)

        # 3. Set and save the new password
        request.user.set_password(new_password)
        request.user.save()

        return Response({'message': 'Password updated successfully.'}, status=status.HTTP_200_OK)