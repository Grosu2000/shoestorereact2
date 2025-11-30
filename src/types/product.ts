export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  description: string;
  category: string;
  brand: string;
  sizes: string[];
  colors: string[];
  inStock: boolean;
  stockQuantity: number;
  rating: number;
  reviewCount: number;
  features: string[];
  material: string;
  releaseYear: number;
  country: string;
  createdAt: string;
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
}

export interface ProductWithReviews extends Product {
  reviews: Review[];
}

export type Page = 'home' | 'products' | 'cart' | 'login' | 'profile' | 'admin' | 'about';