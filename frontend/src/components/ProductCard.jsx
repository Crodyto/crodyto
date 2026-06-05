import React from 'react';
import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition p-4 flex flex-col">
      <div className="h-40 bg-gray-100 rounded-md overflow-hidden">
        <img
          src={product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=60&auto=format&fit=crop'}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="mt-3 flex-1">
        <h4 className="font-medium text-lg">{product.name}</h4>
        <p className="text-sm text-gray-500 mt-1">{product.description}</p>
        <div className="text-xs text-gray-400 mt-2 flex items-center gap-3">
          {product.category && <span>{product.category}</span>}
          {product.rating != null && <span>⭐ {product.rating}</span>}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="text-accent font-bold text-lg">${product.price}</div>
        <Link to={`/product/${product._id}`} className="text-sm text-primary hover:underline">
          View
        </Link>
      </div>
    </div>
  );
}
