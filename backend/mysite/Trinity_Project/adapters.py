from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from Trinity_Project.models import User
import logging

logger = logging.getLogger(__name__)

class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    '''
    ### This is used to connect the user to the existing user in the database
    This is used with the Microsoft Login View from AllAuth
    '''
    def pre_social_login(self, request, sociallogin):
        user = sociallogin.user
        logger.info(f"User in pre_social_login: {user}")
        if user.id:
            logger.info(f"User has an id in pre_social_login: {user.id}")
            return
        try:
            logger.info(f"Trying to get existing user with email in pre_social_login: {user.email}")
            existing_user = User.objects.get(email=user.email)
            logger.info(f"Existing user found in pre_social_login: {existing_user}")
            sociallogin.connect(request, existing_user)
        except User.DoesNotExist:
            logger.info(f"No existing user found with email in pre_social_login: {user.email}")
            pass