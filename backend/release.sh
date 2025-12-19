#!/bin/bash

# This script runs automatically on deployment
# It handles database migrations and initial data seeding

echo "=== Starting deployment release tasks ==="

# 1. Run migrations
echo "Running database migrations..."
python3 manage.py migrate --noinput

# 2. Seed footer data (only if tables are empty)
echo "Seeding footer data if needed..."
python3 manage.py seed_footer

# 3. Collect static files (if needed for production)
# echo "Collecting static files..."
# python3 manage.py collectstatic --noinput

echo "=== Release tasks completed successfully ==="
