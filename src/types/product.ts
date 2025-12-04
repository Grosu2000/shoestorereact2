export interface ProductSize {
  size: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  brand: string;
  sizes: Array<{ size: string; stock: number }>;
  colors: string[];
  images: string[];
  stock: number; 
  rating: number;
  reviewCount: number;
  features: string[];
  material?: string;
  releaseYear?: number;
  country?: string;
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
  
  image?: string; 
  stockQuantity?: number; 
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
  discount?: number;
  shipping?: number;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  likes: number;
  dislikes: number;
  isVerifiedPurchase?: boolean;
}

export interface ProductWithReviews extends Product {
  reviews: Review[];
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country?: string;
  };
  billingAddress?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country?: string;
  };
  paymentMethod: 'card' | 'cash' | 'liqpay' | 'paypal';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  notes?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  productCount: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
  productCount: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductFilters {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  colors?: string[];
  inStock?: boolean;
  rating?: number;
  sortBy?: 'price' | 'rating' | 'newest' | 'popular' | 'name';
  sortOrder?: 'asc' | 'desc';
  search?: string;
  page?: number;
  limit?: number;
}

export interface ProductStatistics {
  totalProducts: number;
  totalCategories: number;
  totalBrands: number;
  averagePrice: number;
  averageRating: number;
  outOfStockCount: number;
  lowStockCount: number;
}

export interface ProductCreateData {
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  description: string;
  category: string;
  brand: string;
  sizes: ProductSize[];
  colors: string[];
  stockQuantity: number;
  features: string[];
  material: string;
  releaseYear: number;
  country: string;
}

export interface ProductUpdateData {
  name?: string;
  price?: number;
  originalPrice?: number;
  image?: string;
  images?: string[];
  description?: string;
  category?: string;
  brand?: string;
  sizes?: ProductSize[];
  colors?: string[];
  stockQuantity?: number;
  features?: string[];
  material?: string;
  country?: string;
}

export type ProductSortOption = 
  | 'price-low' 
  | 'price-high' 
  | 'name' 
  | 'rating' 
  | 'newest' 
  | 'popular';

export type Page = 
  | 'home' 
  | 'products' 
  | 'cart' 
  | 'login' 
  | 'profile' 
  | 'admin' 
  | 'about' 
  | 'checkout' 
  | 'orders' 
  | 'product-detail';