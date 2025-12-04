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
  const text = await response.text();
  let data;
  
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    console.error('Помилка парсингу JSON:', text);
    throw new Error('Invalid JSON response');
  }
  
  if (!response.ok) {
    const errorMsg = data.error || data.message || `HTTP ${response.status}`;
    throw new Error(errorMsg);
  }
  
  if (data.success !== undefined) {
    return data.data || data;
  }
  
  return data;
};

// Функція для створення заголовків
const createHeaders = (isFormData: boolean = false): HeadersInit => {
  const token = getAuthToken();
  const headers: HeadersInit = {};
  
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  headers['Accept'] = 'application/json';
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

const api = {
  get: async <T>(endpoint: string): Promise<T> => {
    const headers = createHeaders(false);
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers,
      credentials: 'include',
    });
    
    return handleResponse(response);
  },

  post: async <T>(endpoint: string, data?: unknown): Promise<T> => {
    const isFormData = data instanceof FormData;
    const headers = createHeaders(isFormData);
    
    const body = isFormData 
      ? data as FormData 
      : (data !== undefined ? JSON.stringify(data) : undefined);

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body,
      credentials: 'include',
    });
    
    return handleResponse(response);
  },

  put: async <T>(endpoint: string, data: unknown): Promise<T> => {
    const isFormData = data instanceof FormData;
    const headers = createHeaders(isFormData);
    
    const body = isFormData 
      ? data as FormData 
      : JSON.stringify(data);

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body,
      credentials: 'include',
    });
    
    return handleResponse(response);
  },

  delete: async (endpoint: string): Promise<void> => {
    const headers = createHeaders(false);
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
      credentials: 'include',
    });
    
    await handleResponse(response);
  },
};

export { api };