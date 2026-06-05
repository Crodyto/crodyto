import React from 'react';

export default function SearchBar({ value, onChange, placeholder = 'Search products...' }) {
  return (
    <div className="w-full">
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />
    </div>
  );
}
