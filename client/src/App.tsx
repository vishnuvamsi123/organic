import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ToastProvider';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import AuthGuard from './components/AuthGuard';
import { Header } from './components/Header';

// Pages
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import RicePulsePage from './pages/RicePulsePage';
import DairyPage from './pages/DairyPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import ProductDetailPage from './pages/ProductDetailPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import FarmerDashboardPage from './pages/FarmerDashboardPage';
import ProfilePage from './pages/ProfilePage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <BrowserRouter>
            <Header />
            <main className="page-enter">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<LoginPage />} />

                {/* Protected – any authenticated user */}
                <Route path="/home" element={<AuthGuard><HomePage /></AuthGuard>} />
                <Route path="/rice-pulses" element={<AuthGuard><RicePulsePage /></AuthGuard>} />
                <Route path="/dairy" element={<AuthGuard><DairyPage /></AuthGuard>} />
                <Route path="/cart" element={<AuthGuard><CartPage /></AuthGuard>} />
                <Route path="/checkout" element={<AuthGuard><CheckoutPage /></AuthGuard>} />
                <Route path="/track/:orderId" element={<AuthGuard><OrderTrackingPage /></AuthGuard>} />
                <Route path="/product/:id" element={<AuthGuard><ProductDetailPage /></AuthGuard>} />
                <Route path="/orders" element={<AuthGuard><OrderHistoryPage /></AuthGuard>} />
                <Route path="/profile" element={<AuthGuard><ProfilePage /></AuthGuard>} />

                {/* Farmer-only */}
                <Route
                  path="/farmer-dashboard"
                  element={<AuthGuard requireRole="farmer"><FarmerDashboardPage /></AuthGuard>}
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </main>
          </BrowserRouter>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
