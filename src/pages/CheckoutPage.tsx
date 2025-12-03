import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useCartStore } from '../stores/cart-store';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  paymentMethod: string;
}

export const CheckoutPage: React.FC = () => {
  const { cart, clearCart } = useCartStore();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CheckoutFormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      paymentMethod: 'card'
    }
  });

  const onSubmit = async (data: CheckoutFormData) => {
    console.log('Order data:', { ...data, cart });
    await new Promise(resolve => setTimeout(resolve, 2000));
    alert('Замовлення успішно оформлено!');
    clearCart();
    navigate('/');
  };

  const deliveryCost = 50;
  const totalWithDelivery = cart.total + deliveryCost;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-text mb-8">Оформлення замовлення</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Форма заказа */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-6 text-text">Контактна інформація</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Ім'я"
                  {...register('firstName', { required: "Введіть ім'я" })}
                  error={errors.firstName?.message}
                />
                <Input
                  label="Прізвище"
                  {...register('lastName', { required: 'Введіть прізвище' })}
                  error={errors.lastName?.message}
                />
              </div>

              <Input
                label="Email"
                type="email"
                {...register('email', { required: 'Введіть email' })}
                error={errors.email?.message}
              />

              <Input
                label="Телефон"
                {...register('phone', { required: 'Введіть телефон' })}
                error={errors.phone?.message}
              />

              <Input
                label="Адреса доставки"
                {...register('address', { required: 'Введіть адресу' })}
                error={errors.address?.message}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Місто"
                  {...register('city', { required: 'Введіть місто' })}
                  error={errors.city?.message}
                />
                <Input
                  label="Поштовий індекс"
                  {...register('postalCode', { required: 'Введіть індекс' })}
                  error={errors.postalCode?.message}
                />
              </div>

              <div>
                <label className="input-label">
                  Спосіб оплати
                </label>
                <select
                  {...register('paymentMethod')}
                  className="input-field"
                >
                  <option value="card">Банківська карта</option>
                  <option value="cash">Готівка при отриманні</option>
                  <option value="liqpay">LiqPay</option>
                </select>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Обробка замовлення...' : 'Підтвердити замовлення'}
              </Button>
            </form>
          </div>

          {/* Підсумок замовлення */}
          <div className="bg-white p-6 rounded-lg shadow-sm h-fit">
            <h2 className="text-xl font-semibold mb-6 text-text">Ваше замовлення</h2>
            
            <div className="space-y-4 mb-6">
              {cart.items.map((item) => (
                <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`} 
                     className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-text">{item.product.name}</h4>
                    <p className="text-sm text-text/70">
                      {item.selectedSize} • {item.selectedColor} • {item.quantity} шт.
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-text">
                      {item.product.price * item.quantity} грн
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-accent pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Товари:</span>
                <span>{cart.total} грн</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Доставка:</span>
                <span>{deliveryCost} грн</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-accent pt-2 text-text">
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