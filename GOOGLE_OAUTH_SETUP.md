# Google OAuth Setup Guide

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name it "Uparwala Marketplace"
4. Click "Create"

## Step 2: Enable Google+ API

1. In the left sidebar, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and click "Enable"

## Step 3: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - User Type: External
   - App name: Uparwala Marketplace
   - User support email: your email
   - Developer contact: your email
   - Click "Save and Continue" through the scopes and test users
4. Back to Create OAuth client ID:
   - Application type: Web application
   - Name: Uparwala Web Client
   - Authorized JavaScript origins:
     - `http://localhost:5173`
     - `http://localhost:8000`
   - Authorized redirect URIs:
     - `http://localhost:8000/api/auth/google/callback/`
     - `http://localhost:5173/auth/google/callback`
   - Click "Create"
5. Copy the Client ID and Client Secret

## Step 4: Configure in Django Admin

1. Start your Django server: `python manage.py runserver`
2. Go to `http://localhost:8000/admin/`
3. Login with your superuser credentials
4. Go to "Sites" → Click on "example.com"
5. Change:
   - Domain name: `localhost:8000`
   - Display name: `Uparwala`
   - Click "Save"
6. Go to "Social applications" → "Add social application"
7. Fill in:
   - Provider: Google
   - Name: Google OAuth
   - Client id: (paste from Step 3)
   - Secret key: (paste from Step 3)
   - Sites: Select "localhost:8000" and move it to "Chosen sites"
   - Click "Save"

## Step 5: Frontend Environment Variable

Create/update `frontend/.env`:
```
VITE_GOOGLE_CLIENT_ID=your_client_id_from_step_3
```

## Step 6: Test

1. Restart both frontend and backend servers
2. Go to login page
3. Click "Continue with Google"
4. You should see Google's OAuth consent screen
5. After authorization, you'll be logged in!

## Troubleshooting

- **Redirect URI mismatch**: Make sure the redirect URIs in Google Cloud Console match exactly
- **Site not found**: Check that SITE_ID=1 in settings.py and the site is configured in admin
- **Client ID not found**: Verify the social application is created in Django admin
