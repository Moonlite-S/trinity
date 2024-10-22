"""
LOCAL DEVLOPMENT SETTINGS

DO NOT ADD ANYTHING USED IN PROD

development.py IS USED FOR PROD
"""

from datetime import timedelta
from pathlib import Path
import os
from dotenv import load_dotenv
from azure.identity import DefaultAzureCredential

# Load .env file
env_path = Path('..')/'..' /'.env'
load_dotenv(dotenv_path=env_path)

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv("SECRET_KEY")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True # Truned off/Made 'False' for Graph API

ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
    "localhost:3000"    
]

# Application definition

INSTALLED_APPS = [
    "rest_framework",
    "rest_framework.authtoken",
    "dj_rest_auth",
    "dj_rest_auth.registration",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.sites",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "Trinity_Project", 
    "authentication.apps.AuthenticationConfig",
    "allauth",
    "allauth.account",
    "allauth.socialaccount",
    "allauth.socialaccount.providers.microsoft",
]

SITE_ID = 1

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    'Trinity_Project.middleware.CurrentUserMiddleware',
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

REST_FRAMEWORK = {
    # 'DEFAULT_RENDERER_CLASSES': [
    #     'rest_framework.renderers.JSONRenderer',
    # ],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
        'rest_framework.authentication.SessionAuthentication',
    ]
}

AUTHENTICATION_BACKENDS = (
    "Trinity_Project.auth.EmailAuthBackend",
    "allauth.account.auth_backends.AuthenticationBackend"
)

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173", # Local development
    "http://localhost:3000", # React frontend
    "https://web.postman.co",
    "https://login.microsoftonline.com",
    "http://localhost:8000",
]

ROOT_URLCONF = "mysite.urls"

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    'https://web.postman.co',
    'https://login.microsoftonline.com',
    "http://localhost:8000",
]

# CSRF_COOKIE_SAMESITE = 'None'
# SESSION_COOKIE_SAMESITE = 'None'

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [os.path.join(BASE_DIR, 'templates')],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "mysite.wsgi.application"

# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": os.getenv("DATABASE_NAME_DEV"),
        "USER": os.getenv("DATABASE_USER_DEV"),
        "PASSWORD": os.getenv("DATABASE_PASSWORD_DEV"),
        "HOST": os.getenv("DATABASE_HOST_DEV"),
        "PORT": os.getenv("DATABASE_PORT_DEV"),        
    }
}

AZURE_FILE_SHARE_CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
AZURE_FILE_SHARE_NAME = os.getenv("AZURE_FILE_SHARE_NAME_DEV")

STORAGES = {
    "default": {
        "BACKEND": "storages.backends.azure_storage.AzureStorage",
        "OPTIONS": {
            "token_credential": DefaultAzureCredential(),
            "account_name": os.getenv("AZURE_ACCOUNT_NAME"),
            "account_string" : os.getenv("AZURE_ACCOUNT_KEY"),
            "connection_string" : os.getenv("AZURE_STORAGE_CONNECTION_STRING"),
        },
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedStaticFilesStorage",
    }
}

# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'Trinity_Project', 'logfile.log'),
            'encoding': 'utf-8',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'DEBUG',
            'propagate': True,
        },
        'Trinity_Project': {
            'handlers': ['file'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}

# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = "/static/"

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

AUTH_USER_MODEL = 'Trinity_Project.User'

STATIC_ROOT = BASE_DIR / 'staticfiles'

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
EMAIL_HOST = "smtp-relay.brevo.com"                    # smtp-relay.sendinblue.com
EMAIL_USE_TLS = False                               # False
EMAIL_PORT = 587                    # 587
EMAIL_HOST_USER = "7ddbd4001@smtp-brevo.com"               # your email address
EMAIL_HOST_PASSWORD = "gCdfAJW4hwa3D2X1"       # your password
DEFAULT_FROM_EMAIL = "7ddbd4001@smtp-brevo.com"    # email ending with @sendinblue.com

ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_EMAIL_VERIFICATION = "mandatory"

# AUTO_LOGOUT = {
#     'IDLE_TIME': timedelta(minutes=15), 
#     'REDIRECT_TO_LOGIN_IMMEDIATELY': True,
#     'MESSAGE': 'The session has expired. Please login again to continue.',
# } 

# <EMAIL_CONFIRM_REDIRECT_BASE_URL>/<key>
EMAIL_CONFIRM_REDIRECT_BASE_URL = \
    "http://localhost:5173/email/confirm/"

# <PASSWORD_RESET_CONFIRM_REDIRECT_BASE_URL>/<uidb64>/<token>/
PASSWORD_RESET_CONFIRM_REDIRECT_BASE_URL = \
    "http://localhost:5173/password-reset/confirm/"

SOCIALACCOUNT_PROVIDERS = {
    "microsoft": {
        'APP': {
            'client_id': os.getenv('AZURE_CLIENT_ID'),
            'secret': os.getenv('AZURE_CLIENT_SECRET'),
            'tenant': os.getenv('AZURE_TENANT_ID'),
        },
        'SCOPE': ['User.Read'],
        'AUTH_PARAMS': {'prompt': 'select_account'},
        'METHOD': 'oauth2',
        'VERIFIED_EMAIL': True,
    }
}

# dj-rest-auth settings
REST_AUTH = {
    'USE_JWT': False,
    'SESSION_LOGIN': True,
    'REGISTER_SERIALIZER': 'authentication.serializers.CustomRegisterSerializer',
}

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SAMESITE = 'None'
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'None'

AZURE_CLIENT_ID = os.getenv("AZURE_CLIENT_ID")
AZURE_CLIENT_SECRET = os.getenv("AZURE_CLIENT_SECRET")
AZURE_TENANT_ID = os.getenv("AZURE_TENANT_ID")
AZURE_BACKEND_REDIRECT_URI = "http://localhost:8000/api/callback"

# Update these settings laters
ACCOUNT_EMAIL_VERIFICATION = "none"  # Change this to "optional" or "none" for testing
SOCIALACCOUNT_EMAIL_VERIFICATION = "none"
SOCIALACCOUNT_EMAIL_REQUIRED = False
SOCIALACCOUNT_STORE_TOKENS = True

SOCIALACCOUNT_ADAPTER = 'Trinity_Project.adapters.CustomSocialAccountAdapter'

FRONTEND_URL = "http://localhost:5173"