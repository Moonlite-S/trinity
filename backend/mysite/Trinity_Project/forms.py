from django import forms
from .models import VerificationCode
class VerificationCodeForm(forms.ModelForm):
    class Meta:
        number = forms.CharField(label='VerificationCode', help_text='Enter SMS verification code')
        model = VerificationCode
        fields = ('number',)