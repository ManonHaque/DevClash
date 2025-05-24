// frontend/src/pages/student/StudentDashboard.jsx - Student dashboard
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { apiUtils } from '@/utils/api';
import { 
  Store, 
  ShoppingCart, 
  ClipboardList, 
  Star,
  TrendingUp,
  Clock,
  MapPin
} from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const StudentDashboard = () => {
  const { user } = useAuth();

  // Fetch vendors
  const { data: vendorsData, isLoading: vendorsLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => apiUtils.vendors.getAll({ isOpen: 'true' }),
  });

  // Fetch recent orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders', 'recent'],
    queryFn: () => apiUtils.orders.getMyOrders({ limit: 5 }),
  });

  const vendors = vendorsData?.data?.data?.vendors || [];
  const recentOrders = ordersData?.data?.data?.orders || [];

  if (vendorsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-blue-100 mt-1">
              Ready to order some delicious food?
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-blue-500 bg-opacity-50 rounded-lg p-4">
              <div className="text-sm text-blue-100">Student ID</div>
              <div className="text-lg font-semibold">{user?.studentId}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link 
          to="/dashboard/vendors"
          className="card hover:shadow-medium transition-shadow cursor-pointer group"
        >
          <div className="card-content text-center">
            <div className="mx-auto h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <Store className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Browse Vendors</h3>
            <p className="text-gray-600 text-sm">
              Discover food vendors on campus
            </p>
            <div className="mt-2 text-sm text-green-600 font-medium">
              {vendors.length} vendors available
            </div>
          </div>
        </Link>

        <Link 
          to="/dashboard/cart"
          className="card hover:shadow-medium transition-shadow cursor-pointer group"
        >
          <div className="card-content text-center">
            <div className="mx-auto h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
              <ShoppingCart className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">My Cart</h3>
            <p className="text-gray-600 text-sm">
              Review items before ordering
            </p>
            <div className="mt-2 text-sm text-orange-600 font-medium">
              0 items in cart
            </div>
          </div>
        </Link>

        <Link 
          to="/dashboard/orders"
          className="card hover:shadow-medium transition-shadow cursor-pointer group"
        >
          <div className="card-content text-center">
            <div className="mx-auto h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <ClipboardList className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">My Orders</h3>
            <p className="text-gray-600 text-sm">
              Track your order history
            </p>
            <div className="mt-2 text-sm text-purple-600 font-medium">
              {recentOrders.length} recent orders
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Orders & Popular Vendors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <Link 
              to="/dashboard/orders"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View all
            </Link>
          </div>
          <div className="card-content">
            {ordersLoading ? (
              <LoadingSpinner size="sm" />
            ) : recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.slice(0, 3).map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-gray-900">
                          {order.vendorId?.vendorInfo?.shopName || 'Unknown Vendor'}
                        </div>
                        <span className={`badge text-xs ${
                          order.status === 'completed' ? 'badge-success' :
                          order.status === 'preparing' ? 'badge-warning' :
                          order.status === 'ready' ? 'badge-info' :
                          'badge-secondary'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {order.items?.length} items • ৳{order.totalAmount}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Link 
                      to={`/dashboard/orders/${order._id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
                <p className="mt-1 text-sm text-gray-500">Start ordering from our vendors!</p>
                <Link 
                  to="/dashboard/vendors"
                  className="mt-4 btn-primary inline-flex items-center"
                >
                  <Store className="h-4 w-4 mr-2" />
                  Browse Vendors
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Popular Vendors */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Popular Vendors</h2>
            <Link 
              to="/dashboard/vendors"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View all
            </Link>
          </div>
          <div className="card-content">
            {vendors.length > 0 ? (
              <div className="space-y-4">
                {vendors.slice(0, 4).map((vendor) => (
                  <Link
                    key={vendor.id}
                    to={`/dashboard/vendors/${vendor.id}`}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {vendor.shopName?.charAt(0) || 'V'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {vendor.shopName}
                      </div>
                      <div className="text-sm text-gray-600 truncate">
                        {vendor.description}
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {vendor.schedule?.openTime} - {vendor.schedule?.closeTime}
                        </div>
                        <div className="text-xs text-green-600 font-medium">
                          {vendor.menuItemCount} items
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className={`h-2 w-2 rounded-full ${vendor.isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
                      <div className="text-xs text-gray-500 mt-1">
                        {vendor.isOpen ? 'Open' : 'Closed'}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Store className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No vendors available</h3>
                <p className="mt-1 text-sm text-gray-500">Check back later for food options!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Quick Stats</h2>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{vendors.length}</div>
              <div className="text-sm text-gray-600">Available Vendors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{recentOrders.length}</div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                ৳{recentOrders.reduce((sum, order) => sum + order.totalAmount, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Spent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {vendors.filter(v => v.isOpen).length}
              </div>
              <div className="text-sm text-gray-600">Open Now</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

// ===============================================