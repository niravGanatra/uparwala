import smtplib
import os
import sys

def verify_smtp():
    host = os.getenv('EMAIL_HOST')
    port = os.getenv('EMAIL_PORT')
    user = os.getenv('EMAIL_HOST_USER')
    password = os.getenv('EMAIL_HOST_PASSWORD')
    
    print(f"--- SMTP Debugger ---")
    print(f"Host: {host}")
    print(f"Port: {port}")
    print(f"User: {user}")
    print(f"Password: {'*' * len(password) if password else 'NOT SET'}")
    
    if not all([host, port, user, password]):
        print("ERROR: Missing environment variables. Please set EMAIL_HOST, EMAIL_PORT, EMAIL_HOST_USER, EMAIL_HOST_PASSWORD")
        return

    try:
        print(f"\n1. Connecting to {host}:{port}...")
        server = smtplib.SMTP(host, int(port))
        server.set_debuglevel(1)  # Show verbose communication
        
        print("\n2. Securing connection (STARTTLS)...")
        server.starttls()
        
        print(f"\n3. Logging in as {user}...")
        server.login(user, password)
        
        print("\nSUCCESS: SMTP Connection and Login successful!")
        server.quit()
        
    except Exception as e:
        print(f"\nFAILURE: {str(e)}")
        print("\nCommon Google Workspace Fixes:")
        print("1. Use an 'App Password', NOT your login password.")
        print("   Go to Google Account -> Security -> 2-Step Verification -> App Passwords.")
        print("2. Ensure 'Less Secure Apps' is allowed (if not using App Password, though deprecated).")
        print("3. Check if 2-Factor Authentication is enabled (Required for App Passwords).")

if __name__ == "__main__":
    verify_smtp()
