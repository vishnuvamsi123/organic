import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastProvider';

type Mode = 'login' | 'register';

const LoginPage: React.FC = () => {
  const [mode, setMode] = useState<Mode>('login');
  const [role, setRole] = useState<'user' | 'farmer'>('user');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname ?? '/home';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'register' && password !== confirm) {
      toast('Passwords do not match', 'error');
      return;
    }
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/v1/auth/login' : '/api/v1/auth/register';
      const payload = mode === 'login'
        ? { role, email, password }
        : { role, name, email, password };
      const { data } = await axios.post(endpoint, payload);
      login(data.token, data.role);
      // Store user info for profile display
      if (data.email) localStorage.setItem('email', data.email);
      if (data.name) localStorage.setItem('userName', data.name);
      toast(`✅ ${mode === 'login' ? 'Welcome back!' : 'Account created!'}`, 'success');
      navigate(data.role === 'farmer' ? '/farmer-dashboard' : from, { replace: true });
    } catch (err: any) {
      toast(err?.response?.data?.error ?? 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
      background: 'var(--color-background)',
    }}>
      {/* Left – Illustration panel */}
      <div style={{
        background: 'linear-gradient(145deg, #0e2416 0%, #1b3f27 50%, #09170e 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 48px',
        color: '#fff',
        borderRight: '4px solid rgba(212, 175, 55, 0.45)',
      }}>
        <img src="/logo.jpg" alt="Logo" style={{ width: '250px', height: '250px', borderRadius: '60px', marginBottom: '32px', border: '4px solid rgba(212,175,55,0.4)', boxShadow: '0 12px 48px rgba(0,0,0,0.35)' }} />
        <h1 style={{ fontSize: '36px', fontWeight: '800', fontFamily: 'serif', color: '#f5ebe0', marginBottom: '16px', textAlign: 'center', lineHeight: 1.2 }}>
          Farm Fresh,<br />Delivered Daily
        </h1>
        <p style={{ fontSize: '16px', color: '#d6ccc2', textAlign: 'center', maxWidth: '320px', lineHeight: 1.6 }}>
          Connect with local organic farmers and get the freshest produce straight to your door.
        </p>
        <div style={{
          display: 'flex',
          gap: '16px',
          marginTop: '48px',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          {['🥕 Vegetables', '🍎 Fruits', '🌾 Grains', '🥛 Dairy'].map(item => (
            <span key={item} style={{
              background: 'rgba(255,255,255,0.18)',
              padding: '8px 16px',
              borderRadius: '99px',
              fontSize: '13px',
              fontWeight: '600',
              backdropFilter: 'blur(8px)',
            }}>{item}</span>
          ))}
        </div>
      </div>

      {/* Right – Form panel */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 32px',
        background: 'var(--color-surface)',
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          {/* Toggle mode */}
          <div style={{
            display: 'flex',
            background: '#f1f5f9',
            borderRadius: '12px',
            padding: '4px',
            marginBottom: '32px',
          }}>
            {(['login', 'register'] as Mode[]).map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1,
                padding: '10px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s',
                background: mode === m ? '#fff' : 'transparent',
                color: mode === m ? 'var(--color-primary)' : '#64748b',
                boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}>
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <h2 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '8px', color: '#0f172a' }}>
            {mode === 'login' ? 'Welcome back 👋' : 'Join Organic 🌱'}
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '28px' }}>
            {mode === 'login'
              ? 'Sign in to browse fresh organic produce'
              : 'Create your account to get started'}
          </p>

          {/* Role tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {(['user', 'farmer'] as const).map(r => (
              <button key={r} onClick={() => setRole(r)} style={{
                flex: 1,
                padding: '10px',
                borderRadius: '10px',
                border: `2px solid ${role === r ? 'var(--color-primary)' : '#e2e8f0'}`,
                background: role === r ? 'var(--color-primary-light)' : '#fff',
                color: role === r ? 'var(--color-primary-dark)' : '#64748b',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}>
                {r === 'user' ? '🛒 Customer' : '👨‍🌾 Farmer'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {mode === 'register' && (
              <InputField
                type="text"
                placeholder={role === 'farmer' ? 'Farm / Business name' : 'Full Name'}
                value={name}
                onChange={setName}
                icon="👤"
                required
              />
            )}
            <InputField
              type="email"
              placeholder="Email address"
              value={email}
              onChange={setEmail}
              icon="✉️"
              required
            />
            <InputField
              type="password"
              placeholder="Password"
              value={password}
              onChange={setPassword}
              icon="🔒"
              required
            />
            {mode === 'register' && (
              <InputField
                type="password"
                placeholder="Confirm password"
                value={confirm}
                onChange={setConfirm}
                icon="🔒"
                required
              />
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '8px',
                padding: '14px',
                background: loading
                  ? '#78716c'
                  : 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(22,163,74,0.35)',
              }}
            >
              {loading ? '⏳ Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#64748b' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              style={{ color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
            >
              {mode === 'login' ? 'Register here' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

/* Small reusable input with icon */
function InputField({
  type, placeholder, value, onChange, icon, required,
}: {
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  icon: string;
  required?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      border: `2px solid ${focused ? 'var(--color-primary)' : '#e2e8f0'}`,
      borderRadius: '12px',
      overflow: 'hidden',
      transition: 'border-color 0.2s',
      background: 'var(--color-surface)',
      boxShadow: focused ? 'var(--shadow-glow)' : 'none',
    }}>
      <span style={{ padding: '0 12px', fontSize: '18px' }}>{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        required={required}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          flex: 1,
          padding: '12px 12px 12px 0',
          border: 'none',
          outline: 'none',
          fontSize: '15px',
          background: 'transparent',
          color: '#0f172a',
        }}
      />
    </div>
  );
}

export default LoginPage;
