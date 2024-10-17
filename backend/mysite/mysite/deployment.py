'''
This file overwrites certain variable settings in settings.py for production.
ALL ENVIRONMENT VARIABLES ARE ADDED IN AZURE. No need to add them here.
'''

import os
from .settings import *
from .settings import BASE_DIR

ALLOWED_HOSTS = [os.environ["WEBSITE_HOSTNAME"]]
#DEBUG = False
SECRET_KEY = os.environ['SECRET_KEY']
#LOGIN_URL = 'login'

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    'Trinity_Project.middleware.CurrentUserMiddleware',
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

CORS_ALLOWED_ORIGINS = [
    "https://yellow-sea-07d8df30f.5.azurestaticapps.net",
]

CORS_ALLOW_CREDENTIALS = True

AZURE_FILE_SHARE_NAME = os.getenv("AZURE_FILE_SHARE_NAME_PROD")

CONNECTION  = os.getenv("AZURE_MYSQL_CONNECTIONSTRING")

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": os.getenv("MY_SQL_NAME"),
        "USER": os.getenv("MY_SQL_USER"),
        "PASSWORD": os.getenv("MY_SQL_PASSWORD"),
        "HOST": os.getenv("MY_SQL_HOST"),  
        "OPTIONS": {
            "ssl": {"ca": "DigiCertGlobalRootCA.crt.pem"}
        }
    },
}

STATIC_ROOT = BASE_DIR / 'staticfiles'

CSRF_TRUSTED_ORIGINS = [
    'https://yellow-sea-07d8df30f.5.azurestaticapps.net',
]
