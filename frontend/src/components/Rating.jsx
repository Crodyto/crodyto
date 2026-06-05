import React from 'react';

export default function Rating({ value = 0, text = '' }) {
  const stars = [1, 2, 3, 4, 5].map((i) => (
    <span key={i} className="text-yellow-400">
      {value >= i ? '★' : value >= i - 0.5 ? '☆' : '☆'}
    </span>
  ));

  return (
    <div className="flex items-center gap-2">
      <div className="flex">{stars}</div>
      {text && <div className="text-sm text-gray-600">{text}</div>}
    </div>
  );
}
