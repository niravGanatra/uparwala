# Deployment Configuration Guide

## Automatic Deployment Setup

This project includes automated deployment scripts that run migrations and seeding on every deployment.

### Files Created:
- `backend/release.sh` - Release script for deployment platforms

---

## Platform-Specific Setup

### Render.com

1. **In your Render dashboard**, go to your web service settings
2. **Add a Release Command:**
   ```bash
   cd backend && ./release.sh
   ```
   OR simply:
   ```bash
   cd backend && python3 manage.py migrate --noinput && python3 manage.py seed_footer
   ```

3. **Save and redeploy**

### Railway.app

1. **In your Railway dashboard**, go to your service settings
2. **Add a Release Command** in the "Deploy" section:
   ```bash
   cd backend && sh release.sh
   ```

3. **Save and redeploy**

### Heroku

1. **In your `Procfile`**, add a release process:
   ```
   release: cd backend && sh release.sh
   web: cd backend && gunicorn config.wsgi:application
   ```

2. **Commit and push** to trigger deployment

### Docker / Custom Platform

Add this to your startup sequence or Dockerfile:
```dockerfile
# In your Dockerfile or docker-compose.yml
CMD ["sh", "-c", "cd backend && ./release.sh && gunicorn config.wsgi:application"]
```

---

## What Happens on Each Deployment

1. ✅ **Migrations run automatically** - Creates/updates database tables
2. ✅ **Footer data seeds if needed** - Only runs once (checks if data exists)
3. ✅ **App starts** - Ready with all data in place

---

## Manual Deployment (if needed)

If your platform doesn't support release commands, add to startup:

```bash
#!/bin/bash
cd backend
python3 manage.py migrate --noinput
python3 manage.py seed_footer
gunicorn config.wsgi:application
```

---

## Testing Locally

Run the release script locally to test:
```bash
cd backend
./release.sh
```

---

## Notes

- The `seed_footer` command is safe to run multiple times
- It checks if data exists before creating it
- Migrations are idempotent (safe to run repeatedly)
- No manual intervention needed after setup

**Your footer will be automatically set up on every deployment!**
