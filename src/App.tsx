import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { ProductPage } from './pages/ProductPage';
import { CartPage } from './pages/CartPage';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { AboutPage } from './pages/AboutPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { useCartStore } from './stores/cart-store';
import { ProductDetailPage } from './pages/ProductDetailPage';
import './App.css';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';

function App() {
  const cartItemCount = useCartStore((state) => state.cart.itemCount);

  return (
    <Router>
      <div className="App">
        <Header cartItemCount={cartItemCount} />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="*" element={<NotFoundPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrderHistoryPage />} />

          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;