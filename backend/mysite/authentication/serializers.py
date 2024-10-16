from dj_rest_auth.registration.serializers import RegisterSerializer
from rest_framework import serializers

class CustomRegisterSerializer(RegisterSerializer):
    role = serializers.ChoiceField(choices=['Manager', 'Team Member', 'Administrator', 'Accountant'])

    # Overrides the default get_cleaned_data method from dj-rest-auth
    # so that we can put the role in
    def get_cleaned_data(self):
        data = super().get_cleaned_data()
        data['role'] = self.validated_data.get('role', '')
        return data