const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getAuthToken = () => {
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      return parsed.state?.token || null;
    }
  } catch (e) {
    console.error('Помилка парсингу токена:', e);
  }
  return null;
};

const handleResponse = async (response: Response) => {
  // Спершу пробуємо отримати текст, щоб уникнути помилок парсингу
  const text = await response.text();
  let data;
  
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    console.error('Помилка парсингу JSON:', e, text);
    throw new Error('Invalid JSON response from server');
  }
  
  // Бекенд повертає {success, data, message} або {success, error, message}
  if (!response.ok) {
    // Бекенд може повертати помилки по-різному
    const errorMessage = data.error || data.message || `HTTP ${response.status}`;
    throw new Error(errorMessage);
  }
  
  // Якщо успішно - повертаємо data (всередині буде user та token)
  // або сам об'єкт, якщо структура інша
  return data.data || data;
};

const api = {
  get: async <T>(endpoint: string): Promise<T> => {
    const token = getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      headers,
      credentials: 'include', // ДУЖЕ ВАЖЛИВО для cookies та авторизації
    });
    
    return handleResponse(response);
  },

  post: async <T>(endpoint: string, data?: unknown): Promise<T> => {
    const token = getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: data !== undefined ? JSON.stringify(data) : undefined,
      credentials: 'include', // ДУЖЕ ВАЖЛИВО
    });
    
    return handleResponse(response);
  },

  put: async <T>(endpoint: string, data: unknown): Promise<T> => {
    const token = getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
      credentials: 'include',
    });
    
    return handleResponse(response);
  },

  delete: async (endpoint: string): Promise<void> => {
    const token = getAuthToken();
    const headers: HeadersInit = {
      'Accept': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
      credentials: 'include',
    });
    
    await handleResponse(response);
  },
};

export { api };