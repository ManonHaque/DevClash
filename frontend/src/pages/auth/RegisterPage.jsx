import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { 
  Eye, EyeOff, Loader2, Mail, Lock, User, Phone, 
  Building, UserCheck, Clock 
} from 'lucide-react';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userRole, setUserRole] = useState('student');
  const { register: registerUser, isLoading, clearError } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
    reset,
  } = useForm({
    defaultValues: {
      role: 'student'
    }
  });

  const watchedRole = watch('role');
  const watchedPassword = watch('password');

  useEffect(() => {
    setUserRole(watchedRole);
  }, [watchedRole]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const onSubmit = async (data) => {
    try {
      // Remove confirmPassword from data
      const { confirmPassword, ...userData } = data;

      // Format vendor info if role is vendor
      if (userData.role === 'vendor') {
        userData.vendorInfo = {
          shopName: userData.shopName,
          description: userData.description || '',
          isOpen: true,
          schedule: {
            openTime: userData.openTime || '09:00',
            closeTime: userData.closeTime || '22:00',
          },
        };

        // Remove individual vendor fields
        delete userData.shopName;
        delete userData.description;
        delete userData.openTime;
        delete userData.closeTime;
      }

      const result = await registerUser(userData);
      
      if (result.success) {
        toast.success('Registration successful! Welcome to Smart Campus Ordering!');
        // Redirect based on user role
        const redirectPath = result.user.role === 'vendor' 
          ? '/vendor/dashboard' 
          : '/dashboard';
        navigate(redirectPath, { replace: true });
      } else {
        setError('root', { message: result.error });
      }
    } catch (error) {
      setError('root', { message: 'An unexpected error occurred' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
            <span className="text-2xl">🍕</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-green-600 hover:text-green-500"
            >
              Sign in here
            </Link>
          </p>
        </div>

        {/* Form */}
        <div className="card shadow-lg">
          <div className="card-content">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Global Error */}
              {errors.root && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-700">
                    {errors.root.message}
                  </div>
                </div>
              )}

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  I am a:
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                    userRole === 'student' 
                      ? 'border-green-600 ring-2 ring-green-600 bg-green-50' 
                      : 'border-gray-300 bg-white hover:bg-gray-50'
                  }`}>
                    <input
                      {...register('role')}
                      type="radio"
                      value="student"
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <UserCheck className="h-5 w-5 text-green-600 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">Student</div>
                        <div className="text-xs text-gray-500">CUET Student Account</div>
                      </div>
                    </div>
                  </label>

                  <label className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                    userRole === 'vendor' 
                      ? 'border-green-600 ring-2 ring-green-600 bg-green-50' 
                      : 'border-gray-300 bg-white hover:bg-gray-50'
                  }`}>
                    <input
                      {...register('role')}
                      type="radio"
                      value="vendor"
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <Building className="h-5 w-5 text-green-600 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">Vendor</div>
                        <div className="text-xs text-gray-500">Food Shop Owner</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('name', {
                        required: 'Full name is required',
                        minLength: {
                          value: 2,
                          message: 'Name must be at least 2 characters',
                        },
                      })}
                      type="text"
                      className={`input pl-10 ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: userRole === 'student' 
                            ? /^[a-zA-Z0-9._%+-]+@cuet\.ac\.bd$/
                            : /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: userRole === 'student' 
                            ? 'Students must use CUET email (@cuet.ac.bd)'
                            : 'Please enter a valid email address',
                        },
                      })}
                      type="email"
                      className={`input pl-10 ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                      placeholder={userRole === 'student' ? 'your.name@cuet.ac.bd' : 'your.email@example.com'}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('phone', {
                        required: 'Phone number is required',
                        pattern: {
                          value: /^(\+8801|01)[3-9]\d{8}$/,
                          message: 'Please enter a valid Bangladeshi phone number',
                        },
                      })}
                      type="tel"
                      className={`input pl-10 ${errors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="01XXXXXXXXX"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>

                {/* Student ID (only for students) */}
                {userRole === 'student' && (
                  <div>
                    <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">
                      Student ID
                    </label>
                    <div className="mt-1">
                      <input
                        {...register('studentId', {
                          required: userRole === 'student' ? 'Student ID is required' : false,
                          minLength: {
                            value: 4,
                            message: 'Student ID must be at least 4 characters',
                          },
                        })}
                        type="text"
                        className={`input ${errors.studentId ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="e.g., 1904001"
                      />
                    </div>
                    {errors.studentId && (
                      <p className="mt-1 text-sm text-red-600">{errors.studentId.message}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Vendor-specific fields */}
              {userRole === 'vendor' && (
                <div className="space-y-6">
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Shop Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Shop Name */}
                      <div className="md:col-span-2">
                        <label htmlFor="shopName" className="block text-sm font-medium text-gray-700">
                          Shop Name
                        </label>
                        <div className="mt-1">
                          <input
                            {...register('shopName', {
                              required: userRole === 'vendor' ? 'Shop name is required' : false,
                              minLength: {
                                value: 2,
                                message: 'Shop name must be at least 2 characters',
                              },
                            })}
                            type="text"
                            className={`input ${errors.shopName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                            placeholder="e.g., Campus Cafe"
                          />
                        </div>
                        {errors.shopName && (
                          <p className="mt-1 text-sm text-red-600">{errors.shopName.message}</p>
                        )}
                      </div>

                      {/* Description */}
                      <div className="md:col-span-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                          Shop Description (Optional)
                        </label>
                        <div className="mt-1">
                          <textarea
                            {...register('description')}
                            rows={3}
                            className="input"
                            placeholder="Brief description of your food shop..."
                          />
                        </div>
                      </div>

                      {/* Operating Hours */}
                      <div>
                        <label htmlFor="openTime" className="block text-sm font-medium text-gray-700">
                          Opening Time
                        </label>
                        <div className="mt-1 relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Clock className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            {...register('openTime')}
                            type="time"
                            className="input pl-10"
                            defaultValue="09:00"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="closeTime" className="block text-sm font-medium text-gray-700">
                          Closing Time
                        </label>
                        <div className="mt-1 relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Clock className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            {...register('closeTime')}
                            type="time"
                            className="input pl-10"
                            defaultValue="22:00"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Password fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters',
                        },
                      })}
                      type={showPassword ? 'text' : 'password'}
                      className={`input pl-10 pr-10 ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="Enter password"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (value) =>
                          value === watchedPassword || 'Passwords do not match',
                      })}
                      type={showConfirmPassword ? 'text' : 'password'}
                      className={`input pl-10 pr-10 ${errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="Confirm password"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              {/* Terms and conditions */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    {...register('agreeToTerms', {
                      required: 'You must agree to the terms and conditions',
                    })}
                    id="agree-to-terms"
                    type="checkbox"
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="agree-to-terms" className="text-gray-600">
                    I agree to the{' '}
                    <a href="#" className="text-green-600 hover:text-green-500">
                      Terms and Conditions
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-green-600 hover:text-green-500">
                      Privacy Policy
                    </a>
                  </label>
                  {errors.agreeToTerms && (
                    <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms.message}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="w-full btn-success flex justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting || isLoading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;