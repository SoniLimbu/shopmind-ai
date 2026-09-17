import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection

with connection.cursor() as cursor:
    cursor.execute("DROP SCHEMA public CASCADE;")
    cursor.execute("CREATE SCHEMA public;")

print("Database wiped successfully.")
