#!/bin/bash

# Build script for frontend production deployment

echo "🚀 Building Uparwala Frontend for Production..."

# Navigate to frontend directory
cd "$(dirname "$0")"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build for production
echo "🏗️  Building production bundle..."
npm run build

echo "✅ Build complete! Files are in dist/ folder"
echo "📂 Ready to deploy to cPanel"
