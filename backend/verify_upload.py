import requests
import os

# Setup
BASE_URL = 'http://localhost:8000/api'
EMAIL = 'vendor@test.com'
PASSWORD = 'vendor123'
CSV_PATH = '/Users/niravganatra/Desktop/test_products.csv'

def test_upload():
    # 1. Login
    print(f"Logging in as {EMAIL}...")
    login_resp = requests.post(f'{BASE_URL}/users/login/', json={
        'username': EMAIL, 
        'password': PASSWORD
    })
    
    if login_resp.status_code != 200:
        print(f"Login failed: {login_resp.status_code} - {login_resp.text}")
        return

    token = login_resp.json()['access']
    print("Login successful, token obtained.")

    # 2. Upload CSV
    print(f"Uploading {CSV_PATH}...")
    with open(CSV_PATH, 'rb') as f:
        files = {'file': f}
        headers = {'Authorization': f'Bearer {token}'}
        upload_resp = requests.post(f'{BASE_URL}/products/bulk-upload/', files=files, headers=headers)

    print(f"Upload Response Status: {upload_resp.status_code}")
    print(f"Upload Response Body: {upload_resp.text}")

if __name__ == '__main__':
    test_upload()
