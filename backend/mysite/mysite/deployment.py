import os
from .settings import *
from .settings import BASE_DIR
from azure.identity import DefaultAzureCredential

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

CORS_ALLOWED_ORIGINS = [
    "https://yellow-sea-07d8df30f.5.azurestaticapps.net",
]


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
        "BACKEND": "storages.backends.azure_storage.AzureStorage",
    }
}

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

STATIC_ROOT = BASE_DIR/'staticfiles'

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_SAMESITE = 'None'
SESSION_COOKIE_SAMESITE = 'None'