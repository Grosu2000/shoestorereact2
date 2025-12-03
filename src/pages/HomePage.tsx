import React from 'react';
import { Button } from '../components/ui/Button';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Найкраще взуття для вашого стилю
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Відкрий для себе колекцію преміум взуття від провідних брендів світу
            </p>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Перейти до покупок
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Популярні категорії</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Оберіть ідеальну пару для будь-якого випадку</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-lg p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-gray-600">КС</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Кросівки</h3>
              <p className="text-gray-600">Спортивне взуття для активного способу життя</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-gray-600">КВ</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Класичне взуття</h3>
              <p className="text-gray-600">Елегантні моделі для ділового стилю</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-gray-600">ЧВ</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Черевики</h3>
              <p className="text-gray-600">Міцне взуття для активного відпочинку</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Чому обирають нас</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-semibold text-gray-600">Д</span>
              </div>
              <h3 className="font-semibold mb-2">Безкоштовна доставка</h3>
              <p className="text-sm text-gray-600">При замовленні від 1000 грн</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-semibold text-gray-600">П</span>
              </div>
              <h3 className="font-semibold mb-2">Легке повернення</h3>
              <p className="text-sm text-gray-600">30 днів на повернення</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-semibold text-gray-600">О</span>
              </div>
              <h3 className="font-semibold mb-2">Безпечна оплата</h3>
              <p className="text-sm text-gray-600">Захищені платежі</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-semibold text-gray-600">П</span>
              </div>
              <h3 className="font-semibold mb-2">Підтримка 24/7</h3>
              <p className="text-sm text-gray-600">Завжди готові допомогти</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};