from django.conf import settings
import jwt
from rest_framework.exceptions import AuthenticationFailed

def authenticate_jwt(request):
    token = request.COOKIES.get('jwt_token')
    
    if not token:
        raise AuthenticationFailed('Unauthenticated!') 
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        raise AuthenticationFailed('Unauthenticated!')
    
    return payload
