import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const ProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    firstName: 'Іван',
    lastName: 'Петренко',
    email: 'ivan@example.com',
    phone: '+380123456789',
    address: 'м. Київ, вул. Примерна, 123'
  });

  const handleSave = () => {
    setIsEditing(false);
    console.log('Saved:', userData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Мій профіль</h1>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}>
                  Редагувати
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Скасувати
                  </Button>
                  <Button onClick={handleSave}>
                    Зберегти
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Ім'я"
                name="firstName"
                value={userData.firstName}
                onChange={handleChange}
                disabled={!isEditing}
              />
              <Input
                label="Прізвище"
                name="lastName"
                value={userData.lastName}
                onChange={handleChange}
                disabled={!isEditing}
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={userData.email}
                onChange={handleChange}
                disabled={!isEditing}
              />
              <Input
                label="Телефон"
                name="phone"
                value={userData.phone}
                onChange={handleChange}
                disabled={!isEditing}
              />
              <div className="md:col-span-2">
                <Input
                  label="Адреса"
                  name="address"
                  value={userData.address}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Історія замовлень</h2>
          </div>
          <div className="px-6 py-6">
            <p className="text-gray-500 text-center py-8">
              У вас ще немає замовлень
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};