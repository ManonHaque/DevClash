// frontend/src/components/routing/AppRoutes.jsx - Updated with all pages
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// Layout components
import PublicLayout from '@/components/layouts/PublicLayout';
import StudentLayout from '@/components/layouts/StudentLayout';
import VendorLayout from '@/components/layouts/VendorLayout';

// Public pages
import HomePage from '@/pages/public/HomePage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

// Student pages
import StudentDashboard from '@/pages/student/StudentDashboard';
import VendorsPage from '@/pages/student/VendorsPage';

// Vendor pages
import VendorDashboard from '@/pages/vendor/VendorDashboard';

// Protected route component
import ProtectedRoute from '@/components/routing/ProtectedRoute';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Placeholder components for pages we haven't built yet
const VendorDetailPage = () => (
  <div className="text-center py-12">
    <h1 className="text-2xl font-bold mb-4">Vendor Details</h1>
    <p className="text-gray-600">This page will show vendor menu and details</p>
  </div>
);

const CartPage = () => (
  <div className="text-center py-12">
    <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>
    <p className="text-gray-600">Cart functionality coming soon</p>
  </div>
);

const OrdersPage = () => (
  <div className="text-center py-12">
    <h1 className="text-2xl font-bold mb-4">My Orders</h1>
    <p className="text-gray-600">Order history and tracking</p>
  </div>
);

const ProfilePage = () => (
  <div className="text-center py-12">
    <h1 className="text-2xl font-bold mb-4">Profile</h1>
    <p className="text-gray-600">Profile management</p>
  </div>
);

const VendorMenuPage = () => (
  <div className="text-center py-12">
    <h1 className="text-2xl font-bold mb-4">Menu Management</h1>
    <p className="text-gray-600">Manage your menu items</p>
  </div>
);

const VendorOrdersPage = () => (
  <div className="text-center py-12">
    <h1 className="text-2xl font-bold mb-4">Order Management</h1>
    <p className="text-gray-600">Manage incoming orders</p>
  </div>
);

const VendorProfilePage = () => (
  <div className="text-center py-12">
    <h1 className="text-2xl font-bold mb-4">Shop Settings</h1>
    <p className="text-gray-600">Update shop information</p>
  </div>
);

const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
      <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
      <a href="/" className="btn-primary">
        Go Home
      </a>
    </div>
  </div>
);

const AppRoutes = () => {
  const { isLoading, isAuthenticated, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading application..." />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route 
          path="login" 
          element={
            !isAuthenticated ? (
              <LoginPage />
            ) : (
              <Navigate to={user?.role === 'vendor' ? '/vendor/dashboard' : '/dashboard'} replace />
            )
          } 
        />
        <Route 
          path="register" 
          element={
            !isAuthenticated ? (
              <RegisterPage />
            ) : (
              <Navigate to={user?.role === 'vendor' ? '/vendor/dashboard' : '/dashboard'} replace />
            )
          } 
        />
      </Route>

      {/* Student routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute requiredRole="student">
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="vendors" element={<VendorsPage />} />
        <Route path="vendors/:id" element={<VendorDetailPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:id" element={<VendorDetailPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Vendor routes */}
      <Route 
        path="/vendor" 
        element={
          <ProtectedRoute requiredRole="vendor">
            <VendorLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<VendorDashboard />} />
        <Route path="menu" element={<VendorMenuPage />} />
        <Route path="orders" element={<VendorOrdersPage />} />
        <Route path="profile" element={<VendorProfilePage />} />
      </Route>

      {/* Redirect based on user role */}
      <Route 
        path="/app" 
        element={
          <Navigate 
            to={user?.role === 'vendor' ? '/vendor/dashboard' : '/dashboard'} 
            replace 
          />
        } 
      />

      {/* Catch all route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;