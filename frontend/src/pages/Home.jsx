import React, { useEffect, useState } from 'react';
import api from '../services/api';
import BannerSlider from '../components/BannerSlider';
import CategoryList from '../components/CategoryList';
import FeaturedProducts from '../components/FeaturedProducts';
import DealOfDay from '../components/DealOfDay';
import SearchBar from '../components/SearchBar';
import FilterSidebar from '../components/FilterSidebar';
import useDebounce from '../hooks/useDebounce';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [filters, setFilters] = useState({});
  const [categories, setCategories] = useState([]);

  // fetch products when search or filters change
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const params = {};
    if (debouncedSearch) params.q = debouncedSearch;
    if (filters.minPrice != null) params.minPrice = filters.minPrice;
    if (filters.maxPrice != null) params.maxPrice = filters.maxPrice;
    if (filters.category) params.category = filters.category;
    if (filters.minRating != null) params.minRating = filters.minRating;
    if (filters.sort) params.sort = filters.sort;

    api
      .get('/products', { params })
      .then((res) => {
        if (mounted) {
          setProducts(res.data || []);
          // derive categories from returned products for sidebar options
          const cats = Array.from(new Set((res.data || []).map((p) => p.category).filter(Boolean)));
          setCategories(cats);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => mounted && setLoading(false));

    return () => (mounted = false);
  }, [debouncedSearch, filters]);

  const featured = products.slice(0, 6);
  const deal = products.length ? products[0] : null;

  return (
    <div>
      <BannerSlider />
      <CategoryList />

      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <FilterSidebar filters={filters} onChange={setFilters} categories={categories} />
        </div>
        <div className="md:col-span-3">
          <div className="mb-4">
            <SearchBar value={search} onChange={setSearch} />
          </div>

          <div className="mt-4">
            {loading ? <p>Loading products...</p> : <FeaturedProducts products={featured} />}
          </div>

          <div className="mt-6">
            <DealOfDay product={deal} />
          </div>
        </div>
      </div>
    </div>
  );
}
