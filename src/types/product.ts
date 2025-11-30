export interface ProductSize {
  size: string;
  stock: number;
}

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
  sizes: ProductSize[]; 
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

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
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
  };
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export type Page = 'home' | 'products' | 'cart' | 'login' | 'profile' | 'admin' | 'about';