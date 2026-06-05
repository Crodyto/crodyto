import React, { useEffect, useState } from 'react';

const images = [
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1503602642458-232111445657?w=1400&q=80&auto=format&fit=crop'
];

export default function BannerSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % images.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative rounded-lg overflow-hidden shadow-md">
      <img src={images[index]} alt="banner" className="block w-full h-64 md:h-96 object-cover" />
      <div className="absolute inset-0 bg-black/25 flex items-center">
        <div className="text-white ml-6 md:ml-12">
          <h2 className="text-2xl md:text-4xl font-bold">Summer Collection</h2>
          <p className="mt-2 hidden md:block">Discover latest trends and shop top picks for the season.</p>
        </div>
      </div>
      <div className="absolute bottom-3 right-3 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-3 h-3 rounded-full ${i === index ? 'bg-white' : 'bg-white/60'}`}
          />
        ))}
      </div>
    </div>
  );
}
