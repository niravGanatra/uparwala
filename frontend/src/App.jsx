import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
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

import VendorLayout from './layouts/VendorLayout';
import VendorDashboard from './pages/vendor/Dashboard';
import VendorProducts from './pages/vendor/Products';
import VendorOrders from './pages/vendor/Orders';
import VendorWallet from './pages/vendor/Wallet';

import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
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

import ProductListingPage from './pages/ProductListingPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import OrdersPage from './pages/OrdersPage';
import Wishlist from './pages/Wishlist';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import RequestReturn from './pages/RequestReturn';

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Router>
            <Routes>
              {/* Main Layout Routes */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<HomePage />} />
                <Route path="products" element={<ProductListingPage />} />
                <Route path="products/:slug" element={<ProductDetailPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="order-confirmation/:orderId" element={<OrderConfirmation />} />
                <Route path="wishlist" element={<Wishlist />} />
                <Route path="orders" element={<Orders />} />
                <Route path="orders/:orderId" element={<OrderDetail />} />
                <Route path="orders/:orderId/return" element={<RequestReturn />} />
              </Route>

              {/* Auth Layout Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/vendor/register" element={<VendorRegistrationPage />} />
              </Route>

              {/* Vendor Routes - Protected */}
              <Route path="/vendor" element={
                <ProtectedRoute requireVendor={true}>
                  <VendorLayout />
                </ProtectedRoute>
              }>
                <Route path="dashboard" element={<VendorDashboard />} />
                <Route path="products" element={<VendorProducts />} />
                <Route path="orders" element={<VendorOrders />} />
                <Route path="wallet" element={<VendorWallet />} />
              </Route>

              {/* Admin Routes - Protected */}
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="vendors" element={<AdminVendors />} />
                <Route path="vendor-applications" element={<VendorApplications />} />
                <Route path="payouts" element={<PayoutRequests />} />
                <Route path="moderation" element={<ProductModeration />} />
                <Route path="commission" element={<CommissionSettings />} />
                <Route path="cms-pages" element={<CMSPages />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Routes>
          </Router>
        </CartProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
