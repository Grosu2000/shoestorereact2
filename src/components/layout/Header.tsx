import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "../ui/Button";
import { useAuthStore } from "../../stores/auth-store";
import { useCompareStore } from "../../stores/compare-store";

interface HeaderProps {
  cartItemCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ cartItemCount = 0 }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const compareCount = useCompareStore((state) => state.getItemsCount());

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setIsMobileMenuOpen(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMobileMenuOpen(false);
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <Link to="/" className="text-2xl font-bold text-text hover:opacity-80 transition">
              STEP
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className={`text-text font-medium hover:text-button transition ${location.pathname === '/' ? 'text-button' : ''}`}>
                Головна
              </Link>
              <Link to="/products" className={`text-text font-medium hover:text-button transition ${location.pathname.startsWith('/products') ? 'text-button' : ''}`}>
                Товари
              </Link>
              <Link to="/about" className={`text-text font-medium hover:text-button transition ${location.pathname === '/about' ? 'text-button' : ''}`}>
                Про нас
              </Link>
              {user?.role === "ADMIN" && (
                <Link to="/admin" className={`text-text font-medium hover:text-button transition ${location.pathname.startsWith('/admin') ? 'text-button' : ''}`}>
                  Адмінка
                </Link>
              )}
            </nav>

            <div className="hidden md:flex items-center space-x-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Пошук..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-3 pr-8 py-2 text-sm border border-accent rounded-full focus:outline-none focus:ring-1 focus:ring-button w-40 lg:w-56"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text/40 hover:text-text"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>

              {/* ПОРІВНЯННЯ */}
              <Link to="/compare" className="relative p-1 hover:text-button transition">
                <svg className="w-5 h-5 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                {compareCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-button text-text text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-sm">
                    {compareCount}
                  </span>
                )}
              </Link>

              {/* КОШИК */}
              <Link to="/cart" className="relative p-1 hover:text-button transition">
                <svg className="w-5 h-5 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-button text-text text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-sm">
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </span>
                )}
              </Link>

              {/* WISHLIST */}
              <Link to="/wishlist" className="p-1 hover:text-button transition">
                <svg className="w-5 h-5 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </Link>

              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-text/70">{user.name?.split(' ')[0]}</span>
                  <Link to="/profile">
                    <Button variant="outline" size="sm" className="py-1 px-3 text-sm">Профіль</Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={handleLogout} className="py-1 px-3 text-sm">Вийти</Button>
                </div>
              ) : (
                <Link to="/login">
                  <Button variant="outline" size="sm" className="py-1 px-4 text-sm">Увійти</Button>
                </Link>
              )}
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-accent transition"
              aria-label="Меню"
            >
              <svg className="w-6 h-6 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-20 px-6">
          <div className="flex flex-col space-y-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Пошук товарів..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter') handleSearch(); }}
                className="input-field py-3 pr-12 text-base w-full"
                autoFocus
              />
              <button onClick={handleSearch} className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5 text-text/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

            <nav className="flex flex-col space-y-4">
              <Link to="/" onClick={closeMenu} className="text-lg font-medium py-2 border-b border-accent">Головна</Link>
              <Link to="/products" onClick={closeMenu} className="text-lg font-medium py-2 border-b border-accent">Товари</Link>
              <Link to="/about" onClick={closeMenu} className="text-lg font-medium py-2 border-b border-accent">Про нас</Link>
              {user?.role === "ADMIN" && (
                <Link to="/admin" onClick={closeMenu} className="text-lg font-medium py-2 border-b border-accent">Адмінка</Link>
              )}
              <Link to="/compare" onClick={closeMenu} className="text-lg font-medium py-2 border-b border-accent">
                Порівняння {compareCount > 0 && `(${compareCount})`}
              </Link>
              <Link to="/wishlist" onClick={closeMenu} className="text-lg font-medium py-2 border-b border-accent">Бажання</Link>
              <Link to="/cart" onClick={closeMenu} className="text-lg font-medium py-2 border-b border-accent">
                Кошик {cartItemCount > 0 && `(${cartItemCount})`}
              </Link>
            </nav>

            <div className="pt-6">
              {user ? (
                <>
                  <p className="text-text/70 mb-4">Вітаємо, {user.name}!</p>
                  <Link to="/profile" onClick={closeMenu}>
                    <Button variant="outline" className="w-full mb-3">Профіль</Button>
                  </Link>
                  <Button variant="outline" onClick={handleLogout} className="w-full">Вийти</Button>
                </>
              ) : (
                <Link to="/login" onClick={closeMenu}>
                  <Button className="w-full">Увійти</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};