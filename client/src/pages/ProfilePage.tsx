import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const ProfilePage: React.FC = () => {
  const { role, logout } = useAuth();
  const { items, totalItems } = useCart();
  const navigate = useNavigate();

  const email = localStorage.getItem('email') ?? 'user@example.com';
  const userName = localStorage.getItem('userName') ?? (role === 'farmer' ? 'Organic Farmer' : 'Customer');
  const initial = userName[0]?.toUpperCase() ?? email[0]?.toUpperCase() ?? 'U';

  const menuItems = [
    { icon: '📦', label: 'My Orders', desc: 'Track & view past orders', path: '/orders' },
    { icon: '🛒', label: 'Cart', desc: `${totalItems} item${totalItems !== 1 ? 's' : ''} in cart`, path: '/cart' },
    { icon: '🏠', label: 'Browse Products', desc: 'Shop fresh organic produce', path: '/home' },
    ...(role === 'farmer' ? [{ icon: '🌾', label: 'Farmer Dashboard', desc: 'Manage your products & orders', path: '/farmer-dashboard' }] : []),
    { icon: '❓', label: 'Help & Support', desc: 'Contact us or visit FAQs', path: '#' },
    { icon: 'ℹ️', label: 'About Organic App', desc: 'Version 1.0.0 — Made with 🌿', path: '#' },
  ];

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--color-background)', padding: '32px 20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Avatar card */}
        <div style={{
          background: 'linear-gradient(135deg, #14532d 0%, #166534 60%, #0f766e 100%)',
          borderRadius: '24px',
          padding: '32px',
          color: '#fff',
          marginBottom: '24px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '120px', opacity: 0.1 }}>🌿</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              border: '3px solid rgba(255,255,255,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: '800',
              flexShrink: 0,
            }}>
              {role === 'farmer' ? '👨‍🌾' : initial}
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: '800', marginBottom: '4px' }}>
                {userName}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.85, marginBottom: '8px' }}>{email}</div>
              <span style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '99px',
                background: 'rgba(255,255,255,0.18)',
                fontSize: '12px',
                fontWeight: '700',
                backdropFilter: 'blur(4px)',
              }}>
                {role === 'farmer' ? '🌾 Organic Farmer' : '🛒 Customer'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Cart Items', value: totalItems, icon: '🛒' },
            { label: 'Orders', value: '3', icon: '📦' },
            { label: 'Savings', value: '₹180', icon: '💰' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'var(--color-surface)',
              borderRadius: '16px',
              padding: '16px',
              textAlign: 'center',
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
            }}>
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>{s.icon}</div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-primary)' }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Menu */}
        <div style={{ background: 'var(--color-surface)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', marginBottom: '16px' }}>
          {menuItems.map((item, i) => (
            <button
              key={item.label}
              onClick={() => item.path !== '#' && navigate(item.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                width: '100%',
                padding: '18px 20px',
                background: 'none',
                border: 'none',
                borderBottom: i < menuItems.length - 1 ? '1px solid #f1f5f9' : 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <span style={{ fontSize: '24px', width: '36px', textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', fontSize: '15px', color: '#0f172a' }}>{item.label}</div>
                <div style={{ fontSize: '13px', color: '#94a3b8' }}>{item.desc}</div>
              </div>
              <span style={{ color: '#cbd5e1', fontSize: '18px' }}>›</span>
            </button>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={() => { logout(); navigate('/login'); }}
          style={{
            width: '100%',
            padding: '16px',
            background: '#fee2e2',
            color: '#dc2626',
            border: '2px solid #fecaca',
            borderRadius: '16px',
            fontWeight: '800',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#fecaca')}
          onMouseLeave={e => (e.currentTarget.style.background = '#fee2e2')}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
