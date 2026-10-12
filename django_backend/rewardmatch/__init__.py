import pymysql

# Patch MySQLdb with pymysql for MySQL 8.0+ support
pymysql.install_as_MySQLdb()

# Allow MySQL 8.0 support
from django.db.backends.base.base import BaseDatabaseWrapper
BaseDatabaseWrapper.check_database_version_supported = lambda self: None

# This will ensure the app is always imported when Django starts
from .celery import app as celery_app

__all__ = ("celery_app",)

