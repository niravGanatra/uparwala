#!/bin/bash

# Auto-migration startup script
# This runs migrations and seeding before starting the app

cd backend

echo "Running migrations..."
python3 manage.py makemigrations products
python3 manage.py migrate --noinput

echo "Seeding footer data..."
python3 manage.py seed_footer

echo "Starting application..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 4 --threads 2 --timeout 120 --access-logfile - --error-logfile - --log-level info
