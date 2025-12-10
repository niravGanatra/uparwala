"""
WSGI config for config project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

# Force settings module to avoid Railway variable override
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'

application = get_wsgi_application()
