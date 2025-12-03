import React from 'react';
import { ProductGrid } from '../components/product/ProductGrid';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero секція */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Найкращі кросівки 2024
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Відкрий для себе нову колекцію від провідних брендів
          </p>
          <Link
            to="/products"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Дивитися колекцію
          </Link>
        </div>
      </section>

      {/* Нові надходження */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Нові надходження</h2>
            <Link
              to="/products"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Дивитися всі →
            </Link>
          </div>
          <ProductGrid limit={8} />
        </div>
      </section>

      {/* Категорії */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">Популярні категорії</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CategoryCard 
              title="Кросівки"
              description="Для спорту та повсякденності"
              image="/images/category-sneakers.jpg"
              to="/products?category=sneakers"
            />
            <CategoryCard 
              title="Кеди"
              description="Класика та стиль"
              image="/images/category-sneakers.jpg"
              to="/products?category=sneakers"
            />
            <CategoryCard 
              title="Бутси"
              description="Для професійного спорту"
              image="/images/category-sneakers.jpg"
              to="/products?category=sports"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const CategoryCard: React.FC<{
  title: string;
  description: string;
  image: string;
  to: string;
}> = ({ title, description, image, to }) => (
  <Link
    to={to}
    className="group block bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition"
  >
    <div className="h-48 bg-gray-200 overflow-hidden">
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
    </div>
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  </Link>
);