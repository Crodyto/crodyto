import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function AdminOrders(){
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async ()=>{
    try{ const { data } = await api.get('/admin/orders'); setOrders(data); }catch(e){ console.error(e); }
    setLoading(false);
  };
  useEffect(()=>{ load(); },[]);

  const updateStatus = async (id, status)=>{
    try{ await api.put(`/admin/orders/${id}/status`, { status }); load(); }catch(e){ alert('Failed'); }
  };

  if(loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Manage Orders</h1>
      <div className="bg-white rounded shadow overflow-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50"><tr>
            <th className="p-2">Order</th>
            <th className="p-2">User</th>
            <th className="p-2">Total</th>
            <th className="p-2">Status</th>
            <th className="p-2">Actions</th>
          </tr></thead>
          <tbody>
            {orders.map(o=> (
              <tr key={o._id} className="border-t">
                <td className="p-2">{o._id}</td>
                <td className="p-2">{o.user?.name}</td>
                <td className="p-2">${o.totalPrice}</td>
                <td className="p-2">{o.status}</td>
                <td className="p-2">
                  <select defaultValue={o.status} onChange={(e)=> updateStatus(o._id, e.target.value)} className="form-input inline-block">
                    <option value="pending">pending</option>
                    <option value="processing">processing</option>
                    <option value="shipped">shipped</option>
                    <option value="delivered">delivered</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
 
