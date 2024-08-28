import os
from dotenv import load_dotenv
from .settings import *
from .settings import BASE_DIR

ALLOWED_HOSTS = [os.environ["WEBSITE_HOSTNAME"]]
CSRF_TRUSTED_ORIGINS = ['https://'+ os.environ["WEBSITE_HOSTNAME"]]
DEBUG = False
SECRET_KEY = os.environ['SECRET_KEY']

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# CORS_ALLOWED_ORIGINS = [
# ]

STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedStaticFilesStorage",
    }
}

CONNECTION  = os.getenv("AZURE_MYSQL_CONNECTIONSTRING")
CONNECTION_STRING = {pair.split('=')[0]: pair.split('=')[1] for pair in CONNECTION.split(' ')}

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": CONNECTION_STRING['Database'],
        "USER": os.getenv("MY_SQL_USER"),
        "PASSWORD": os.getenv("MY_SQL_PASSWORD"),
        "HOST": CONNECTION_STRING['Server'],  
    }
}

STATIC_ROOT = BASE_DIR/'staticfiles'