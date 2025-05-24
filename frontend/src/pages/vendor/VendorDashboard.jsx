// frontend/src/pages/vendor/VendorDashboard.jsx - Vendor dashboard
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { apiUtils } from '@/utils/api';
import { 
  DollarSign, 
  ShoppingBag, 
  UtensilsCrossed, 
  TrendingUp,
  Clock,
  Users,
  Eye,
  Edit,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const VendorDashboard = () => {
  const { user } = useAuth();

  // Fetch dashboard stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['vendor', 'dashboard-stats'],
    queryFn: () => apiUtils.vendors.getDashboardStats(),
  });

  // Fetch recent orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['vendor', 'orders', 'recent'],
    queryFn: () => apiUtils.orders.getVendorOrders({ limit: 5 }),
  });

  // Fetch menu items
  const { data: menuData, isLoading: menuLoading } = useQuery({
    queryKey: ['vendor', 'menu'],
    queryFn: () => apiUtils.menu.getMyItems({ limit: 6 }),
  });

  const stats = statsData?.data?.data?.stats;
  const recentOrders = ordersData?.data?.data?.orders || [];
  const menuItems = menuData?.data?.data?.menuItems || [];

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome, {user?.name}! 👨‍🍳
            </h1>
            <p className="text-green-100 mt-1">
              {user?.vendorInfo?.shopName} Dashboard
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="bg-green-500 bg-opacity-50 rounded-lg p-4 text-center">
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${user?.vendorInfo?.isOpen ? 'bg-green-200' : 'bg-red-300'}`} />
                <span className="text-sm text-green-100">
                  {user?.vendorInfo?.isOpen ? 'Open' : 'Closed'}
                </span>
              </div>
              <div className="text-xs text-green-200 mt-1">
                {user?.vendorInfo?.schedule?.openTime} - {user?.vendorInfo?.schedule?.closeTime}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ৳{stats?.revenue?.total || 0}
                </p>
                <p className="text-sm text-green-600 font-medium">
                  +৳{stats?.revenue?.today || 0} today
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.orders?.total || 0}
                </p>
                <p className="text-sm text-blue-600 font-medium">
                  {stats?.orders?.pending || 0} pending
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Menu Items</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.menu?.total || 0}
                </p>
                <p className="text-sm text-orange-600 font-medium">
                  {stats?.menu?.active || 0} active
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <UtensilsCrossed className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ৳{Math.round(stats?.revenue?.total / (stats?.orders?.total || 1)) || 0}
                </p>
                <p className="text-sm text-purple-600 font-medium">
                  This month
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link 
          to="/vendor/menu"
          className="card hover:shadow-medium transition-shadow cursor-pointer group"
        >
          <div className="card-content text-center">
            <div className="mx-auto h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <UtensilsCrossed className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Manage Menu</h3>
            <p className="text-gray-600 text-sm">
              Add, edit, or remove menu items
            </p>
          </div>
        </Link>

        <Link 
          to="/vendor/orders"
          className="card hover:shadow-medium transition-shadow cursor-pointer group"
        >
          <div className="card-content text-center">
            <div className="mx-auto h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
              <ShoppingBag className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">View Orders</h3>
            <p className="text-gray-600 text-sm">
              Manage incoming orders
            </p>
          </div>
        </Link>

        <Link 
          to="/vendor/profile"
          className="card hover:shadow-medium transition-shadow cursor-pointer group"
        >
          <div className="card-content text-center">
            <div className="mx-auto h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Shop Settings</h3>
            <p className="text-gray-600 text-sm">
              Update shop information
            </p>
          </div>
        </Link>
      </div>

      {/* Recent Orders & Menu Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <Link 
              to="/vendor/orders"
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
                {recentOrders.slice(0, 5).map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-gray-900">
                          Order #{order.deliveryCode}
                        </div>
                        <span className={`badge text-xs ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {order.studentId?.name} • {order.items?.length} items
                      </div>
                      <div className="text-sm font-medium text-green-600">
                        ৳{order.totalAmount}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No recent orders</h3>
                <p className="mt-1 text-sm text-gray-500">Orders will appear here when customers place them</p>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Menu Items</h2>
            <Link 
              to="/vendor/menu"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Manage all
            </Link>
          </div>
          <div className="card-content">
            {menuLoading ? (
              <LoadingSpinner size="sm" />
            ) : menuItems.length > 0 ? (
              <div className="space-y-4">
                {menuItems.slice(0, 5).map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-white font-medium">
                        {item.name?.charAt(0) || 'M'}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-600">৳{item.price}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge text-xs ${item.isAvailable ? 'badge-success' : 'badge-danger'}`}>
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                      <Link 
                        to={`/vendor/menu/${item._id}/edit`}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <UtensilsCrossed className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No menu items</h3>
                <p className="mt-1 text-sm text-gray-500">Add your first menu item to get started</p>
                <Link 
                  to="/vendor/menu"
                  className="mt-4 btn-primary inline-flex items-center"
                >
                  <UtensilsCrossed className="h-4 w-4 mr-2" />
                  Add Menu Item
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Daily Stats */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Today's Overview</h2>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats?.orders?.today || 0}</div>
              <div className="text-sm text-gray-600">Orders Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">৳{stats?.revenue?.today || 0}</div>
              <div className="text-sm text-gray-600">Revenue Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats?.orders?.pending || 0}</div>
              <div className="text-sm text-gray-600">Pending Orders</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats?.orders?.completed || 0}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{stats?.menu?.active || 0}</div>
              <div className="text-sm text-gray-600">Active Items</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function for status badge classes
const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'pending':
      return 'badge-warning';
    case 'confirmed':
      return 'badge-info';
    case 'preparing':
      return 'badge-warning';
    case 'ready':
      return 'badge-success';
    case 'completed':
      return 'badge-success';
    case 'cancelled':
      return 'badge-danger';
    default:
      return 'badge-secondary';
  }
};

export default VendorDashboard;