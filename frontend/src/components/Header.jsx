import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { setAuthToken } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import NotificationBell from './NotificationBell';

export default function Header() {
  const navigate = useNavigate();
  const { cart } = useCart();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white border-b">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-2xl font-bold text-primary">CRODYTO</Link>
          <nav className="hidden md:flex items-center gap-4 text-sm text-gray-700">
            <Link to="/">Home</Link>
            <Link to="/products">Products</Link>
            <Link to="/categories">Categories</Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block"><NotificationBell /></div>
          <Link to="/orders" className="text-sm text-gray-700">Orders</Link>
          {user && (user.isAdmin || user.role === 'admin') && <Link to="/admin" className="text-sm text-gray-700">Admin Panel</Link>}
          <Link to="/cart" className="relative text-sm text-gray-700">Cart
            <span className="ml-1 inline-block bg-red-500 text-white text-xs rounded-full px-2">{cart.length}</span>
          </Link>
          {user ? (
            <>
              <Link to="/profile" className="text-sm text-gray-700">{user.name || 'Profile'}</Link>
              <Link to="/wishlist" className="text-sm text-gray-700">Wishlist</Link>
              <button onClick={handleLogout} className="ml-2 text-sm text-gray-600">Logout</button>
            </>
          ) : (
            <Link to="/auth" className="text-sm text-gray-700">Login</Link>
          )}
        </div>
      </div>
    </header>
  );
}
