import React, { useEffect, useState } from 'react';

export default function DealOfDay({ product }) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    // deal lasts until next midnight UTC
    const now = Date.now();
    const tomorrow = new Date();
    tomorrow.setUTCHours(24, 0, 0, 0);
    const target = tomorrow.getTime();
    setTimeLeft(Math.max(0, target - now));
    const t = setInterval(() => setTimeLeft((prev) => Math.max(0, prev - 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  const format = (ms) => {
    const s = Math.floor(ms / 1000);
    const h = String(Math.floor(s / 3600)).padStart(2, '0');
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  if (!product) return null;

  return (
    <section className="mt-10 bg-gradient-to-r from-white to-yellow-50 p-6 rounded-lg shadow-md flex flex-col md:flex-row gap-6 items-center">
      <div className="flex-1">
        <h3 className="text-2xl font-semibold">Deal of the Day</h3>
        <p className="mt-2 text-sm text-gray-600">Limited time offer — ends soon</p>
        <div className="mt-4 flex items-center gap-6">
          <div className="w-40 h-40 bg-gray-100 rounded-lg overflow-hidden">
            <img src={product.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=60&auto=format&fit=crop'} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <h4 className="font-semibold">{product.name}</h4>
            <p className="text-lg text-accent font-bold mt-1">${product.price}</p>
            <div className="mt-3 text-sm">Ends in: <span className="font-mono">{format(timeLeft)}</span></div>
          </div>
        </div>
      </div>
      <div>
        <button className="bg-accent text-white px-5 py-3 rounded-md">Buy Now</button>
      </div>
    </section>
  );
}
