import React from 'react';

export default function FilterSidebar({ filters, onChange, categories = [] }) {
  const set = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <aside className="w-full md:w-64 p-4 bg-white rounded-lg shadow-sm md:sticky md:top-20">
      <h3 className="font-semibold mb-3">Filters</h3>

      <div className="mb-3">
        <label className="text-sm">Category</label>
        <select
          value={filters.category || ''}
          onChange={(e) => set('category', e.target.value || undefined)}
          className="w-full mt-1 border rounded-md p-2"
        >
          <option value="">All</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="text-sm">Price</label>
        <div className="flex gap-2 mt-1">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice ?? ''}
            onChange={(e) => set('minPrice', e.target.value ? Number(e.target.value) : undefined)}
            className="w-1/2 border rounded-md p-2"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice ?? ''}
            onChange={(e) => set('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
            className="w-1/2 border rounded-md p-2"
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="text-sm">Minimum rating</label>
        <select
          value={filters.minRating ?? ''}
          onChange={(e) => set('minRating', e.target.value ? Number(e.target.value) : undefined)}
          className="w-full mt-1 border rounded-md p-2"
        >
          <option value="">Any</option>
          <option value={4}>4+</option>
          <option value={3}>3+</option>
          <option value={2}>2+</option>
          <option value={1}>1+</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="text-sm">Sort</label>
        <select
          value={filters.sort || ''}
          onChange={(e) => set('sort', e.target.value || undefined)}
          className="w-full mt-1 border rounded-md p-2"
        >
          <option value="">Newest</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
        </select>
      </div>

      <button
        onClick={() => onChange({})}
        className="mt-2 w-full bg-gray-100 hover:bg-gray-200 rounded-md p-2 text-sm"
      >
        Clear filters
      </button>
    </aside>
  );
}
