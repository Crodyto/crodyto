import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function AdminCoupons(){
  const [coupons,setCoupons]=useState([]);
  const [editing,setEditing]=useState(null);
  useEffect(()=>{ fetch(); },[]);
  const fetch = ()=> api.get('/admin/coupons').then(r=>setCoupons(r.data)).catch(e=>console.error(e));
  const save = async (e)=>{ e.preventDefault(); const data = Object.fromEntries(new FormData(e.target)); if(editing) await api.put(`/admin/coupons/${editing._id}`, data); else await api.post('/admin/coupons', data); setEditing(null); fetch(); };
  const del = async (id)=>{ if(!confirm('Delete coupon?')) return; await api.delete(`/admin/coupons/${id}`); fetch(); };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Coupons</h1>
      <div className="mb-4">
        <button onClick={()=>setEditing({})} className="bg-primary text-white p-2 rounded">Create Coupon</button>
      </div>
      {editing && (
        <form onSubmit={save} className="mb-4 p-4 border rounded">
          <input name="code" defaultValue={editing.code||''} placeholder="Code" className="block mb-2" />
          <input name="discountPercent" defaultValue={editing.discountPercent||0} placeholder="Discount %" className="block mb-2" />
          <input name="expiresAt" defaultValue={editing.expiresAt||''} placeholder="ExpiresAt (ISO)" className="block mb-2" />
          <button className="bg-primary text-white p-2 rounded">Save</button>
        </form>
      )}

      <div className="space-y-2">
        {coupons.map(c=> (
          <div key={c._id} className="p-3 border rounded flex justify-between">
            <div>
              <div className="font-medium">{c.code}</div>
              <div className="text-sm text-gray-600">{c.discountPercent}% · {c.expiresAt? new Date(c.expiresAt).toLocaleDateString(): 'never'}</div>
            </div>
            <div>
              <button onClick={()=>setEditing(c)} className="text-sm text-primary">Edit</button>
              <button onClick={()=>del(c._id)} className="text-sm text-red-500">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
