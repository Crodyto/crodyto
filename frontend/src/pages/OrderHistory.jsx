import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/orders/myorders').then((res) => setOrders(res.data)).catch((err) => {
      console.error(err);
      if (err.response && err.response.status === 401) navigate('/auth');
    });
  }, [navigate]);

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">My Orders</h2>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o._id} className="p-3 border rounded flex justify-between items-center">
              <div>
                <div className="font-medium">Order #{o._id}</div>
                <div className="text-sm text-gray-600">Placed: {new Date(o.createdAt).toLocaleString()}</div>
                <div className="text-sm">Status: {o.status}</div>
                <div className="text-sm">Total: ${o.totalPrice?.toFixed(2)}</div>
              </div>
              <div>
                <Link to={`/order/${o._id}`} className="text-sm text-primary">View</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
