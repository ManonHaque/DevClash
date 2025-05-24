import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Store, 
  Users, 
  Clock, 
  Star,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const HomePage = () => {
  const features = [
    {
      icon: Store,
      title: 'Browse Vendors',
      description: 'Discover food vendors across CUET campus with their complete menus',
    },
    {
      icon: Clock,
      title: 'Quick Ordering',
      description: 'Place orders in seconds and get real-time status updates',
    },
    {
      icon: Users,
      title: 'For Students & Vendors',
      description: 'Students order easily, vendors manage efficiently',
    },
    {
      icon: Star,
      title: 'Quality Food',
      description: 'All vendors are verified and serve quality food on campus',
    },
  ];

  const benefits = [
    'No delivery charges - pickup only',
    'Real-time order tracking',
    'CUET student verified system',
    'Multiple payment options',
    'Vendor ratings and reviews',
    'Order history tracking',
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="mb-8">
              <span className="text-6xl">🍕</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Smart Campus
              <span className="text-blue-600"> Ordering</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The easiest way to order food on CUET campus. Browse vendors, place orders, 
              and enjoy delicious meals without the hassle.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/register"
                className="btn-primary text-lg px-8 py-3 inline-flex items-center"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link 
                to="/login"
                className="btn-outline text-lg px-8 py-3"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Smart Campus Ordering?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built specifically for CUET students and campus vendors with features that matter most.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-medium transition-shadow"
              >
                <div className="mx-auto h-16 w-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Everything you need for campus food ordering
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                From browsing menus to tracking orders, we've built every feature 
                you need for a seamless food ordering experience.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:pl-8">
              <div className="bg-white rounded-xl shadow-large p-8">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Ready to get started?
                  </h3>
                  <p className="text-gray-600">
                    Join hundreds of CUET students already using our platform
                  </p>
                </div>

                <div className="space-y-4">
                  <Link 
                    to="/register"
                    className="w-full btn-primary text-center py-3"
                  >
                    Create Account
                  </Link>
                  <Link 
                    to="/login"
                    className="w-full btn-outline text-center py-3"
                  >
                    Sign In
                  </Link>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-center text-sm text-gray-500">
                    <strong>Demo Accounts:</strong>
                    <div className="mt-2 space-y-1">
                      <div>Student: mohammad.rahman@cuet.ac.bd</div>
                      <div>Vendor: ahmed.cafe@example.com</div>
                      <div className="text-xs">Password: password123</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Start ordering delicious food today!
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join the smart way to order food on CUET campus
          </p>
          <Link 
            to="/register"
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-md font-semibold inline-flex items-center"
          >
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;