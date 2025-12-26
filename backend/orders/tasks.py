from celery import shared_task
from django.core.management import call_command
import logging

logger = logging.getLogger(__name__)

@shared_task
def send_abandoned_cart_task():
    """
    Celery task to run the send_abandoned_cart management command.
    Scheduled to run daily.
    """
    logger.info("Starting scheduled abandoned cart email task...")
    try:
        call_command('send_abandoned_cart')
        logger.info("Finished abandoned cart email task.")
        return "Completed"
    except Exception as e:
        logger.error(f"Failed to run abandoned cart task: {e}")
        return f"Failed: {e}"
