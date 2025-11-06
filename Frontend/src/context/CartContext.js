import React, { createContext, useState, useContext, useEffect } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart([]);
      setTotal(0);
      setItemCount(0);
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await cartAPI.get();
      setCart(response.data.items);
      setTotal(response.data.total);
      setItemCount(response.data.itemCount);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      await cartAPI.add(productId, quantity);
      await fetchCart();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to add to cart',
      };
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      await cartAPI.update(cartItemId, quantity);
      await fetchCart();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to update quantity',
      };
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      await cartAPI.remove(cartItemId);
      await fetchCart();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to remove item',
      };
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clear();
      setCart([]);
      setTotal(0);
      setItemCount(0);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to clear cart',
      };
    }
  };

  const value = {
    cart,
    total,
    itemCount,
    loading,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
