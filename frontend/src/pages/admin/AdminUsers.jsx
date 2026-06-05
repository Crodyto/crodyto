import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function AdminUsers(){
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async ()=>{
    try{
      const { data } = await api.get('/admin/users');
      setUsers(data);
    }catch(e){ console.error(e); }
    setLoading(false);
  };

  useEffect(()=>{ load(); },[]);

  const toggle = async (id, action)=>{
    try{
      await api.put(`/admin/users/${id}/block`, { action });
      load();
    }catch(e){ alert('Failed'); }
  };

  const setRole = async (id, role)=>{
    try{ await api.put(`/admin/users/${id}/role`, { role }); load(); }catch(e){ alert('Failed'); }
  };

  if(loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Users</h1>
      <div className="space-y-2">
        {users.map(u=> (
          <div key={u._id} className="p-3 border rounded flex justify-between items-center">
            <div>
              <div className="font-medium">{u.name}</div>
              <div className="text-sm text-gray-600">{u.email}</div>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <select value={u.role||'user'} onChange={(e)=>setRole(u._id, e.target.value)} className="border rounded p-1">
                  <option value="user">User</option>
                  <option value="sub-admin">Sub-admin</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                {!u.blocked && <button className="text-red-500" onClick={()=>toggle(u._id,'block')}>Block</button>}
                {u.blocked && <button className="text-green-600" onClick={()=>toggle(u._id,'unblock')}>Unblock</button>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
