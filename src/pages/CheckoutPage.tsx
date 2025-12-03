import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useCartStore } from '../stores/cart-store';
import { useAuthStore } from '../stores/auth-store';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../contexts/ToastContext';

// LiqPay тип
interface LiqPayConfig {
  data: string;
  signature: string;
}

interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  paymentMethod: 'card' | 'cash' | 'liqpay';
  deliveryMethod: 'nova-poshta' | 'ukr-poshta' | 'courier';
  notes?: string;
}

export const CheckoutPage: React.FC = () => {
  const { cart, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [liqPayConfig, setLiqPayConfig] = useState<LiqPayConfig | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm<CheckoutFormData>({
    defaultValues: {
      firstName: user?.name?.split(' ')[0] || '',
      lastName: user?.name?.split(' ')[1] || '',
      email: user?.email || '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      paymentMethod: 'card',
      deliveryMethod: 'nova-poshta'
    }
  });

  const selectedPaymentMethod = watch('paymentMethod');
  const deliveryCost = watch('deliveryMethod') === 'courier' ? 100 : 50;
  const totalWithDelivery = cart.total + deliveryCost;

  // Створення замовлення
  const createOrder = async (formData: CheckoutFormData) => {
    try {
      const orderData = {
        items: cart.items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          size: item.selectedSize,
          color: item.selectedColor,
          price: item.product.price
        })),
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode
        },
        deliveryMethod: formData.deliveryMethod,
        paymentMethod: formData.paymentMethod,
        total: totalWithDelivery,
        notes: formData.notes
      };

      // Відправка на бекенд
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) throw new Error('Order creation failed');
      
      return await response.json();
    } catch (error) {
      console.error('Order creation error:', error);
      throw error;
    }
  };

  // Оплата через LiqPay
  const handleLiqPayPayment = async (orderId: string, amount: number) => {
    try {
      const response = await fetch('/api/payment/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          orderId,
          amount,
          description: `Оплата замовлення #${orderId}`
        })
      });

      if (!response.ok) throw new Error('Payment creation failed');
      
      const { data } = await response.json();
      setLiqPayConfig(data);
      
      // Автоматична відправка форми LiqPay
      setTimeout(() => {
        const form = document.getElementById('liqpay-form') as HTMLFormElement;
        if (form) form.submit();
      }, 100);
      
    } catch (error) {
      showToast('Помилка створення оплати', 'error');
      setIsProcessing(false);
    }
  };

  const onSubmit = async (formData: CheckoutFormData) => {
    if (cart.items.length === 0) {
      showToast('Кошик порожній', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Створити замовлення
      const orderResult = await createOrder(formData);
      const orderId = orderResult.data.id;

      // 2. Обробка оплати в залежності від методу
      if (formData.paymentMethod === 'liqpay') {
        // Оплата через LiqPay
        await handleLiqPayPayment(orderId, totalWithDelivery);
      } else if (formData.paymentMethod === 'cash') {
        // Оплата готівкою
        showToast('Замовлення створено! Оплата при отриманні.', 'success');
        clearCart();
        navigate(`/order-success/${orderId}`);
      } else {
        // Карткова оплата (тут можна додати інші платежні системи)
        showToast('Замовлення створено! Перенаправляємо на оплату...', 'success');
        // Тут можна додати іншу платіжну систему
        clearCart();
        navigate(`/order-success/${orderId}`);
      }

    } catch (error) {
      showToast('Помилка оформлення замовлення', 'error');
      setIsProcessing(false);
    }
  };

  // Якщо LiqPay конфігурація готова - показуємо форму
  if (liqPayConfig) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Перенаправлення на оплату...</h2>
          <p className="text-gray-600 mb-8">Будь ласка, зачекайте, відкривається сторінка оплати</p>
          
          {/* Прихована форма LiqPay */}
          <form 
            id="liqpay-form"
            method="POST" 
            action="https://www.liqpay.ua/api/3/checkout" 
            acceptCharset="utf-8"
            style={{ display: 'none' }}
          >
            <input type="hidden" name="data" value={liqPayConfig.data} />
            <input type="hidden" name="signature" value={liqPayConfig.signature} />
          </form>
          
          <div className="animate-pulse">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Хлібні крихти */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><Link to="/" className="hover:text-gray-700">Головна</Link></li>
            <li>/</li>
            <li><Link to="/cart" className="hover:text-gray-700">Кошик</Link></li>
            <li>/</li>
            <li className="text-gray-900 font-medium">Оформлення</li>
          </ol>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Оформлення замовлення</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Форма замовлення */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Контактна інформація */}
                <section>
                  <h2 className="text-xl font-semibold mb-4 text-gray-900">
                    Контактна інформація
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Ім'я *"
                      {...register('firstName', { required: "Введіть ім'я" })}
                      error={errors.firstName?.message}
                    />
                    <Input
                      label="Прізвище *"
                      {...register('lastName', { required: 'Введіть прізвище' })}
                      error={errors.lastName?.message}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <Input
                      label="Email *"
                      type="email"
                      {...register('email', { 
                        required: 'Введіть email',
                        pattern: {
                          value: /^\S+@\S+\.\S+$/,
                          message: 'Невірний формат email'
                        }
                      })}
                      error={errors.email?.message}
                    />
                    <Input
                      label="Телефон *"
                      {...register('phone', { 
                        required: 'Введіть телефон',
                        pattern: {
                          value: /^[\+]?[0-9\s\-\(\)]{10,}$/,
                          message: 'Невірний формат телефону'
                        }
                      })}
                      error={errors.phone?.message}
                    />
                  </div>
                </section>

                {/* Адреса доставки */}
                <section>
                  <h2 className="text-xl font-semibold mb-4 text-gray-900">
                    Адреса доставки
                  </h2>
                  <Input
                    label="Адреса *"
                    placeholder="Вулиця, будинок, квартира"
                    {...register('address', { required: 'Введіть адресу' })}
                    error={errors.address?.message}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <Input
                      label="Місто *"
                      {...register('city', { required: 'Введіть місто' })}
                      error={errors.city?.message}
                    />
                    <Input
                      label="Поштовий індекс"
                      {...register('postalCode')}
                      error={errors.postalCode?.message}
                    />
                  </div>
                </section>

                {/* Спосіб доставки */}
                <section>
                  <h2 className="text-xl font-semibold mb-4 text-gray-900">
                    Спосіб доставки
                  </h2>
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border border-gray-300 rounded-lg hover:border-blue-500 cursor-pointer">
                      <input
                        type="radio"
                        value="nova-poshta"
                        {...register('deliveryMethod')}
                        className="h-4 w-4 text-blue-600"
                      />
                      <div className="ml-3">
                        <span className="font-medium">Нова Пошта</span>
                        <p className="text-sm text-gray-500">Відділення або поштомат • 50 грн • 1-3 дні</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-4 border border-gray-300 rounded-lg hover:border-blue-500 cursor-pointer">
                      <input
                        type="radio"
                        value="ukr-poshta"
                        {...register('deliveryMethod')}
                        className="h-4 w-4 text-blue-600"
                      />
                      <div className="ml-3">
                        <span className="font-medium">Укрпошта</span>
                        <p className="text-sm text-gray-500">Відділення • 40 грн • 3-7 днів</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-4 border border-gray-300 rounded-lg hover:border-blue-500 cursor-pointer">
                      <input
                        type="radio"
                        value="courier"
                        {...register('deliveryMethod')}
                        className="h-4 w-4 text-blue-600"
                      />
                      <div className="ml-3">
                        <span className="font-medium">Кур'єр</span>
                        <p className="text-sm text-gray-500">Адресна доставка • 100 грн • 1-2 дні</p>
                      </div>
                    </label>
                  </div>
                </section>

                {/* Спосіб оплати */}
                <section>
                  <h2 className="text-xl font-semibold mb-4 text-gray-900">
                    Спосіб оплати
                  </h2>
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border border-gray-300 rounded-lg hover:border-blue-500 cursor-pointer">
                      <input
                        type="radio"
                        value="card"
                        {...register('paymentMethod')}
                        className="h-4 w-4 text-blue-600"
                      />
                      <div className="ml-3">
                        <span className="font-medium">Банківська карта</span>
                        <p className="text-sm text-gray-500">Visa, Mastercard • Миттєва оплата</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-4 border border-gray-300 rounded-lg hover:border-blue-500 cursor-pointer">
                      <input
                        type="radio"
                        value="liqpay"
                        {...register('paymentMethod')}
                        className="h-4 w-4 text-blue-600"
                      />
                      <div className="ml-3">
                        <span className="font-medium">LiqPay</span>
                        <p className="text-sm text-gray-500">Карта, Google Pay, Apple Pay • Комісія 2.75%</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-4 border border-gray-300 rounded-lg hover:border-blue-500 cursor-pointer">
                      <input
                        type="radio"
                        value="cash"
                        {...register('paymentMethod')}
                        className="h-4 w-4 text-blue-600"
                      />
                      <div className="ml-3">
                        <span className="font-medium">Готівка при отриманні</span>
                        <p className="text-sm text-gray-500">Оплата кур'єру або в відділенні</p>
                      </div>
                    </label>
                  </div>
                </section>

                {/* Коментар */}
                <section>
                  <h2 className="text-xl font-semibold mb-4 text-gray-900">
                    Додаткова інформація
                  </h2>
                  <textarea
                    {...register('notes')}
                    placeholder="Коментар до замовлення (необов'язково)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
                    rows={3}
                  />
                </section>

                <Button
                  type="submit"
                  disabled={isSubmitting || isProcessing || cart.items.length === 0}
                  className="w-full py-4 text-lg font-medium"
                  size="lg"
                >
                  {isProcessing || isSubmitting 
                    ? 'Обробка замовлення...' 
                    : `Замовити за ${totalWithDelivery} грн`}
                </Button>
              </form>
            </div>
          </div>

          {/* Підсумок замовлення */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Ваше замовлення ({cart.itemCount} товар{cart.itemCount !== 1 ? 'и' : ''})
              </h2>
              
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {cart.items.map((item) => (
                  <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`} 
                       className="flex gap-3 pb-4 border-b border-gray-100 last:border-0">
                    <div className="flex-shrink-0 w-16 h-16">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.selectedSize} • {item.selectedColor}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-gray-500">
                          {item.quantity} × {item.product.price} грн
                        </span>
                        <span className="font-medium text-gray-900">
                          {item.product.price * item.quantity} грн
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Товари:</span>
                  <span>{cart.total} грн</span>
                </div>
                
                <div className="flex justify-between text-gray-600">
                  <span>Доставка:</span>
                  <span>{deliveryCost} грн</span>
                </div>
                
                {selectedPaymentMethod === 'liqpay' && (
                  <div className="flex justify-between text-gray-600">
                    <span>Комісія LiqPay (2.75%):</span>
                    <span className="text-red-600">+{(totalWithDelivery * 0.0275).toFixed(0)} грн</span>
                  </div>
                )}
                
                <hr className="border-gray-200 my-2" />
                
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Загальна сума:</span>
                  <span>
                    {selectedPaymentMethod === 'liqpay' 
                      ? (totalWithDelivery * 1.0275).toFixed(0) 
                      : totalWithDelivery} грн
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Link to="/cart">
                  <Button variant="outline" className="w-full">
                    ← Повернутися до кошика
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;