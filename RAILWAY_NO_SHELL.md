# Railway Deployment - Auto Migration Setup

## No Shell Access? No Problem!

Use the startup script to auto-run migrations.

### Steps:

1. **In Railway Dashboard:**
   - Go to your service settings
   - Find **"Start Command"** or **"Custom Start Command"**
   
2. **Replace the start command with:**
   ```bash
   bash start.sh
   ```
   
   Or the full command:
   ```bash
   cd backend && python3 manage.py makemigrations products && python3 manage.py migrate --noinput && python3 manage.py seed_footer && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 4 --threads 2 --timeout 120
   ```

3. **Save and Redeploy**

That's it! Migrations will run automatically on every deployment.

---

## Alternative: Direct SQL (if you have database access)

If Railway gives you database console access, you can run the SQL directly.

Let me know if you need the SQL statements instead!
