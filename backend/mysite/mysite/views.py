from django.contrib.auth import logout
from django.shortcuts import redirect
from rest_framework.decorators import api_view
from django.urls import reverse

@api_view(['POST'])
def logout_view(request):
    logout(request)
    return redirect(reverse('two_factor:login'))