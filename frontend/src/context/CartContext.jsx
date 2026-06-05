import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cart') || '[]');
    } catch (e) {
      return [];
    }
  });
  const [coupon, setCoupon] = useState(null);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addItem = (product, qty = 1) => {
    setCart((prev) => {
      const copy = [...prev];
      const existing = copy.find((p) => p._id === product._id);
      if (existing) existing.qty = Math.min(product.countInStock || 9999, existing.qty + qty);
      else copy.push({ ...product, qty });
      return copy;
    });
  };

  const updateQty = (productId, qty) => {
    setCart((prev) => prev.map((p) => (p._id === productId ? { ...p, qty } : p)));
  };

  const removeItem = (productId) => setCart((prev) => prev.filter((p) => p._id !== productId));

  const clearCart = () => {
    setCart([]);
    setCoupon(null);
  };

  const applyCoupon = async (code) => {
    try {
      const res = await api.post('/coupons/apply', { code });
      setCoupon(res.data);
      return { success: true, discount: res.data.discount };
    } catch (err) {
      setCoupon(null);
      return { success: false, message: err.response?.data?.message || 'Invalid coupon' };
    }
  };

  const subtotal = cart.reduce((s, p) => s + p.price * (p.qty || 1), 0);
  const discountAmount = (() => {
    if (!coupon) return 0;
    const d = coupon.discount;
    if (d.type === 'percent') return (subtotal * d.value) / 100;
    if (d.type === 'flat') return d.value;
    return 0;
  })();
  const total = Math.max(0, subtotal - discountAmount);

  const value = {
    cart,
    coupon,
    addItem,
    updateQty,
    removeItem,
    clearCart,
    applyCoupon,
    subtotal,
    discountAmount,
    total
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
