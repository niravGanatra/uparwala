import os
from celery import Celery
from celery.schedules import crontab

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('config')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

app.conf.beat_schedule = {
    'send-abandoned-cart-emails-daily': {
        'task': 'orders.tasks.send_abandoned_cart_task',
        'schedule': crontab(hour=10, minute=0), # Run at 10 AM every day
    },
}

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
