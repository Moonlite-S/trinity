import jwt
from twilio.rest import Client
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings


def authenticate_jwt(request):
    token = request.COOKIES.get('jwt')
    
    if not token:
        raise AuthenticationFailed('Unauthenticated!') 
    
    try:
        payload = jwt.decode(token, 'secret', algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        raise AuthenticationFailed('Unauthenticated!')
    
    return payload


#stuff for sending sms verification request if implemented
account_sid = settings.ACCOUNT_SID
auth_token =  settings.AUTH_TOKEN
from_phone_number = settings.PHONE_NUMBER
client = Client(account_sid, auth_token)

def send_sms(user_code, phone_number):
    message = client.messages.create(
                                body=f'Hi! Your verification code is {user_code}',
                                from_=f'{from_phone_number}',
                                to=f'{phone_number}'
                            )
