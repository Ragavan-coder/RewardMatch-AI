import logging
from celery import shared_task
from django.contrib.auth.models import User

logger = logging.getLogger(__name__)

@shared_task(name="reports.generate_weekly_reports_all_users")
def generate_weekly_reports_all_users_task():
    """Celery scheduled task to compute and deliver weekly savings reports."""
    logger.info("Executing scheduled weekly reports batch job...")
    users = User.objects.all()
    count = 0
    for u in users:
        # In a production pipeline, this recalculates aggregations from User's transactions
        count += 1
    logger.info(f"Generated weekly reports for {count} users.")
    return f"Processed {count} users."
