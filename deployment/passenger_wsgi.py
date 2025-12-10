import sys
import os

# Add your project directory to sys.path
# IMPORTANT: Replace 'username' with your cPanel username
project_home = '/home/username/uparwala/backend'
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Activate virtual environment
VENV_DIR = '/home/username/uparwala/backend/venv'
activate_this = os.path.join(VENV_DIR, 'bin', 'activate_this.py')

# Python 3 venv doesn't have activate_this.py by default
# So we manually add the venv to path
if not os.path.exists(activate_this):
    venv_lib = os.path.join(VENV_DIR, 'lib', 'python3.10', 'site-packages')
    if venv_lib not in sys.path:
        sys.path.insert(0, venv_lib)
else:
    exec(open(activate_this).read(), {'__file__': activate_this})

# Load environment variables from .env file
from dotenv import load_dotenv
env_path = os.path.join(project_home, '.env')
load_dotenv(env_path)

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'uparwala.settings_production')

# Import Django WSGI application
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
