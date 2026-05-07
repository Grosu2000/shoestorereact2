import React from 'react';
import { Link } from 'react-router-dom';
import { ProductGrid } from '../components/product/ProductGrid';

export const HomePage: React.FC = () => {
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
            to="/products?category=sneakers"
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
            to="/products?category=boots"
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
            to="/products?category=outdoor"
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

        <ProductGrid limit={8} />

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