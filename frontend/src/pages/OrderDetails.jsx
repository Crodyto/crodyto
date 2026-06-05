import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import Rating from '../components/Rating';

const StatusStep = ({ label, active }) => (
  <div className="flex items-center gap-3">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${active ? 'bg-accent text-white' : 'bg-gray-200'}`}>{active ? '✓' : ''}</div>
    <div>{label}</div>
  </div>
);

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then((res) => setOrder(res.data)).catch((err) => console.error(err));
  }, [id]);

  if (!order) return <p>Loading order...</p>;

  const steps = ['Pending', 'Shipped', 'Delivered'];

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Order #{order._id}</h2>

      <div className="mb-6">
        <h3 className="font-medium">Tracking</h3>
        <div className="mt-4 space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex flex-col gap-6">
              {steps.map((s) => (
                <StatusStep key={s} label={s} active={steps.indexOf(s) <= steps.indexOf(order.status)} />
              ))}
            </div>
            <div className="flex-1 border-l pl-6">
              <h4 className="font-medium">Timeline</h4>
              <div className="mt-2 space-y-2">
                {(order.statusHistory || []).map((h, idx) => (
                  <div key={idx} className="text-sm">
                    <div className="font-medium">{h.status}</div>
                    <div className="text-gray-600">{new Date(h.date).toLocaleString()}</div>
                    {h.note && <div className="text-gray-700">{h.note}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-4 rounded">
          <h3 className="font-medium">Items</h3>
          <div className="mt-2 space-y-2">
            {order.orderItems.map((it) => (
              <div key={it.product} className="flex items-center gap-3 border rounded p-2">
                <img src={it.image} alt={it.name} className="w-16 h-16 object-cover rounded" />
                <div className="flex-1">
                  <div className="font-medium">{it.name}</div>
                  <div className="text-sm">Qty: {it.qty}</div>
                </div>
                <div className="font-semibold">${(it.price * it.qty).toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>

        <aside className="bg-white p-4 rounded">
          <h3 className="font-medium">Summary</h3>
          <div className="mt-2 text-sm">Items: ${order.itemsPrice?.toFixed(2)}</div>
          <div className="mt-1 text-sm">Shipping: ${order.shippingPrice?.toFixed(2)}</div>
          <div className="mt-1 text-sm">Total: ${order.totalPrice?.toFixed(2)}</div>
          <div className="mt-2 text-sm">Status: {order.status}</div>
        </aside>
      </div>
    </div>
  );
}
