import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

export default function WishlistPage() {
  const [items, setItems] = useState([]);
  const { addItem } = useCart();
  const navigate = useNavigate();

  const fetch = async () => {
    try {
      const res = await api.get('/wishlist');
      setItems(res.data || []);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) navigate('/auth');
    }
  };

  useEffect(() => { fetch(); }, []);

  const remove = async (id) => {
    try {
      await api.delete(`/wishlist/${id}`);
      fetch();
    } catch (err) { console.error(err); }
  };

  const moveToCart = async (p) => {
    try {
      addItem(p, 1);
      await api.delete(`/wishlist/${p._id}`);
      fetch();
      navigate('/cart');
    } catch (err) { console.error(err); }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Wishlist</h2>
      {items.length === 0 ? <p>Your wishlist is empty.</p> : (
        <div className="space-y-4">
          {items.map((p) => (
            <div key={p._id} className="flex items-center gap-4 border rounded p-3">
              <img src={p.images?.[0]} alt={p.name} className="w-24 h-24 object-cover rounded" />
              <div className="flex-1">
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-gray-600">${p.price}</div>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => moveToCart(p)} className="bg-primary text-white rounded p-2">Move to cart</button>
                <button onClick={() => remove(p._id)} className="text-red-500">Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
