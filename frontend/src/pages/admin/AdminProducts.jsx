import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function AdminProducts(){
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async ()=>{
    try{ const { data } = await api.get('/admin/products'); setProducts(data); }catch(e){ console.error(e); }
    setLoading(false);
  };
  useEffect(()=>{ load(); },[]);

  const remove = async (id)=>{ if(!confirm('Delete product?')) return; try{ await api.delete(`/admin/products/${id}`); load(); }catch(e){ alert('Failed'); } };

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Manage Products</h1>
      {loading? <div>Loading...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {products.map(p=> (
            <div key={p._id} className="bg-white p-4 rounded shadow">
              <div className="font-semibold">{p.name}</div>
              <div className="text-sm text-gray-600">${p.price}</div>
              <div className="mt-2">
                <button className="btn mr-2">Edit</button>
                <button className="btn" onClick={()=> remove(p._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
 
