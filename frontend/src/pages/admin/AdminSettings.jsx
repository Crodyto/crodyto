import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function AdminSettings(){
  const [settings,setSettings]=useState({ delivery:{ charge:0, type:'flat' }, tax:{ percent:0 }, terms:'', privacy:'' });
  useEffect(()=>{ api.get('/settings/defaults').then(r=>setSettings(r.data)).catch(e=>console.error(e)); },[]);

  const save = async (e)=>{
    e.preventDefault();
    const data = { delivery: { charge: Number(e.target.deliveryCharge.value), type: e.target.deliveryType.value }, tax: { percent: Number(e.target.taxPercent.value) }, terms: e.target.terms.value, privacy: e.target.privacy.value };
    await api.put('/settings/delivery', data.delivery);
    await api.put('/settings/tax', data.tax);
    await api.put('/settings/terms', data.terms);
    await api.put('/settings/privacy', data.privacy);
    alert('Saved');
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Settings</h1>
      <form onSubmit={save} className="space-y-4 max-w-2xl">
        <div>
          <h2 className="font-medium">Delivery</h2>
          <div className="flex gap-2 mt-2">
            <input name="deliveryCharge" defaultValue={settings.delivery?.charge||0} className="border p-2" />
            <select name="deliveryType" defaultValue={settings.delivery?.type||'flat'} className="border p-2">
              <option value="flat">Flat</option>
              <option value="per_km">Per km</option>
            </select>
          </div>
        </div>

        <div>
          <h2 className="font-medium">Tax</h2>
          <input name="taxPercent" defaultValue={settings.tax?.percent||0} className="border p-2 mt-2" />
        </div>

        <div>
          <h2 className="font-medium">Terms & Conditions</h2>
          <textarea name="terms" defaultValue={settings.terms||''} className="border p-2 mt-2 w-full h-40" />
        </div>

        <div>
          <h2 className="font-medium">Privacy Policy</h2>
          <textarea name="privacy" defaultValue={settings.privacy||''} className="border p-2 mt-2 w-full h-40" />
        </div>

        <div>
          <button className="bg-primary text-white p-2 rounded">Save Settings</button>
        </div>
      </form>
    </div>
  );
}
