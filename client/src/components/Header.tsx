import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

// Futuristic SVG Icons
const CartIcon = ({ count }: { count: number }) => (
  <div style={{ position: 'relative', display: 'inline-flex' }}>
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
    {count > 0 && (
      <span style={{
        position: 'absolute', top: '-8px', right: '-8px',
        background: '#f59e0b', color: '#fff', borderRadius: '99px',
        minWidth: '18px', height: '18px', fontSize: '10px', fontWeight: '800',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px',
        boxShadow: '0 2px 6px rgba(245,158,11,0.6)',
      }}>{count > 99 ? '99+' : count}</span>
    )}
  </div>
);

const ProfileIcon = ({ initial }: { initial: string }) => (
  <div style={{
    width: '36px', height: '36px', borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))',
    border: '2px solid rgba(255,255,255,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '14px', fontWeight: '800', color: '#fff',
    backdropFilter: 'blur(8px)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  }}>{initial || '👤'}</div>
);

const HomeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const OrderIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

const RiceIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a10 10 0 100 20 10 10 0 000-20z"/>
    <path d="M12 8v8M8 12h8"/>
  </svg>
);

const DairyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2h12v3H6zm0 3h12v15a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z" />
    <path d="M10 9h4M10 13h4M10 17h4" />
  </svg>
);

export const Header: React.FC = () => {
  const { totalItems } = useCart();
  const { isAuthenticated, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const userName = localStorage.getItem('userName') ?? '';
  const initial = userName ? userName[0].toUpperCase() : (role === 'farmer' ? 'F' : 'U');

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  const navLink = (to: string, label: string, icon?: React.ReactNode) => {
    const active = location.pathname === to;
    return (
      <Link to={to} onClick={() => setMenuOpen(false)} style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '7px 14px', borderRadius: '10px',
        fontSize: '13.5px', fontWeight: active ? '700' : '500',
        color: active ? '#d4af37' : 'rgba(255,255,255,0.82)',
        background: active ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
        transition: 'all 0.2s', textDecoration: 'none',
        border: active ? '1px solid rgba(212, 175, 55, 0.4)' : '1px solid transparent',
      }}>
        {icon}{label}
      </Link>
    );
  };

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'linear-gradient(135deg, #0e2416 0%, #1b3f27 60%, #09170e 100%)',
      borderBottom: '2px solid rgba(212, 175, 55, 0.4)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    }}>
      <div style={{
        maxWidth: '1280px', margin: '0 auto', padding: '0 20px',
        height: '82px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: '16px',
      }}>
        {/* Brand with real logo */}
        <Link to={isAuthenticated ? '/home' : '/login'} style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          textDecoration: 'none', flexShrink: 0,
        }}>
          <img
            src="/logo.jpg"
            alt="Organic"
            style={{ width: '62px', height: '62px', borderRadius: '16px', objectFit: 'cover', border: '2px solid rgba(212, 175, 55, 0.5)' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <span style={{ fontWeight: '800', fontSize: '24px', color: '#fff', letterSpacing: '-0.3px', fontFamily: 'serif' }}>Organic</span>
        </Link>

        {/* Desktop nav */}
        {isAuthenticated && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, justifyContent: 'center' }}>
            {navLink('/home', 'Home', <HomeIcon />)}
            {navLink('/rice-pulses', 'Rice & Pulses', <RiceIcon />)}
            {navLink('/dairy', 'Dairy', <DairyIcon />)}
            {navLink('/orders', 'My Orders', <OrderIcon />)}
            {role === 'farmer' && navLink('/farmer-dashboard', '🌾 Dashboard')}
          </nav>
        )}

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {isAuthenticated && (
            <>
              {/* Cart button */}
              <Link to="/cart" style={{
                position: 'relative', display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', background: 'rgba(255,255,255,0.12)',
                borderRadius: '10px', textDecoration: 'none', color: '#fff',
                fontSize: '13px', fontWeight: '600', transition: 'all 0.2s',
                border: '1px solid rgba(212, 175, 55, 0.2)',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(212, 175, 55, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.6)';
                  e.currentTarget.style.color = '#d4af37';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                  e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.2)';
                  e.currentTarget.style.color = '#fff';
                }}
              >
                <CartIcon count={totalItems} />
                <span style={{ display: 'none' }}>Cart</span>
              </Link>

              {/* Profile dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setMenuOpen(v => !v)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  title="Account"
                >
                  <ProfileIcon initial={initial} />
                </button>
                {menuOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                    minWidth: '200px', background: 'var(--color-surface)', borderRadius: '16px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.15)', overflow: 'hidden',
                    animation: 'scale-in 0.2s ease-out', zIndex: 200,
                    border: '1px solid rgba(0,0,0,0.06)',
                  }}>
                    <div style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                      <div style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>{userName || 'My Account'}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', textTransform: 'capitalize' }}>{role} account</div>
                    </div>
                    <Link to="/profile" onClick={() => setMenuOpen(false)} style={dropdownItemStyle}>
                      <span style={iconStyle}>👤</span> Profile
                    </Link>
                    <Link to="/orders" onClick={() => setMenuOpen(false)} style={dropdownItemStyle}>
                      <span style={iconStyle}>📦</span> My Orders
                    </Link>
                    {role === 'farmer' && (
                      <Link to="/farmer-dashboard" onClick={() => setMenuOpen(false)} style={dropdownItemStyle}>
                        <span style={iconStyle}>🌾</span> Dashboard
                      </Link>
                    )}
                    <div style={{ borderTop: '1px solid #f1f5f9', margin: '4px 0' }} />
                    <button onClick={handleLogout} style={{
                      ...dropdownItemStyle, color: '#ef4444', width: '100%', border: 'none', cursor: 'pointer',
                    } as React.CSSProperties}>
                      <span style={iconStyle}>🚪</span> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {!isAuthenticated && (
            <Link to="/login" style={{
              padding: '8px 20px', background: 'rgba(255,255,255,0.15)',
              borderRadius: '10px', color: '#fff', textDecoration: 'none',
              fontWeight: '600', fontSize: '14px', border: '1px solid rgba(255,255,255,0.3)',
            }}>Login</Link>
          )}
        </div>
      </div>
      {menuOpen && <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />}
    </header>
  );
};

const dropdownItemStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '10px',
  padding: '11px 16px', fontSize: '14px', color: '#0f172a',
  textDecoration: 'none', background: 'transparent',
  transition: 'background 0.15s', cursor: 'pointer', fontWeight: '500',
};

const iconStyle: React.CSSProperties = {
  fontSize: '16px', width: '20px', textAlign: 'center',
};

export default Header;
