import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function NotificationsPage(){
  const [items,setItems]=useState([]);
  useEffect(()=>{ api.get('/notifications').then(r=>setItems(r.data)).catch(e=>console.error(e)); },[]);

  const markRead = async (id)=>{ try{ await api.put(`/notifications/${id}/read`); setItems(s=>s.map(i=>i._id===id?{...i,read:true}:i)); }catch(e){console.error(e);} };
  const markAll = async ()=>{ try{ await api.put('/notifications/read-all'); setItems(s=>s.map(i=>({...i,read:true}))); }catch(e){console.error(e);} };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Notifications</h2>
      <div className="mb-4">
        <button onClick={markAll} className="bg-primary text-white rounded p-2">Mark all read</button>
      </div>
      <div className="space-y-3">
        {items.map(n=> (
          <div key={n._id} className={`p-3 border rounded ${n.read? 'bg-gray-50':''}`}>
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">{n.title}</div>
                <div className="text-sm text-gray-600">{n.body}</div>
                <div className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</div>
              </div>
              {!n.read && <button onClick={()=>markRead(n._id)} className="text-sm text-primary">Mark read</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
