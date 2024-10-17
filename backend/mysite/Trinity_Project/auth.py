from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token

User = get_user_model()

# A custom backend made for our custom User model
# This kind of solves that weird bug where I can only login
# through the admin page when I try to login through the frontend
class EmailAuthBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            user = User.objects.get(email=username)
            print("User found: ", user)
            if user.check_password(password):
                print("Password correct", user)
                # Create or get the token
                token, _ = Token.objects.get_or_create(user=user)
                print("Token found: ", token)

                # Set the token in the request for the middleware to use
                request.auth_token = token.key
                
                return user
        except User.DoesNotExist:
            return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None

