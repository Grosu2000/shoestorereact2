import React, { useState } from 'react';
import { ProductGrid } from '../components/product/ProductGrid';
import { Input } from '../components/ui/Input';
import { useSearchParams } from 'react-router-dom';

export const ProductPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [brand, setBrand] = useState(searchParams.get('brand') || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (brand) params.set('brand', brand);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setBrand('');
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Каталог товарів</h1>

        {/* Фільтри */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Пошук товарів..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Input
                placeholder="Категорія (sneakers, sports...)"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
              <Input
                placeholder="Бренд (Nike, Adidas...)"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Пошук
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Очистити
              </button>
            </div>
          </form>
        </div>

        {/* Товари */}
        <ProductGrid 
          category={category || undefined}
          brand={brand || undefined}
          search={search || undefined}
        />
      </div>
    </div>
  );
};