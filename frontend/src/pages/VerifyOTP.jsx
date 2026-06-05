import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function VerifyOTP() {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState(null);
  const [cooldown, setCooldown] = useState(60);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    let t;
    if (cooldown > 0) {
      t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(t);
  }, [cooldown]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/verify-otp', { userId, code });
      setMessage({ type: 'success', text: 'Verified — signing in...' });
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Verification failed' });
    }
  };

  const resend = async () => {
    try {
      await api.post('/auth/resend-otp', { userId });
      setMessage({ type: 'success', text: 'OTP resent' });
      setCooldown(60);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Resend failed' });
    }
  };

  if (!userId) return <div className="max-w-md mx-auto p-6 mt-8 bg-white rounded">No user specified.</div>;

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow mt-8">
      <h2 className="text-xl font-semibold mb-4">Verify OTP</h2>
      {message && (
        <div className={`p-2 mb-3 ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message.text}</div>
      )}
      <form onSubmit={submit}>
        <div className="mb-3">
          <label className="block text-sm mb-1">OTP</label>
          <input value={code} onChange={(e) => setCode(e.target.value)} className="form-input" />
        </div>
        <button type="submit" className="btn w-full">Verify</button>
      </form>
      <div className="mt-4 text-center">
        <button onClick={resend} disabled={cooldown > 0} className="text-sm text-primary underline">
          {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
        </button>
      </div>
    </div>
  );
}
