#!/bin/bash

# This script will help you run migrations on Railway

echo "========================================="
echo "Railway Migration Helper"
echo "========================================="
echo ""
echo "Please go to Railway Dashboard and run these commands in the Shell:"
echo ""
echo "1. Go to: https://railway.app/project/609298f8-f868-4ebe-8469-b579ab8d7410"
echo "2. Click on your 'uparwala' service"
echo "3. Find 'Shell' tab or '...' menu → Shell"
echo "4. Copy and paste these commands ONE BY ONE:"
echo ""
echo "   cd backend"
echo "   python3 manage.py makemigrations products"
echo "   python3 manage.py migrate"
echo "   python3 manage.py seed_footer"
echo ""
echo "5. Wait for '✅ Footer data seeded successfully!' message"
echo "6. Refresh your browser - footer will work!"
echo ""
echo "========================================="
