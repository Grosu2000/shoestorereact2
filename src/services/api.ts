const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
    const errorMsg = data.error || data.message || data.details || `HTTP ${response.status}`;
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

// ✅ ВАЖНО: Функция для добавления /api/ если его нет в endpoint
const normalizeEndpoint = (endpoint: string): string => {
  // Если endpoint уже начинается с /api/, оставляем как есть
  if (endpoint.startsWith('/api/')) {
    return endpoint;
  }
  
  // Если endpoint начинается с /, но не с /api/, добавляем /api
  if (endpoint.startsWith('/')) {
    return `/api${endpoint}`;
  }
  
  // Если endpoint без слеша в начале
  return `/api/${endpoint}`;
};

const api = {
  get: async <T>(endpoint: string): Promise<T> => {
    const normalizedEndpoint = normalizeEndpoint(endpoint);
    const url = `${API_URL}${normalizedEndpoint}`;
    
    console.log(`[API GET] ${url}`); // Для отладки
    
    const headers = createHeaders(false);
    
    const response = await fetch(url, {
      headers,
      credentials: 'include',
    });
    
    return handleResponse(response);
  },

  post: async <T>(endpoint: string, data?: unknown): Promise<T> => {
    const normalizedEndpoint = normalizeEndpoint(endpoint);
    const url = `${API_URL}${normalizedEndpoint}`;
    
    console.log(`[API POST] ${url}`, data); // Для отладки
    
    const isFormData = data instanceof FormData;
    const headers = createHeaders(isFormData);
    
    const body = isFormData 
      ? data as FormData 
      : (data !== undefined ? JSON.stringify(data) : undefined);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
      credentials: 'include',
    });
    
    return handleResponse(response);
  },

  put: async <T>(endpoint: string, data: unknown): Promise<T> => {
    const normalizedEndpoint = normalizeEndpoint(endpoint);
    const url = `${API_URL}${normalizedEndpoint}`;
    
    console.log(`[API PUT] ${url}`, data); // Для отладки
    
    const isFormData = data instanceof FormData;
    const headers = createHeaders(isFormData);
    
    const body = isFormData 
      ? data as FormData 
      : JSON.stringify(data);

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body,
      credentials: 'include',
    });
    
    return handleResponse(response);
  },

  delete: async (endpoint: string): Promise<void> => {
    const normalizedEndpoint = normalizeEndpoint(endpoint);
    const url = `${API_URL}${normalizedEndpoint}`;
    
    console.log(`[API DELETE] ${url}`); // Для отладки
    
    const headers = createHeaders(false);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers,
      credentials: 'include',
    });
    
    await handleResponse(response);
  },
};

// ✅ Дополнительные методы для удобства
export const apiService = {
  // Auth
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  
  // Products
  getProducts: () => api.get('/products'),
  getProduct: (slug: string) => api.get(`/products/${slug}`),
  searchProducts: (query: string) => api.get(`/products/search?q=${encodeURIComponent(query)}`),
  getProductsByCategory: (category: string) => api.get(`/products/category/${encodeURIComponent(category)}`),
  
  // Cart
  getCart: () => api.get('/cart'),
  addToCart: (data: any) => api.post('/cart', data),
  updateCartItem: (id: string, data: any) => api.put(`/cart/${id}`, data),
  removeFromCart: (id: string) => api.delete(`/cart/${id}`),
  clearCart: () => api.delete('/cart/clear'),
  
  // Orders
  createOrder: (data: any) => api.post('/orders', data),
  getOrders: () => api.get('/orders'),
  getOrder: (id: string) => api.get(`/orders/${id}`),
  // ✅ ИСПРАВЛЕНО: cancelOrder теперь использует пустой объект
  cancelOrder: (id: string) => api.put(`/orders/${id}/cancel`, {}),
  
  // Reviews
  addReview: (productId: string, data: any) => api.post(`/products/${productId}/reviews`, data),
  getReviews: (productId: string) => api.get(`/products/${productId}/reviews`),
  
  // Payment
  createPayment: (data: any) => api.post('/payment/create', data),
  verifyPayment: (data: any) => api.post('/payment/verify', data),
  
  // Admin (если нужно)
  getAllUsers: () => api.get('/admin/users'),
  updateProduct: (id: string, data: any) => api.put(`/admin/products/${id}`, data),
};

export { api };