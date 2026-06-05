import React from 'react';

const categories = [
  { id: '1', name: 'Clothing' },
  { id: '2', name: 'Electronics' },
  { id: '3', name: 'Home' },
  { id: '4', name: 'Beauty' },
  { id: '5', name: 'Sports' }
];

export default function CategoryList() {
  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Shop by Category</h3>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {categories.map((c) => (
          <div key={c.id} className="bg-white p-4 rounded-lg shadow-sm text-center hover:shadow-md">
            <div className="h-12 w-12 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-2">🏷️</div>
            <div className="text-sm font-medium">{c.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
