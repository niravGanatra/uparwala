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
import CategoryPage from './pages/CategoryPage';

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
import CMSPage from './pages/CMSPage';
import RefundPolicyPage from './pages/RefundPolicyPage';
import SecurityPage from './pages/SecurityPage';
import TermsOfUsePage from './pages/TermsOfUsePage';
import PrivacyPage from './pages/PrivacyPage';
import FAQPage from './pages/FAQPage';
import EPRCompliancePage from './pages/EPRCompliancePage';
import PaymentsPage from './pages/PaymentsPage';
import ShippingPage from './pages/ShippingPage';
import AboutPage from './pages/AboutPage';
import CareersPage from './pages/CareersPage';
import SitemapPage from './pages/SitemapPage';
import CorporatePage from './pages/CorporatePage';

// Vendor pages (existing old structure)
import VendorLayout from './layouts/VendorLayout';
import VendorProducts from './pages/vendor/Products';
import VendorOrders from './pages/vendor/Orders';
import VendorWallet from './pages/vendor/Wallet';
import BulkUpload from './pages/vendor/BulkUpload';
import VendorSettings from './pages/vendor/Settings';
import VendorAnalytics from './pages/vendor/Analytics';
import VendorWalletEnhanced from './pages/vendor/WalletEnhanced';

// Admin pages (existing old structure)
import AdminLayout from './layouts/AdminLayout';
import AdminUsers from './pages/admin/Users';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import CareerApplications from './pages/admin/CareerApplications'; // New
import AdminVendors from './pages/admin/Vendors';
import AdminSettings from './pages/admin/Settings';
import VendorApprovals from './pages/admin/VendorApprovals';
import VendorApplications from './pages/admin/VendorApplications';
import PayoutRequests from './pages/admin/PayoutRequests';
import ProductModeration from './pages/admin/ProductModeration';
import CommissionSettings from './pages/admin/CommissionSettings';
import ShippingSettings from './pages/admin/ShippingSettings';
import AdminCategories from './pages/admin/Categories';
import CMSPages from './pages/admin/CMSPages';
import HomepageManager from './pages/admin/HomepageManager';
import TaxSlabs from './pages/admin/TaxSlabs';
import ShipmentManager from './pages/admin/ShipmentManager';
import ServiceabilityManager from './pages/admin/ServiceabilityManager';

// Phase 7: NEW Analytics Dashboards
import VendorDashboard from './pages/VendorDashboard';
import AdminDashboard from './pages/AdminDashboard';

import AnalyticsTracker from './components/AnalyticsTracker';
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard';
import ScrollToTop from './components/ScrollToTop';

function App() {
  // Track UTM parameters on mount (Phase 8)
  useEffect(() => {
    // ... existing utm code ...
  }, []); // Keeping empty dependency array

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <CartProvider>
          <Router>
            <ScrollToTop />
            <AnalyticsTracker />
            <Toaster position="top-right" />
            <Routes>

              {/* Main App Routes */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<HomePage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="vendor/register" element={<VendorRegistrationPage />} />

                {/* Product Routes */}
                <Route path="products" element={<ProductListingPage />} />
                <Route path="products/:slug" element={<ProductDetailPage />} />
                <Route path="category/:slug" element={<CategoryPage />} />
                <Route path="compare" element={<ProductComparison />} />

                {/* Cart & Checkout */}
                <Route path="cart" element={<CartPage />} />

                {/* CMS Pages */}
                <Route path="about-us" element={<AboutPage />} />
                <Route path="careers" element={<CareersPage />} />
                <Route path="contact" element={<CMSPage slug="contact-us" />} />
                <Route path="refund-policy" element={<RefundPolicyPage />} />
                <Route path="security" element={<SecurityPage />} />
                <Route path="terms-of-use" element={<TermsOfUsePage />} />
                <Route path="privacy-policy" element={<PrivacyPage />} />
                <Route path="faq" element={<FAQPage />} />
                <Route path="faq" element={<FAQPage />} />
                <Route path="epr-compliance" element={<EPRCompliancePage />} />
                <Route path="payments" element={<PaymentsPage />} />
                <Route path="shipping" element={<ShippingPage />} />
                <Route path="pages/sitemap" element={<SitemapPage />} />
                <Route path="pages/corporate-information" element={<CorporatePage />} />
                <Route path="pages/:slug" element={<CMSPage />} />

                {/* Protected User Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="checkout" element={<Checkout />} />
                  <Route path="order-confirmation/:id" element={<OrderConfirmation />} />
                  <Route path="profile" element={<ProfileSettings />} />
                  <Route path="orders" element={<OrdersPage />} />
                  <Route path="orders/:id" element={<OrderDetail />} />
                  <Route path="tickets" element={<OrderTracking />} />
                  <Route path="return-request" element={<RequestReturn />} />
                  <Route path="wishlist" element={<Wishlist />} />
                </Route>
              </Route>

              {/* Vendor Routes */}
              <Route path="/vendor" element={<VendorLayout />}>
                <Route path="dashboard" element={<VendorDashboard />} />
                <Route path="products" element={<VendorProducts />} />
                <Route path="orders" element={<VendorOrders />} />
                <Route path="wallet" element={<VendorWalletEnhanced />} /> {/* Updated to Enhanced Wallet */}
                <Route path="bulk-upload" element={<BulkUpload />} />
                <Route path="settings" element={<VendorSettings />} />
                <Route path="analytics" element={<VendorAnalytics />} />
              </Route>

              {/* Admin Routes (Old Structure + New Dashboard) */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="analytics" element={<AnalyticsDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="career-applications" element={<CareerApplications />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="vendors" element={<AdminVendors />} />
                <Route path="vendor-approvals" element={<VendorApprovals />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="vendor-applications" element={<VendorApplications />} />
                <Route path="payout-requests" element={<PayoutRequests />} />
                <Route path="product-moderation" element={<ProductModeration />} />
                <Route path="commission-settings" element={<CommissionSettings />} />
                <Route path="shipping" element={<ShippingSettings />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="tax-slabs" element={<TaxSlabs />} />
                <Route path="shipments" element={<ShipmentManager />} />
                <Route path="serviceability" element={<ServiceabilityManager />} />
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
