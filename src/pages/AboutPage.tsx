import React from 'react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Про нас</h1>
          
          <div className="prose max-w-none">
            <p className="text-lg text-gray-600 mb-6">
              ShoeStore - це сучасний інтернет-магазин взуття, де кожен знайде ідеальну пару для себе.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4">Наша місія</h2>
            <p className="text-gray-600 mb-6">
              Ми прагнемо зробити якісне взуття доступним для кожного, пропонуючи широкий вибір моделей 
              від провідних брендів світу за справедливими цінами.
            </p>

            <h2 className="text-2xl font-semibold mb-4">Чому обирають нас</h2>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>Якісні матеріали та довговічність</li>
              <li>Широкий вибір розмірів та кольорів</li>
              <li>Зручна система повернення та обміну</li>
              <li>Швидка доставка по всій Україні</li>
              <li>Професійна консультація</li>
            </ul>

            <h2 className="text-2xl font-semibold mb-4">Контакти</h2>
            <div className="text-gray-600">
              <p>Телефон: +380 66 377 01 13</p>
              <p>Email: sasha.grosu4@gmail.com</p>
              <p>Адреса: Комарова</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};