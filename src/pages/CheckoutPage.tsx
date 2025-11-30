import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/cart-store';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const CheckoutPage: React.FC = () => {
  const { cart, clearCart } = useCartStore();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    paymentMethod: 'card'
  });

  const [isProcessing, setIsProcessing] = useState(false);

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Кошик порожній</h1>
          <Link to="/products">
            <Button>Перейти до товарів</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Имитация обработки заказа
    setTimeout(() => {
      console.log('Order data:', { ...formData, cart });
      alert('Замовлення успішно оформлено!');
      clearCart();
      navigate('/');
      setIsProcessing(false);
    }, 2000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const deliveryCost = 50;
  const totalWithDelivery = cart.total + deliveryCost;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Оформлення замовлення</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Форма заказа */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Контактна інформація</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Ім'я"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Прізвище"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />

              <Input
                label="Телефон"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />

              <Input
                label="Адреса доставки"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Місто"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Поштовий індекс"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Спосіб оплати
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="card">Банківська карта</option>
                  <option value="cash">Готівка при отриманні</option>
                  <option value="liqpay">LiqPay</option>
                </select>
              </div>

              <Button
                type="submit"
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? 'Обробка замовлення...' : 'Підтвердити замовлення'}
              </Button>
            </form>
          </div>

          {/* Підсумок замовлення */}
          <div className="bg-white p-6 rounded-lg shadow-sm h-fit">
            <h2 className="text-xl font-semibold mb-6">Ваше замовлення</h2>
            
            <div className="space-y-4 mb-6">
              {cart.items.map((item) => (
                <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`} 
                     className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                    <p className="text-sm text-gray-600">
                      {item.selectedSize} • {item.selectedColor} • {item.quantity} шт.
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      {item.product.price * item.quantity} грн
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Товари:</span>
                <span>{cart.total} грн</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Доставка:</span>
                <span>{deliveryCost} грн</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                <span>Всього:</span>
                <span>{totalWithDelivery} грн</span>
              </div>
            </div>

            <div className="mt-6">
              <Link to="/cart">
                <Button variant="outline" className="w-full">
                  Повернутися до кошика
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};