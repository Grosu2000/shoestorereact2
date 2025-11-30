import React from 'react';
import { useCartStore } from '../stores/cart-store';
import { Button } from '../components/ui/Button';

export const CartPage: React.FC = () => {
  const { cart, updateQuantity, removeItem, clearCart } = useCartStore();

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Кошик порожній</h1>
            <p className="text-gray-600 mb-8">Додайте товари до кошика, щоб зробити покупку</p>
            <Button 
              onClick={() => window.location.href = '/products'}
              size="lg"
            >
              Перейти до товарів
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Кошик</h1>
          <Button 
            variant="outline" 
            onClick={clearCart}
          >
            Очистити кошик
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {cart.items.map((item) => (
            <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`} 
                 className="border-b border-gray-200 last:border-b-0">
              <div className="p-6 flex flex-col md:flex-row gap-4">
                <div className="flex-shrink-0">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                </div>
                
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-gray-900">{item.product.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">{item.product.brand}</p>
                  
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                    <span>Розмір: {item.selectedSize}</span>
                    <span>Колір: {item.selectedColor}</span>
                    <span>Ціна: {item.product.price} грн</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => updateQuantity(
                        item.product.id, 
                        item.selectedSize, 
                        item.selectedColor, 
                        item.quantity - 1
                      )}
                      className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-gray-900">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(
                        item.product.id, 
                        item.selectedSize, 
                        item.selectedColor, 
                        item.quantity + 1
                      )}
                      className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right min-w-20">
                    <div className="text-lg font-semibold text-gray-900">
                      {item.product.price * item.quantity} грн
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.product.id, item.selectedSize, item.selectedColor)}
                    className="text-red-600 hover:text-red-800 p-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <div className="space-y-3">
            <div className="flex justify-between text-lg">
              <span>Всього товарів:</span>
              <span>{cart.itemCount} шт.</span>
            </div>
            <div className="flex justify-between text-xl font-bold">
              <span>Загальна сума:</span>
              <span>{cart.total} грн</span>
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <Button 
              onClick={() => window.location.href = '/products'}
              variant="outline"
              className="flex-1"
            >
              Продовжити покупки
            </Button>
            <Button className="flex-1">
              Оформити замовлення
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};