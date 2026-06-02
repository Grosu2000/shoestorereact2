import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProductStore } from '../stores/product-store';
import { ProductCard } from '../components/product/ProductCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const HomePage: React.FC = () => {
  const { products, isLoading, fetchProducts } = useProductStore();
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    fetchProducts();
    
    // Слухаємо подію оновлення товарів з адмінки
    const handleProductsUpdate = () => {
      console.log('Products updated from admin, refetching...');
      fetchProducts();
    };
    
    window.addEventListener('products-updated', handleProductsUpdate);
    
    return () => {
      window.removeEventListener('products-updated', handleProductsUpdate);
    };
  }, []);

  // Нові товари (останні 8)
  const newProducts = products.slice(0, 8);

  // Категорії для навігації
  const categories = [
    { id: 'all', name: 'Всі', icon: '👟' },
    { id: 'sneakers', name: 'Кросівки', icon: '👟' },
    { id: 'boots', name: 'Черевики', icon: '👞' },
    { id: 'loafers', name: 'Лофери', icon: '👞' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      
      {/* HERO СЕКЦІЯ - СВІТЛИЙ ФОН + НЕЙТРАЛЬНЕ ФОТО КРОСІВКА */}
      <section className="relative bg-background overflow-hidden border-b border-accent">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Ліва частина - текст */}
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight text-text">
                STEP
              </h1>
              <p className="text-xl md:text-2xl mb-4 text-text/80 font-light">
                Крокуй у стилі
              </p>
              <p className="text-base md:text-lg mb-8 text-text/60 max-w-lg">
                Преміальне взуття, яке дарує комфорт і впевненість кожен день
              </p>
              <Link 
                to="/products" 
                className="inline-block bg-button text-text px-8 py-3 rounded-full font-semibold hover:bg-button-hover transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Переглянути колекцію
              </Link>
            </div>
            
            {/* Права частина - нейтральне фото кросівка (без бренду) */}
            <div className="hidden md:block">
              <img 
                src="https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=600" 
                alt="Кросівки"
                className="w-full max-w-md mx-auto object-contain rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* КАТЕГОРІЇ */}
      <section className="py-10 border-b border-accent">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2 rounded-full font-medium transition-all duration-300 ${
                  activeCategory === cat.id
                    ? 'bg-button text-text shadow-sm'
                    : 'text-text/70 hover:text-text'
                }`}
              >
                <span className="mr-1">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* НОВІ НАДХОДЖЕННЯ */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-text">Нові надходження</h2>
              <p className="text-text/60 mt-1">Свіжі моделі цього сезону</p>
            </div>
            <Link to="/products" className="text-button hover:text-button-hover font-medium transition flex items-center gap-1">
              Всі товари
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ПЕРЕВАГИ */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-button/15 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-button" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-medium text-text">Безкоштовна доставка</h3>
              <p className="text-sm text-text/50">при замовленні від 2000 грн</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-button/15 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-button" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="font-medium text-text">30 днів на повернення</h3>
              <p className="text-sm text-text/50">гарантія якості</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-button/15 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-button" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-medium text-text">Безпечна оплата</h3>
              <p className="text-sm text-text/50">LiqPay / карта / готівка</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-button/15 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-button" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18.364 5.636L9.172 14.828M9.172 5.636L18.364 14.828M12 21a9 9 0 110-18 9 9 0 010 18z" />
                </svg>
              </div>
              <h3 className="font-medium text-text">Підтримка 24/7</h3>
              <p className="text-sm text-text/50">онлайн чат та телефон</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};