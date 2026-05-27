import { useState } from 'react';
import { useAuthStore } from '../stores/auth-store';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';

interface UpdateProfileResponse {
  success: boolean;
  data: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export const ProfilePage = () => {
  const { user, updateUser, logout } = useAuthStore();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.put<UpdateProfileResponse>('/auth/profile', formData);
      if (response.success && response.data) {
        updateUser(response.data);
        showToast('Профіль успішно оновлено', 'success');
        setIsEditing(false);
      }
    } catch (error: any) {
      showToast(error.message || 'Помилка оновлення профілю', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('Нові паролі не співпадають', 'error');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showToast('Пароль повинен містити мінімум 6 символів', 'error');
      return;
    }
    setLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      showToast('Пароль успішно змінено', 'success');
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      showToast(error.message || 'Помилка зміни пароля', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-3xl mx-auto px-4 text-center py-16">
          <h1 className="text-2xl font-bold text-text mb-4">Увійдіть в акаунт</h1>
          <p className="text-text/60 mb-8">Щоб переглянути профіль, потрібно увійти</p>
          <a href="/login" className="bg-button text-text px-6 py-3 rounded-lg inline-block">Увійти</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-text mb-8">Мій профіль</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            {/* Особиста інформація */}
            <div className="bg-white rounded-xl shadow-soft border border-accent p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Особиста інформація</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-button text-text rounded-lg hover:bg-button-hover transition"
                  >
                    Редагувати
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Ім'я</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" disabled={loading} className="btn-primary">
                      {loading ? 'Збереження...' : 'Зберегти'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({ name: user.name, email: user.email });
                      }}
                      className="btn-secondary"
                    >
                      Скасувати
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-text/60">Ім'я</label>
                    <p className="font-medium text-text">{user.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-text/60">Email</label>
                    <p className="font-medium text-text">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-text/60">Роль</label>
                    <p className="font-medium text-text">{user.role === 'ADMIN' ? 'Адміністратор' : 'Користувач'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Зміна пароля */}
            <div className="bg-white rounded-xl shadow-soft border border-accent p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Безпека</h2>
                {!isChangingPassword && (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    Змінити пароль
                  </button>
                )}
              </div>

              {isChangingPassword ? (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Поточний пароль</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Новий пароль</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Підтвердіть новий пароль</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" disabled={loading} className="btn-primary">
                      {loading ? 'Зміна...' : 'Змінити пароль'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingPassword(false);
                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      }}
                      className="btn-secondary"
                    >
                      Скасувати
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-text/60">Для безпеки рекомендуємо періодично змінювати пароль</p>
              )}
            </div>
          </div>

          {/* Статистика та дії */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-soft border border-accent p-6">
              <h2 className="text-xl font-semibold mb-4">Статистика</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-text/60">Роль</p>
                  <p className="text-2xl font-bold text-text">{user.role === 'ADMIN' ? '👑 Адмін' : '👤 Користувач'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-soft border border-accent p-6">
              <h2 className="text-xl font-semibold mb-4">Дії</h2>
              <button
                onClick={() => logout()}
                className="w-full btn-secondary text-error hover:bg-error/10"
              >
                Вийти з акаунта
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};