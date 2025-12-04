import { BrowserRouter as Router } from "react-router-dom";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastProvider } from "./contexts/ToastContext";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
import { HomePage } from "./pages/HomePage";
import { ProductPage } from "./pages/ProductPage";
import { CartPage } from "./pages/CartPage";
import { LoginPage } from "./pages/LoginPage";
import { ProfilePage } from "./pages/ProfilePage";
import { AdminPage } from "./pages/AdminPage";
import { AboutPage } from "./pages/AboutPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { useCartStore } from "./stores/cart-store";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { OrderHistoryPage } from "./pages/OrderHistoryPage";
import { useAuthStore } from "./stores/auth-store";
import { useEffect, useCallback } from "react";
import { OrderSuccessPage } from "./pages/OrderSuccessPage";

function App() {
  const cartItemCount = useCartStore((state) => state.cart.itemCount);
  const { user, checkAuth } = useAuthStore();

  const stableCheckAuth = useCallback(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    stableCheckAuth();
  }, [stableCheckAuth]);

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!user) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    if (!user || user.role !== "ADMIN") {
      return <Navigate to="/" />;
    }
    return children;
  };

  return (
    <ErrorBoundary>
      <ToastProvider>
        <Router>
          <div className="App min-h-screen flex flex-col">
            <Header cartItemCount={cartItemCount} />
            <main className="flex-grow">
              <Routes>
                <Route
                  path="/test"
                  element={
                    <div
                      style={{
                        padding: "50px",
                        background: "red",
                        color: "white",
                      }}
                    >
                      <h1>ТЕСТОВА СТОРІНКА</h1>
                      <p>Час: {new Date().toLocaleTimeString()}</p>
                    </div>
                  }
                />

                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
                <Route path="*" element={<NotFoundPage />} />

                {/* Захищені маршрути */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <CheckoutPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <OrderHistoryPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminPage />
                    </AdminRoute>
                  }
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
