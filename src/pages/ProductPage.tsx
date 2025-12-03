import React, { useState, useMemo } from 'react';
import { ProductGrid } from '../components/product/ProductGrid';
import { mockProducts } from '../utils/constants';
import type { Product } from '../types/product';
import { Input } from '../components/ui/Input';

export const ProductPage: React.FC = () => {
  const [products] = useState<Product[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [sortBy, setSortBy] = useState<string>('name');

  const categories = ['Всі', ...new Set(products.map(p => p.category))];
  const brands = ['Всі', ...new Set(products.map(p => p.brand))];

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === '' || selectedCategory === 'Всі' || product.category === selectedCategory;
      const matchesBrand = selectedBrand === '' || selectedBrand === 'Всі' || product.brand === selectedBrand;
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];

      return matchesSearch && matchesCategory && matchesBrand && matchesPrice;
    });
  }, [products, searchTerm, selectedCategory, selectedBrand, priceRange]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });
  }, [filteredProducts, sortBy]);

  const maxPrice = Math.max(...products.map(p => p.price));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Каталог товарів</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Пошук</h3>
                  <Input
                    placeholder="Пошук товарів..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Категорія</h3>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Бренд</h3>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {brands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">
                    Ціна: {priceRange[0]} - {priceRange[1]} грн
                  </h3>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max={maxPrice}
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>0 грн</span>
                      <span>{maxPrice} грн</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                    setSelectedBrand('');
                    setPriceRange([0, maxPrice]);
                  }}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Скинути фільтри
                </button>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="text-sm text-gray-600">
                  Знайдено товарів: {sortedProducts.length}
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="name">За назвою</option>
                  <option value="price-low">Від дешевших</option>
                  <option value="price-high">Від дорожчих</option>
                  <option value="rating">За рейтингом</option>
                  <option value="newest">Спочатку новіші</option>
                </select>
              </div>

              <ProductGrid products={sortedProducts} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};