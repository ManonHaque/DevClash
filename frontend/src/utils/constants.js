export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'Smart Campus Ordering',
  description: import.meta.env.VITE_APP_DESCRIPTION || 'Food ordering system for CUET students',
  version: '1.0.0',
  author: 'CUET Students',
};

export const USER_ROLES = {
  STUDENT: 'student',
  VENDOR: 'vendor',
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const MENU_CATEGORIES = {
  BREAKFAST: 'breakfast',
  LUNCH: 'lunch',
  DINNER: 'dinner',
  SNACKS: 'snacks',
  BEVERAGES: 'beverages',
  DESSERTS: 'desserts',
};

export const ROUTE_PATHS = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  VENDORS: '/vendors',
  MENU: '/menu',
  CART: '/cart',
  ORDERS: '/orders',
  PROFILE: '/profile',
  
  // Vendor routes
  VENDOR_DASHBOARD: '/vendor/dashboard',
  VENDOR_MENU: '/vendor/menu',
  VENDOR_ORDERS: '/vendor/orders',
  VENDOR_PROFILE: '/vendor/profile',
};