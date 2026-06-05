import React from 'react';
import ProductCard from './ProductCard';

export default function FeaturedProducts({ products = [] }) {
  return (
    <section className="mt-10">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-semibold">Featured Products</h3>
        <a href="#" className="text-sm text-primary hover:underline">
          See all
        </a>
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </section>
  );
}
