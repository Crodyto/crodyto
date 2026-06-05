import React from 'react';
import ProductCard from './ProductCard';

export default function ProductList({ items }) {
  if (!items || items.length === 0) return <p>No products found</p>;
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {items.map((p) => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>
  );
}
