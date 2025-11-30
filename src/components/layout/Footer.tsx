import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">ShoeStore</h3>
            <p className="text-gray-400">Найкраще взуття для вас</p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Магазин</h4>
            <ul className="space-y-2">
              <li><a href="/products" className="text-gray-400 hover:text-white">Всі товари</a></li>
              <li><a href="/new" className="text-gray-400 hover:text-white">Новинки</a></li>
              <li><a href="/sale" className="text-gray-400 hover:text-white">Розпродаж</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Допомога</h4>
            <ul className="space-y-2">
              <li><a href="/shipping" className="text-gray-400 hover:text-white">Доставка</a></li>
              <li><a href="/returns" className="text-gray-400 hover:text-white">Повернення</a></li>
              <li><a href="/contact" className="text-gray-400 hover:text-white">Контакти</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Контакти</h4>
            <p className="text-gray-400">+380 66 377 01 13</p>
            <p className="text-gray-400">sasha.grosu4@gmail.com</p>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>&copy; 2024 ShoeStore. Всі права захищені.</p>
        </div>
      </div>
    </footer>
  );
};