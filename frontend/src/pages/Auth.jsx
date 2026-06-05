import React, { useState } from 'react';
import api, { setAuthToken } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [userId, setUserId] = useState(null);
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const { data } = await api.post('/auth/login', { email: form.email, password: form.password });
        login(data.token, data.user);
        navigate('/');
      } else {
        const { data } = await api.post('/auth/register', form);
        navigate(`/verify?userId=${data.userId}`);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Auth failed');
    }
  };

  const submitOtp = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/verify-otp', { userId, code: otp });
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'OTP failed');
    }
  };

  const handleGoogle = async () => {
    const email = window.prompt('Google email (mock)');
    const name = window.prompt('Name (mock)');
    if (!email) return;
    try {
      const { data } = await api.post('/auth/google', { email, name });
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Google login failed');
    }
  };

  

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow mt-8">
      <h2 className="text-xl font-semibold mb-4">{isLogin ? 'Login' : 'Register'}</h2>
      <form onSubmit={submit} className="space-y-3">
        {!isLogin && (
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input name="name" value={form.name} onChange={handleChange} className="form-input" />
          </div>
        )}
        {!isLogin && (
          <div>
            <label className="block text-sm mb-1">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} className="form-input" />
          </div>
        )}
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input name="email" value={form.email} onChange={handleChange} className="form-input" />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} className="form-input" />
        </div>
        <button type="submit" className="btn w-full">Submit</button>
      </form>
      <button onClick={() => setIsLogin((s) => !s)} className="mt-3 text-sm text-primary">{isLogin ? 'Switch to Register' : 'Switch to Login'}</button>
      <div className="mt-3">
        <button onClick={handleGoogle} className="btn w-full bg-gray-800">Sign in with Google (mock)</button>
      </div>
    </div>
  );
}
