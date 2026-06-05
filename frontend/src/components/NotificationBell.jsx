import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const ref = useRef();

  const fetch = async () => {
    try {
      const res = await api.get('/notifications?limit=6');
      setItems(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetch();
    const iv = setInterval(fetch, 30000); // poll every 30s
    return () => clearInterval(iv);
  }, []);

  const unread = items.filter(i=>!i.read).length;

  useEffect(()=>{
    function onClick(e){ if(ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('click', onClick);
    return ()=>document.removeEventListener('click', onClick);
  },[]);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setItems((s)=>s.map(i=> i._id===id?{...i,read:true}:i));
    } catch(e){console.error(e);}
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={()=>{ setOpen(!open); if(!open) fetch(); }} className="relative">
        🔔
        {unread>0 && <span className="absolute -top-2 -right-2 text-xs bg-red-500 text-white rounded-full px-1">{unread}</span>}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow p-2 z-50">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium">Notifications</div>
            <Link to="/notifications" className="text-sm text-primary">See all</Link>
          </div>
          <div className="space-y-2">
            {items.length===0 && <div className="text-sm text-gray-500">No notifications</div>}
            {items.map(n => (
              <div key={n._id} className={`p-2 rounded ${n.read? 'bg-gray-50':'bg-gray-100'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{n.title}</div>
                    <div className="text-sm text-gray-600">{n.body}</div>
                    <div className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                  {!n.read && <button onClick={()=>markRead(n._id)} className="text-sm text-primary ml-2">Mark</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
