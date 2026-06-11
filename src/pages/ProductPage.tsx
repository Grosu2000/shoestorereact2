import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { ProductGrid } from '../components/product/ProductGrid';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const ProductPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [brand, setBrand] = useState(searchParams.get('brand') || '');
  const [showFilters, setShowFilters] = useState(false);

  const { data: products, isLoading, refetch } = useProducts({ category, brand, search });

  useEffect(() => {
    refetch();
  }, [category, brand, search, refetch]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'products-updated') {
        console.log('🔄 Products updated from another tab, refetching...');
        refetch();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refetch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (brand) params.set('brand', brand);
    setSearchParams(params);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setBrand('');
    setSearchParams(new URLSearchParams());
    setShowFilters(false);
  };

  return (
    <div className="min-h-screen bg-background py-6 sm:py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8">Каталог товарів</h1>

        <div className="block lg:hidden mb-4">
          <Button onClick={() => setShowFilters(!showFilters)} variant="outline" className="w-full flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {showFilters ? 'Сховати фільтри' : 'Показати фільтри'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl shadow-soft border border-accent p-5 sticky top-24 space-y-5">
              <h3 className="font-semibold text-lg pb-2 border-b border-accent">Фільтри</h3>
              <form onSubmit={handleSearch} className="space-y-4">
                <Input placeholder="Пошук товарів..." value={search} onChange={(e) => setSearch(e.target.value)} />
                <Input placeholder="Категорія (sneakers, boots...)" value={category} onChange={(e) => setCategory(e.target.value)} />
                <Input placeholder="Бренд (Nike, Adidas...)" value={brand} onChange={(e) => setBrand(e.target.value)} />
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button type="submit" className="flex-1">Пошук</Button>
                  <Button type="button" variant="outline" onClick={clearFilters} className="flex-1">Очистити</Button>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-button border-t-transparent rounded-full animate-spin" /></div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2"><p className="text-sm text-text/60">Знайдено товарів: {products?.length || 0}</p></div>
                <ProductGrid products={products} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};