// frontend/src/pages/student/VendorsPage.jsx - Vendors listing page
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiUtils } from '@/utils/api';
import { 
  Search, 
  Filter, 
  Clock, 
  Star, 
  MapPin,
  UtensilsCrossed,
  Eye
} from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const VendorsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyOpen, setShowOnlyOpen] = useState(true);

  const { data: vendorsData, isLoading, error } = useQuery({
    queryKey: ['vendors', { search: searchTerm, isOpen: showOnlyOpen }],
    queryFn: () => apiUtils.vendors.getAll({ 
      search: searchTerm || undefined,
      isOpen: showOnlyOpen ? 'true' : undefined 
    }),
  });

  const vendors = vendorsData?.data?.data?.vendors || [];

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = !searchTerm || 
      vendor.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesOpenFilter = !showOnlyOpen || vendor.isOpen;
    
    return matchesSearch && matchesOpenFilter;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading vendors..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Failed to load vendors</div>
        <button 
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Food Vendors</h1>
          <p className="text-gray-600">Discover delicious food options on campus</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="text-sm text-gray-500">
            {filteredVendors.length} vendor{filteredVendors.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="card-content">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search vendors..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showOnlyOpen}
                  onChange={(e) => setShowOnlyOpen(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Open only</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Vendors Grid */}
      {filteredVendors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <UtensilsCrossed className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No vendors found</h3>
          <p className="mt-2 text-gray-500">
            {searchTerm 
              ? `No vendors match "${searchTerm}"`
              : showOnlyOpen 
                ? "No vendors are currently open"
                : "No vendors available right now"
            }
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 btn-outline"
            >
              Clear search
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Vendor Card Component
const VendorCard = ({ vendor }) => {
  return (
    <div className="card hover:shadow-medium transition-all duration-200 group">
      <div className="card-content">
        {/* Vendor Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-lg">
              {vendor.shopName?.charAt(0) || 'V'}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {vendor.shopName}
              </h3>
              <div className="flex items-center gap-1">
                <div className={`h-2 w-2 rounded-full ${vendor.isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className={`text-sm font-medium ${vendor.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                  {vendor.isOpen ? 'Open' : 'Closed'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {vendor.description || 'No description available'}
        </p>

        {/* Vendor Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>
              {vendor.schedule?.openTime || '09:00'} - {vendor.schedule?.closeTime || '22:00'}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <UtensilsCrossed className="h-4 w-4" />
            <span>
              {vendor.menuItemCount || 0} menu items
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="h-4 w-4" />
            <span>Campus Location</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link 
            to={`/dashboard/vendors/${vendor.id}`}
            className="flex-1 btn-primary text-center py-2 text-sm"
          >
            <Eye className="h-4 w-4 inline mr-1" />
            View Menu
          </Link>
          {!vendor.isOpen && (
            <button
              disabled
              className="px-3 py-2 text-sm bg-gray-100 text-gray-500 rounded-md cursor-not-allowed"
            >
              Closed
            </button>
          )}
        </div>

        {/* Popular badge */}
        {vendor.menuItemCount > 10 && (
          <div className="absolute top-2 right-2">
            <span className="badge-info text-xs">
              <Star className="h-3 w-3 inline mr-1" />
              Popular
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorsPage;