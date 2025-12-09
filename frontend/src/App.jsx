import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useEffect } from 'react';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VendorRegistrationPage from './pages/VendorRegistrationPage';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Toaster } from 'react-hot-toast';
import { ProtectedRoute } from './components/ProtectedRoute';

// Product pages
import ProductListingPage from './pages/ProductListingPage';
import ProductDetailPage from './pages/ProductDetailPage';

// Cart and Checkout
import CartPage from './pages/CartPage';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';

// User pages
import OrdersPage from './pages/OrdersPage';
import Wishlist from './pages/Wishlist';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import RequestReturn from './pages/RequestReturn';
import ProfileSettings from './pages/ProfileSettings';
import OrderTracking from './pages/OrderTracking';
import ProductComparison from './pages/ProductComparison';

// Vendor pages (existing old structure)
import VendorLayout from './layouts/VendorLayout';
import VendorProducts from './pages/vendor/Products';
import VendorOrders from './pages/vendor/Orders';
import VendorWallet from './pages/vendor/Wallet';
import BulkUpload from './pages/vendor/BulkUpload';
import VendorSettings from './pages/vendor/Settings';

// Admin pages (existing old structure)
import AdminLayout from './layouts/AdminLayout';
import AdminUsers from './pages/admin/Users';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminVendors from './pages/admin/Vendors';
import AdminSettings from './pages/admin/Settings';
import VendorApplications from './pages/admin/VendorApplications';
import PayoutRequests from './pages/admin/PayoutRequests';
import ProductModeration from './pages/admin/ProductModeration';
import CommissionSettings from './pages/admin/CommissionSettings';
import CMSPages from './pages/admin/CMSPages';
import HomepageManager from './pages/admin/HomepageManager';

// Phase 7: NEW Analytics Dashboards
import VendorDashboard from './pages/VendorDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  // Track UTM parameters on mount (Phase 8)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const utmData = {
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || '',
      utm_term: params.get('utm_term') || '',
      utm_content: params.get('utm_content') || '',
      referrer: document.referrer,
      landing_page: window.location.href
    };

    if (utmData.utm_source || utmData.utm_medium || utmData.utm_campaign) {
      fetch('http://localhost:8000/api/marketing/track-utm/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(utmData),
        credentials: 'include'
      }).catch(err => console.error('UTM tracking failed:', err));
    }
  }, []);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <CartProvider>
          <Router>
            <Toaster position="top-right" />
            <Routes>
              {/* Main Layout Routes */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductListingPage />} />
                <Route path="/products/:slug" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders/:orderId" element={<OrderDetail />} />
                <Route path="/orders/:orderId/track" element={<OrderTracking />} />
                <Route path="/orders/:orderId/return" element={<RequestReturn />} />
                <Route path="/profile/settings" element={<ProfileSettings />} />
                <Route path="/compare" element={<ProductComparison />} />
              </Route>

              {/* Phase 7: NEW Analytics Dashboards - MOVED TO CORRECT LAYOUTS */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/vendor/register" element={<VendorRegistrationPage />} />
              </Route>

              {/* Vendor Routes (Old Structure + New Dashboard) */}
              <Route path="/vendor" element={<VendorLayout />}>
                <Route path="dashboard" element={<VendorDashboard />} />
                <Route path="products" element={<VendorProducts />} />
                <Route path="orders" element={<VendorOrders />} />
                <Route path="wallet" element={<VendorWallet />} />
                <Route path="bulk-upload" element={<BulkUpload />} />
                <Route path="settings" element={<VendorSettings />} />
              </Route>

              {/* Admin Routes (Old Structure + New Dashboard) */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="vendors" element={<AdminVendors />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="vendor-applications" element={<VendorApplications />} />
                <Route path="payout-requests" element={<PayoutRequests />} />
                <Route path="product-moderation" element={<ProductModeration />} />
                <Route path="commission-settings" element={<CommissionSettings />} />
                <Route path="cms-pages" element={<CMSPages />} />
                <Route path="homepage" element={<HomepageManager />} />
              </Route>
            </Routes>
          </Router>
        </CartProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
