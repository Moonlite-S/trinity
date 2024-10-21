from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from Trinity_Project.models import User

class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    '''
    ### This is used to connect the user to the existing user in the database
    This is used with the Microsoft Login View from AllAuth
    '''
    def pre_social_login(self, request, sociallogin):
        user = sociallogin.user
        if user.id:
            return
        try:
            existing_user = User.objects.get(email=user.email)
            sociallogin.connect(request, existing_user)
        except User.DoesNotExist:
            pass