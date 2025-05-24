import React from 'react';
import { Outlet } from 'react-router-dom';

const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                🍕 Smart Campus Ordering
              </h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="/login" className="text-gray-500 hover:text-gray-700">
                Login
              </a>
              <a href="/register" className="btn-primary">
                Register
              </a>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        <Outlet />
      </main>
      
      <footer className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500">
            © 2025 Smart Campus Ordering System. Built for CUET Students.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;