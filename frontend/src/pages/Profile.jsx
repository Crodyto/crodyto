import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState({ name: '', email: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [addresses, setAddresses] = useState([]);
  const [addressForm, setAddressForm] = useState({ label: '', address: '', city: '', postalCode: '', country: '', phone: '' });
  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/profile');
      setProfile(res.data);
      setEditing({ name: res.data.name || '', email: res.data.email || '', phone: res.data.phone || '' });
      setAddresses(res.data.addresses || []);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) navigate('/auth');
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const saveProfile = async () => {
    try {
      const res = await api.put('/users/profile', editing);
      setProfile(res.data);
      alert('Profile updated');
    } catch (err) {
      console.error(err);
      alert('Update failed');
    }
  };

  const changePassword = async () => {
    try {
      await api.put('/users/change-password', passwordForm);
      alert('Password changed');
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Password change failed');
    }
  };

  const addAddress = async () => {
    try {
      const res = await api.post('/users/addresses', addressForm);
      setAddresses(res.data);
      setAddressForm({ label: '', address: '', city: '', postalCode: '', country: '', phone: '' });
    } catch (err) {
      console.error(err);
      alert('Add address failed');
    }
  };

  const removeAddress = async (id) => {
    try {
      const res = await api.delete(`/users/addresses/${id}`);
      setAddresses(res.data);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Profile</h2>

      <section className="bg-white p-4 rounded mb-4">
        <h3 className="font-medium">Personal Info</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
          <input value={editing.name} onChange={(e)=>setEditing({...editing,name:e.target.value})} placeholder="Name" className="border p-2 rounded" />
          <input value={editing.email} onChange={(e)=>setEditing({...editing,email:e.target.value})} placeholder="Email" className="border p-2 rounded" />
          <input value={editing.phone} onChange={(e)=>setEditing({...editing,phone:e.target.value})} placeholder="Phone" className="border p-2 rounded" />
        </div>
        <div className="mt-2">
          <button onClick={saveProfile} className="bg-primary text-white rounded p-2">Save</button>
        </div>
      </section>

      <section className="bg-white p-4 rounded mb-4">
        <h3 className="font-medium">Change Password</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
          <input type="password" value={passwordForm.currentPassword} onChange={(e)=>setPasswordForm({...passwordForm,currentPassword:e.target.value})} placeholder="Current password" className="border p-2 rounded" />
          <input type="password" value={passwordForm.newPassword} onChange={(e)=>setPasswordForm({...passwordForm,newPassword:e.target.value})} placeholder="New password" className="border p-2 rounded" />
        </div>
        <div className="mt-2">
          <button onClick={changePassword} className="bg-primary text-white rounded p-2">Change password</button>
        </div>
      </section>

      <section className="bg-white p-4 rounded">
        <h3 className="font-medium">Addresses</h3>
        <div className="mt-2 space-y-2">
          {addresses.map((a) => (
            <div key={a._id} className="p-2 border rounded flex justify-between items-center">
              <div>
                <div className="font-medium">{a.label || 'Address'}</div>
                <div className="text-sm">{a.address}, {a.city} {a.postalCode}, {a.country}</div>
                <div className="text-sm">{a.phone}</div>
              </div>
              <div>
                <button onClick={() => removeAddress(a._id)} className="text-red-500">Remove</button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <h4 className="font-medium">Add Address</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            <input placeholder="Label" value={addressForm.label} onChange={(e)=>setAddressForm({...addressForm,label:e.target.value})} className="border p-2 rounded" />
            <input placeholder="Address" value={addressForm.address} onChange={(e)=>setAddressForm({...addressForm,address:e.target.value})} className="border p-2 rounded" />
            <input placeholder="City" value={addressForm.city} onChange={(e)=>setAddressForm({...addressForm,city:e.target.value})} className="border p-2 rounded" />
            <input placeholder="Postal Code" value={addressForm.postalCode} onChange={(e)=>setAddressForm({...addressForm,postalCode:e.target.value})} className="border p-2 rounded" />
            <input placeholder="Country" value={addressForm.country} onChange={(e)=>setAddressForm({...addressForm,country:e.target.value})} className="border p-2 rounded" />
            <input placeholder="Phone" value={addressForm.phone} onChange={(e)=>setAddressForm({...addressForm,phone:e.target.value})} className="border p-2 rounded" />
          </div>
          <div className="mt-2">
            <button onClick={addAddress} className="bg-primary text-white rounded p-2">Add address</button>
          </div>
        </div>
      </section>
    </div>
  );
}
