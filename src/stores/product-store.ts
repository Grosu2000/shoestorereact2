import { create } from 'zustand';
import type { Product } from '../types/product';
import { productService } from '../services/products';

interface ProductStore {
  products: Product[];
  filteredProducts: Product[];
  selectedCategory: string;
  selectedBrand: string;
  priceRange: [number, number];
  searchTerm: string;
  isLoading: boolean;
  error: string | null;
  
  
  fetchProducts: () => Promise<void>;
  setCategory: (category: string) => void;
  setBrand: (brand: string) => void;
  setPriceRange: (range: [number, number]) => void;
  setSearchTerm: (term: string) => void;
  filterProducts: () => void;
  getProductById: (id: string) => Promise<Product | null>;
  createProduct: (data: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  filteredProducts: [],
  selectedCategory: 'all',
  selectedBrand: 'all',
  priceRange: [0, 5000],
  searchTerm: '',
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await productService.getAll();
      const products = Array.isArray(response) ? response : [];
      set({ 
        products,
        filteredProducts: products,
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Не вдалося завантажити товари', 
        isLoading: false 
      });
    }
  },

  setCategory: (category) => {
    set({ selectedCategory: category });
    get().filterProducts();
  },

  setBrand: (brand) => {
    set({ selectedBrand: brand });
    get().filterProducts();
  },

  setPriceRange: (range) => {
    set({ priceRange: range });
    get().filterProducts();
  },

  setSearchTerm: (term) => {
    set({ searchTerm: term });
    get().filterProducts();
  },

  filterProducts: () => {
    const { products, searchTerm, selectedCategory, selectedBrand, priceRange } = get();
    
    const filtered = products.filter(product => {
      const matchesSearch = searchTerm === '' || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || 
        selectedCategory === '' || 
        product.category === selectedCategory;
      
      const matchesBrand = selectedBrand === 'all' || 
        selectedBrand === '' || 
        product.brand === selectedBrand;
      
      const matchesPrice = product.price >= priceRange[0] && 
        product.price <= priceRange[1];

      return matchesSearch && matchesCategory && matchesBrand && matchesPrice;
    });

    set({ filteredProducts: filtered });
  },

  getProductById: async (id) => {
    try {
      const response = await productService.getById(id);
      return response;
    } catch (error) {
      console.error('Помилка завантаження продукту:', error);
      return null;
    }
  },

  createProduct: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await productService.create(data);
      
      await get().fetchProducts();
    } catch (error: any) {
      set({ 
        error: error.message || 'Помилка створення товару', 
        isLoading: false 
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateProduct: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await productService.update(id, data);
      
      await get().fetchProducts();
    } catch (error: any) {
      set({ 
        error: error.message || 'Помилка оновлення товару', 
        isLoading: false 
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteProduct: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await productService.delete(id);
      
      set(state => ({
        products: state.products.filter(p => p.id !== id),
        filteredProducts: state.filteredProducts.filter(p => p.id !== id),
        isLoading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.message || 'Помилка видалення товару', 
        isLoading: false 
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));