import React, { useState } from 'react';
import api from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      console.error(err);
      alert('Error sending reset link');
    }
  };

  if (sent) return <p className="text-center p-4">If that email exists, a reset link was sent.</p>;

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow mt-8">
      <h2 className="text-xl font-semibold mb-4">Forgot Password</h2>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="form-input" />
        </div>
        <button type="submit" className="btn w-full">Send Reset Link</button>
      </form>
    </div>
  );
}
