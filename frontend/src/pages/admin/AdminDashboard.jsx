import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function AdminDashboard(){
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(()=>{
    let mounted = true;
    api.get('/admin/stats').then(res=>{ if(mounted){ setStats(res.data); setLoading(false);} }).catch(err=>{ if(mounted){ setError(err.response?.data?.message || 'Failed'); setLoading(false);} });
    return ()=> mounted=false;
  },[]);

  if(loading) return <div className="p-6">Loading...</div>;
  if(error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded shadow"> <div className="text-sm text-gray-500">Users</div> <div className="text-xl font-bold">{stats.usersCount}</div></div>
        <div className="p-4 bg-white rounded shadow"> <div className="text-sm text-gray-500">Products</div> <div className="text-xl font-bold">{stats.productsCount}</div></div>
        <div className="p-4 bg-white rounded shadow"> <div className="text-sm text-gray-500">Orders</div> <div className="text-xl font-bold">{stats.ordersCount}</div></div>
        <div className="p-4 bg-white rounded shadow"> <div className="text-sm text-gray-500">Revenue</div> <div className="text-xl font-bold">${Number(stats.totalSales||0).toFixed(2)}</div></div>
      </div>
    </div>
  );
}
 
