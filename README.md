# Uparwala Marketplace

A full-featured multi-vendor e-commerce marketplace built with Django REST Framework and React. Uparwala enables vendors to sell products, customers to browse and purchase items, and administrators to manage the entire platform.

![Platform](https://img.shields.io/badge/Platform-Web-blue)
![Backend](https://img.shields.io/badge/Backend-Django-green)
![Frontend](https://img.shields.io/badge/Frontend-React-blue)
![Status](https://img.shields.io/badge/Status-Active-success)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [User Roles](#user-roles)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### For Customers
- 🛍️ Browse products with advanced filtering and search
- 🛒 Shopping cart with real-time updates
- 💳 Secure checkout process
- 📦 Order tracking and history
- ⭐ Product reviews and ratings
- ❤️ Wishlist functionality
- 🔐 Google OAuth authentication
- 📱 Responsive design for mobile and desktop

### For Vendors
- 🏪 Vendor registration and approval system
- 📦 Product management (CRUD operations)
- 📊 Sales dashboard with analytics
- 💰 Wallet and payout management
- 📈 Order management and fulfillment
- 🎨 Store customization
- 📸 Multi-image product uploads

### For Administrators
- 👥 User management
- ✅ Product moderation queue
- 🏪 Vendor application approval
- 💵 Commission settings (global and vendor-specific)
- 💸 Payout request management
- 📄 CMS page management
- 📊 Comprehensive dashboard with statistics
- 🛠️ System settings and configuration

## 🛠️ Tech Stack

### Backend
- **Framework:** Django 5.1.3
- **API:** Django REST Framework 3.15.2
- **Authentication:** dj-rest-auth, django-allauth, Simple JWT
- **Database:** SQLite (development), PostgreSQL (production ready)
- **Image Processing:** Pillow
- **Task Queue:** Celery (optional)
- **Cache:** Redis (optional)

### Frontend
- **Framework:** React 19.2.0
- **Build Tool:** Vite
- **Routing:** React Router DOM 7.9.6
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI, Lucide React
- **Animations:** Framer Motion
- **HTTP Client:** Axios
- **Forms:** React Hook Form (optional)
- **State Management:** React Context API
- **Notifications:** React Hot Toast

## 📁 Project Structure

```
uparwala/
├── backend/                 # Django backend
│   ├── config/             # Project configuration
│   │   ├── settings.py     # Django settings
│   │   ├── urls.py         # Main URL configuration
│   │   └── wsgi.py         # WSGI configuration
│   ├── users/              # User management app
│   │   ├── models.py       # User model
│   │   ├── views.py        # User views
│   │   ├── serializers.py  # User serializers
│   │   └── admin_views.py  # Admin user management
│   ├── products/           # Product management app
│   │   ├── models.py       # Product, Category, Review models
│   │   ├── views.py        # Product views
│   │   └── commission_views.py  # Commission management
│   ├── vendors/            # Vendor management app
│   │   ├── models.py       # Vendor profile, store models
│   │   ├── views.py        # Vendor views
│   │   └── serializers.py  # Vendor serializers
│   ├── orders/             # Order management app
│   │   ├── models.py       # Order, OrderItem, Cart models
│   │   ├── views.py        # Order views
│   │   └── checkout_views.py  # Checkout process
│   ├── media/              # User-uploaded files
│   └── manage.py           # Django management script
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── ui/         # UI components (Button, Card, etc.)
│   │   │   └── ...         # Feature components
│   │   ├── pages/          # Page components
│   │   │   ├── admin/      # Admin pages
│   │   │   ├── vendor/     # Vendor pages
│   │   │   └── ...         # Public pages
│   │   ├── layouts/        # Layout components
│   │   │   ├── MainLayout.jsx
│   │   │   ├── AdminLayout.jsx
│   │   │   └── VendorLayout.jsx
│   │   ├── context/        # React Context providers
│   │   │   ├── AuthContext.jsx
│   │   │   └── CartContext.jsx
│   │   ├── services/       # API services
│   │   │   └── api.js      # Axios configuration
│   │   ├── App.jsx         # Main App component
│   │   └── main.jsx        # Entry point
│   ├── public/             # Static files
│   ├── package.json        # NPM dependencies
│   └── vite.config.js      # Vite configuration
│
├── GOOGLE_OAUTH_SETUP.md   # Google OAuth setup guide
└── README.md               # This file
```

## 🚀 Installation

### Prerequisites
- Python 3.13+ (or 3.10+)
- Node.js 18+ and npm
- Git

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd uparwala
   ```

2. **Create and activate virtual environment**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```
   
   If `requirements.txt` doesn't exist, install these packages:
   ```bash
   pip install django djangorestframework django-cors-headers pillow \
               dj-rest-auth django-allauth djangorestframework-simplejwt \
               celery redis
   ```

4. **Run migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Create superuser (admin)**
   ```bash
   python manage.py createsuperuser
   # Or use the pre-configured admin:
   # Username: admin
   # Password: admin123
   ```

6. **Load sample data (optional)**
   ```bash
   python manage.py loaddata fixtures/sample_data.json
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add:
   ```env
   VITE_API_URL=http://localhost:8000/api
   VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
   ```

## ⚙️ Configuration

### Backend Configuration

Edit `backend/config/settings.py`:

```python
# Database (for production, use PostgreSQL)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'uparwala_db',
        'USER': 'your_db_user',
        'PASSWORD': 'your_db_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# Email configuration (for production)
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your_email@gmail.com'
EMAIL_HOST_PASSWORD = 'your_app_password'

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
```

### Google OAuth Setup

See [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) for detailed instructions on setting up Google OAuth authentication.

## 🏃 Running the Application

### Development Mode

1. **Start the backend server**
   ```bash
   cd backend
   source venv/bin/activate
   python manage.py runserver
   ```
   Backend will run on `http://localhost:8000`

2. **Start the frontend development server** (in a new terminal)
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

3. **Access the application**
   - **Frontend:** http://localhost:5173
   - **Backend API:** http://localhost:8000/api
   - **Django Admin:** http://localhost:8000/admin

### Production Mode

1. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Collect static files**
   ```bash
   cd backend
   python manage.py collectstatic
   ```

3. **Run with production server (Gunicorn)**
   ```bash
   gunicorn config.wsgi:application --bind 0.0.0.0:8000
   ```

## 👥 User Roles

### Admin
- **Username:** admin
- **Password:** admin123
- **Access:** Full system access, can manage users, vendors, products, orders, and settings

### Vendor
- Register through `/vendor/register`
- Wait for admin approval
- Access vendor dashboard at `/vendor/dashboard`

### Customer
- Register through `/register`
- Or use Google OAuth login
- Browse and purchase products

## 📚 API Documentation

### Authentication Endpoints
```
POST   /api/users/register/              # Register new user
POST   /api/users/login/                 # Login (get JWT tokens)
POST   /api/users/token/refresh/         # Refresh access token
POST   /api/users/google/login/          # Google OAuth login
GET    /api/users/me/                    # Get current user info
```

### Product Endpoints
```
GET    /api/products/                    # List all products
GET    /api/products/<slug>/             # Get product details
POST   /api/products/                    # Create product (vendor only)
PUT    /api/products/<id>/               # Update product (vendor only)
DELETE /api/products/<id>/               # Delete product (vendor only)
GET    /api/products/categories/         # List categories
```

### Order Endpoints
```
GET    /api/orders/orders/               # List user's orders
POST   /api/orders/orders/               # Create order
GET    /api/orders/orders/<id>/          # Get order details
GET    /api/orders/admin/orders/         # List all orders (admin only)
```

### Admin Endpoints
```
GET    /api/users/admin/stats/users/     # User statistics
GET    /api/users/admin/stats/products/  # Product statistics
GET    /api/users/admin/stats/orders/    # Order statistics
GET    /api/products/admin/commission/global/           # Get global commission
PUT    /api/products/admin/commission/global/           # Update global commission
POST   /api/products/admin/commission/vendors/create/   # Create vendor commission
```

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
python manage.py test
```

### Run Frontend Tests
```bash
cd frontend
npm run test
```

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Google OAuth authentication
- [ ] Product browsing and filtering
- [ ] Add to cart functionality
- [ ] Checkout process
- [ ] Order placement and tracking
- [ ] Vendor product management
- [ ] Admin dashboard statistics
- [ ] Commission settings
- [ ] Payout management

## 🚢 Deployment

### Backend Deployment (Heroku/Railway/DigitalOcean)

1. **Set environment variables**
   ```bash
   export DEBUG=False
   export SECRET_KEY=your_secret_key
   export DATABASE_URL=your_database_url
   export ALLOWED_HOSTS=your_domain.com
   ```

2. **Install production dependencies**
   ```bash
   pip install gunicorn whitenoise
   ```

3. **Update settings for production**
   - Set `DEBUG = False`
   - Configure `ALLOWED_HOSTS`
   - Use PostgreSQL database
   - Configure static files with WhiteNoise

### Frontend Deployment (Vercel/Netlify)

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

3. **Set environment variables** in your hosting platform:
   - `VITE_API_URL`: Your backend API URL
   - `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth client ID

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Django REST Framework for the robust API framework
- React and Vite for the modern frontend stack
- Tailwind CSS for beautiful styling
- All contributors and users of this platform

## 📞 Support

For support, email support@uparwala.com or open an issue in the repository.

## 🔄 Recent Updates

- ✅ Fixed admin dashboard statistics display
- ✅ Added admin-specific orders endpoint
- ✅ Implemented commission settings management
- ✅ Enhanced product moderation workflow
- ✅ Improved Google OAuth integration

---

**Built with ❤️ for the Uparwala community**
