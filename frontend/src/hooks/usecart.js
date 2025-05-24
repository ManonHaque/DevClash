// frontend/src/hooks/useCart.js
import { useState } from 'react';
import toast from 'react-hot-toast';

export const useCart = () => {
  const [loading, setLoading] = useState(false);

  const addToCart = async (menuItemId, quantity = 1, specialInstructions = '') => {
    setLoading(true);
    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          menuItemId, 
          quantity,
          specialInstructions 
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Item added to cart!');
        
        // Dispatch custom event to update cart count in navigation
        window.dispatchEvent(new CustomEvent('cartUpdated', {
          detail: data.data.cart
        }));
        
        return { success: true, data: data.data };
      } else {
        toast.error(data.message || 'Failed to add item to cart');
        return { success: false, error: data.message };
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
      return { success: false, error: 'Network error' };
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/cart/update/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ quantity })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Cart updated!');
        
        // Dispatch custom event to update cart count in navigation
        window.dispatchEvent(new CustomEvent('cartUpdated', {
          detail: data.data.cart
        }));
        
        return { success: true, data: data.data };
      } else {
        toast.error(data.message || 'Failed to update cart');
        return { success: false, error: data.message };
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
      return { success: false, error: 'Network error' };
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/cart/remove/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Item removed from cart');
        
        // Dispatch custom event to update cart count in navigation
        window.dispatchEvent(new CustomEvent('cartUpdated', {
          detail: data.data.cart
        }));
        
        return { success: true, data: data.data };
      } else {
        toast.error(data.message || 'Failed to remove item');
        return { success: false, error: data.message };
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
      return { success: false, error: 'Network error' };
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cart/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Cart cleared');
        
        // Dispatch custom event to update cart count in navigation
        window.dispatchEvent(new CustomEvent('cartUpdated', {
          detail: { totalItems: 0, totalAmount: 0 }
        }));
        
        return { success: true };
      } else {
        toast.error(data.message || 'Failed to clear cart');
        return { success: false, error: data.message };
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
      return { success: false, error: 'Network error' };
    } finally {
      setLoading(false);
    }
  };

  const checkout = async (notes = '') => {
    setLoading(true);
    try {
      const response = await fetch('/api/cart/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ notes })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Order placed successfully!');
        
        // Dispatch custom event to update cart count in navigation
        window.dispatchEvent(new CustomEvent('cartUpdated', {
          detail: { totalItems: 0, totalAmount: 0 }
        }));
        
        return { success: true, data: data.data };
      } else {
        toast.error(data.message || 'Failed to place order');
        return { success: false, error: data.message };
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
      return { success: false, error: 'Network error' };
    } finally {
      setLoading(false);
    }
  };

  return {
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    checkout,
    loading
  };
};