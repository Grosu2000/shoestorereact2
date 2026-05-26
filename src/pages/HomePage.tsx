import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ProductGrid } from '../components/product/ProductGrid';
import { api } from '../services/api';
import type { Product } from '../types/product';

export const HomePage: React.FC = () => {
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get<any>('/products');
        const products = response.data || response;
        
        // Отримуємо товари, які додані за останні 30 днів
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const filtered = products.filter((product: Product) => {
          if (!product.createdAt) return false;
          const productDate = new Date(product.createdAt);
          return productDate >= thirtyDaysAgo;
        }).slice(0, 8);

        setNewProducts(filtered);
      } catch (error) {
        console.error('Error fetching products:', error);
        setNewProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNewProducts();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero секція - оновлений стиль */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-[#2C3E4E] mb-5">
            Взуття, яке обирають
          </h1>
          <p className="text-lg text-[#6B7B8C] max-w-2xl mx-auto mb-8">
            Мінімалізм. Якість. Класика. Дихаючі матеріали та довговічність.
          </p>
          <Link
            to="/products"
            className="inline-block bg-button text-text px-8 py-3 rounded-full font-medium hover:bg-button-hover transition-all hover:-translate-y-0.5"
          >
            Дивитися колекцію
          </Link>
        </div>
      </section>

      <div className="container mx-auto px-4">
        {/* Категорії */}
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-8">
          Категорії
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Link
            to="/products?category=Кросівки"
            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
          >
            <div className="h-48 bg-accent flex items-center justify-center text-4xl text-text">
              👟
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-1">Кросівки</h3>
              <p className="text-text/60 text-sm">Зручність на кожен день</p>
            </div>
          </Link>

          <Link
            to="/products?category=Черевики"
            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
          >
            <div className="h-48 bg-accent flex items-center justify-center text-4xl text-text">
              👞
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-1">Черевики</h3>
              <p className="text-text/60 text-sm">Міцність та стиль</p>
            </div>
          </Link>

          <Link
            to="/products?category=Трекінг"
            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
          >
            <div className="h-48 bg-accent flex items-center justify-center text-4xl text-text">
              🥾
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-1">Трекінг</h3>
              <p className="text-text/60 text-sm">Для активного відпочинку</p>
            </div>
          </Link>
        </div>

        {/* Нові надходження */}
        <div className="flex justify-between items-baseline mb-8 flex-wrap gap-4">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Нові надходження
          </h2>
          <Link
            to="/products"
            className="text-text font-medium hover:opacity-70 transition"
          >
            Всі моделі →
          </Link>
        </div>

        <ProductGrid products={newProducts} />

        {/* Банер з перевагами */}
        <div className="bg-accent rounded-3xl py-12 px-6 md:px-12 my-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl mb-3">📦</div>
              <div className="font-semibold text-text">Безкоштовна доставка</div>
              <div className="text-sm text-text/60">При замовленні від 2000 грн</div>
            </div>
            <div>
              <div className="text-3xl mb-3">🔄</div>
              <div className="font-semibold text-text">30 днів на повернення</div>
              <div className="text-sm text-text/60">Гарантія якості</div>
            </div>
            <div>
              <div className="text-3xl mb-3">🔒</div>
              <div className="font-semibold text-text">Безпечна оплата</div>
              <div className="text-sm text-text/60">LiqPay / Карткою</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};