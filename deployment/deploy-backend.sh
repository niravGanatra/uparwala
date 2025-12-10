#!/bin/bash

# Auto-deployment script for Uparwala Backend
# This runs on the server when GitHub Actions triggers deployment

echo "🚀 Starting backend deployment..."

# Navigate to project
cd ~/uparwala || exit 1

# Pull latest code
echo "📥 Pulling latest code from Git..."
git pull origin main

# Navigate to backend
cd backend || exit 1

# Activate virtual environment
echo "🐍 Activating virtual environment..."
source venv/bin/activate

# Install/update dependencies
echo "📦 Installing dependencies..."
pip install -q -r requirements.txt
pip install -q -r requirements-production.txt

# Run migrations
echo "🔄 Running database migrations..."
python manage.py migrate --noinput

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

# Set permissions
echo "🔒 Setting permissions..."
chmod -R 775 ~/uparwala/backend/media
chmod -R 775 ~/uparwala/backend/logs

# Restart application
echo "♻️  Restarting application..."
mkdir -p ~/public_html/tmp
touch ~/public_html/tmp/restart.txt

echo "✅ Backend deployment completed successfully!"
echo "🌐 Visit: https://uparwala.in/api/"
