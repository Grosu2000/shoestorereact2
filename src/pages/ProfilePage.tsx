import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../stores/auth-store';
import { useToast } from '../contexts/ToastContext';

// Типи для користувача
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  avatar?: string;
}

// Типи для замовлення
interface Order {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
}

// Типи для відповіді API
interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

interface ProfileData extends User {
  orderCount: number;
  totalSpent: number;
  recentOrders: Order[];
}

// Базовий API URL
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// API функції
export const userApi = {
  // Отримати профіль
  getProfile: async (): Promise<ApiResponse<ProfileData>> => {
    const token = localStorage.getItem('token') || useAuthStore.getState().token;
    
    if (!token) {
      throw new Error('No authentication token');
    }

    const response = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Додайте цей параметр
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Оновити профіль
  updateProfile: async (data: { name: string; email: string }): Promise<ApiResponse<User>> => {
    const token = localStorage.getItem('token') || useAuthStore.getState().token;
    
    if (!token) {
      throw new Error('No authentication token');
    }

    const response = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include', // Додайте цей параметр
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Змінити пароль
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<void>> => {
    const token = localStorage.getItem('token') || useAuthStore.getState().token;
    
    if (!token) {
      throw new Error('No authentication token');
    }

    const response = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include', // Додайте цей параметр
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },
};

// Компонент форми профілю
const ProfileForm = ({
  profile,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  profile: User | null;
  onSubmit: (data: { name: string; email: string }) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) => {
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ім'я
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Збереження...' : 'Зберегти'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
        >
          Скасувати
        </button>
      </div>
    </form>
  );
};

// Компонент форми зміни пароля
const PasswordForm = ({
  onSubmit,
  onCancel,
  isSubmitting,
  showToast,
}: {
  onSubmit: (data: { currentPassword: string; newPassword: string }) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  showToast: (message: string, type: 'success' | 'error') => void;
}) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      showToast('Нові паролі не співпадають', 'error');
      return;
    }
    if (formData.newPassword.length < 6) {
      showToast('Пароль повинен містити щонайменше 6 символів', 'error');
      return;
    }
    onSubmit({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Поточний пароль
        </label>
        <input
          type="password"
          value={formData.currentPassword}
          onChange={(e) =>
            setFormData({ ...formData, currentPassword: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Новий пароль
        </label>
        <input
          type="password"
          value={formData.newPassword}
          onChange={(e) =>
            setFormData({ ...formData, newPassword: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Підтвердіть новий пароль
        </label>
        <input
          type="password"
          value={formData.confirmPassword}
          onChange={(e) =>
            setFormData({ ...formData, confirmPassword: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Зміна...' : 'Змінити пароль'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
        >
          Скасувати
        </button>
      </div>
    </form>
  );
};

// Компонент історії замовлень
const OrderHistory = ({ orders }: { orders: Order[] }) => {
  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div
          key={order.id}
          className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Замовлення #{order.orderNumber}</p>
              <p className="text-sm text-gray-600">
                {new Date(order.createdAt).toLocaleDateString('uk-UA')}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold">{order.total} грн</p>
              <span
                className={`inline-block px-2 py-1 text-xs rounded-full ${
                  order.status === 'DELIVERED'
                    ? 'bg-green-100 text-green-800'
                    : order.status === 'PROCESSING'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {order.status === 'DELIVERED'
                  ? 'Доставлено'
                  : order.status === 'PROCESSING'
                  ? 'Обробляється'
                  : 'Нове'}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Головний компонент ProfilePage
export const ProfilePage = () => {
  const { user, updateUser } = useAuthStore();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Отримання профілю з API
  const {
    data: profileData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => userApi.getProfile(),
    enabled: !!user,
  });

  // Оновлення профілю
  const updateMutation = useMutation({
    mutationFn: userApi.updateProfile,
    onSuccess: (data) => {
      showToast('Профіль успішно оновлено', 'success');
      if (updateUser && data.data) {
        updateUser(data.data); // Тепер цей метод є в store
      }
      setIsEditing(false);
      refetch();
    },
    onError: (error: any) => {
      const errorMessage = typeof error === 'string' 
        ? error 
        : error?.message || 'Помилка оновлення профілю';
      showToast(errorMessage, 'error');
    },
  });

  // Зміна пароля
  const changePasswordMutation = useMutation({
    mutationFn: userApi.changePassword,
    onSuccess: () => {
      showToast('Пароль успішно змінено', 'success');
      setIsChangingPassword(false);
    },
    onError: (error: any) => {
      const errorMessage = typeof error === 'string'
        ? error
        : error?.message || 'Помилка зміни пароля';
      showToast(errorMessage, 'error');
    },
  });

  // Обробка оновлення профілю
  const handleUpdateProfile = (data: { name: string; email: string }) => {
    updateMutation.mutate(data);
  };

  // Обробка зміни пароля
  const handleChangePassword = (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    changePasswordMutation.mutate(data);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-lg text-red-600">Будь ласка, увійдіть в систему</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-4">
                <div className="h-48 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-4">
                <div className="h-40 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const profile = profileData?.data || user;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Мій профіль</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Ліва колонка - інформація */}
          <div className="md:col-span-2 space-y-6">
            {isEditing ? (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Редагування профілю
                </h2>
                <ProfileForm
                  profile={profile}
                  onSubmit={handleUpdateProfile}
                  onCancel={() => setIsEditing(false)}
                  isSubmitting={updateMutation.isPending}
                />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-xl font-semibold">Особиста інформація</h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Редагувати
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-600">Ім'я</label>
                    <p className="font-medium text-lg">
                      {profile?.name || 'Не вказано'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Email</label>
                    <p className="font-medium text-lg">{profile?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">
                      Дата реєстрації
                    </label>
                    <p className="font-medium">
                      {profile?.createdAt
                        ? new Date(profile.createdAt).toLocaleDateString('uk-UA')
                        : 'Не вказано'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Роль</label>
                    <p className="font-medium">
                      {profile?.role === 'ADMIN' ? 'Адміністратор' : 'Користувач'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isChangingPassword ? (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Зміна пароля</h2>
                <PasswordForm
                  onSubmit={handleChangePassword}
                  onCancel={() => setIsChangingPassword(false)}
                  isSubmitting={changePasswordMutation.isPending}
                  showToast={showToast}
                />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-xl font-semibold">Безпека</h2>
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Змінити пароль
                  </button>
                </div>
                <p className="text-gray-600">
                  Остання зміна пароля: нещодавно
                </p>
              </div>
            )}
          </div>

          {/* Права колонка - статистика */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Статистика</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Замовлень</p>
                  <p className="text-2xl font-bold">
                    {profileData?.data?.orderCount || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Витрачено</p>
                  <p className="text-2xl font-bold">
                    {profileData?.data?.totalSpent
                      ? `${profileData.data.totalSpent} грн`
                      : '0 грн'}
                  </p>
                </div>
              </div>
            </div>

            {/* Недавні замовлення */}
            {profileData?.data?.recentOrders &&
              profileData.data.recentOrders.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Останні замовлення
                  </h2>
                  <OrderHistory orders={profileData.data.recentOrders} />
                  <div className="mt-4 text-center">
                    <a
                      href="/orders"
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Дивитися всі замовлення →
                    </a>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;