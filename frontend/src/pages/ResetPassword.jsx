import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useSearchParams } from 'react-router-dom';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/reset-password', { token, password });
      setDone(true);
    } catch (err) {
      console.error(err);
      alert('Error resetting password');
    }
  };

  if (done) return <p className="text-center p-4">Password reset successful. You can now log in.</p>;

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow mt-8">
      <h2 className="text-xl font-semibold mb-4">Reset Password</h2>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">New Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-input" />
        </div>
        <button type="submit" className="btn w-full">Reset Password</button>
      </form>
    </div>
  );
}
