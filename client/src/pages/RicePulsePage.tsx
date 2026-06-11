import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/ToastProvider';

interface Product {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  unit: string;
  availableQty: number;
  imageUrl?: string;
  farmer: { name: string; rating: number };
}

const SAMPLE: Product[] = [
  { id: 'r1', name: 'Organic Basmati Rice', category: 'rice', basePrice: 120, unit: 'kg', availableQty: 50, farmer: { name: 'Ravi Kumar', rating: 4.8 } },
  { id: 'r2', name: 'Brown Rice', category: 'rice', basePrice: 90, unit: 'kg', availableQty: 35, farmer: { name: 'Ravi Kumar', rating: 4.8 } },
  { id: 'r3', name: 'Sona Masuri Rice', category: 'rice', basePrice: 75, unit: 'kg', availableQty: 60, farmer: { name: 'Sri Farms', rating: 4.6 } },
  { id: 'r4', name: 'Red Lentils (Masoor Dal)', category: 'pulse', basePrice: 85, unit: 'kg', availableQty: 30, farmer: { name: 'Priya Singh', rating: 4.5 } },
  { id: 'r5', name: 'Green Moong Dal', category: 'pulse', basePrice: 95, unit: 'kg', availableQty: 40, farmer: { name: 'Priya Singh', rating: 4.5 } },
  { id: 'r6', name: 'Chana Dal', category: 'pulse', basePrice: 80, unit: 'kg', availableQty: 55, farmer: { name: 'Punjab Farms', rating: 4.4 } },
];

const RiceIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#bca374" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20M17 5a9 9 0 00-5 5M7 5a9 9 0 015 5M17 11a9 9 0 00-5 5M7 11a9 9 0 015 5" />
  </svg>
);

const PulseIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#bca374" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="12" r="4" />
    <circle cx="16" cy="12" r="4" />
  </svg>
);

const RicePulsePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'rice' | 'pulse'>('all');
  const { addToCart, items } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async (lat: number, lon: number) => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`/api/v1/products?lat=${lat}&lon=${lon}&category=rice,pulse`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(data.products?.length ? data.products : SAMPLE);
      } catch {
        setProducts(SAMPLE);
      } finally {
        setLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchProducts(position.coords.latitude, position.coords.longitude);
        },
        () => {
          fetchProducts(16.5787, 82.0061);
        }
      );
    } else {
      fetchProducts(16.5787, 82.0061);
    }
  }, []);

  const filtered = activeTab === 'all' ? products : products.filter(p => p.category === activeTab);
  const inCart = (id: string) => items.find(i => i.productId === id);

  const handleAdd = (p: Product) => {
    addToCart({ productId: p.id, name: p.name, price: p.basePrice, unit: p.unit, farmerName: p.farmer?.name });
    toast(`🛒 ${p.name} added!`, 'success');
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--color-background)' }}>
      <div style={{
        position: 'relative',
        backgroundImage: 'linear-gradient(rgba(14, 36, 22, 0.45), rgba(14, 36, 22, 0.55)), url("/images/custom_page_bg.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '100px 20px',
        textAlign: 'center',
        color: '#fff',
        borderBottom: '3px solid rgba(212, 175, 55, 0.45)',
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{ fontSize: '42px', fontWeight: '800', fontFamily: 'serif', color: '#f5ebe0', marginBottom: '10px' }}>Rice & Pulses</h1>
          <p style={{ fontSize: '18px', color: '#d6ccc2' }}>Premium organic grains from certified farms</p>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '28px' }}>
          {([['all', 'All'], ['rice', 'Rice'], ['pulse', 'Pulses']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)} style={{
              padding: '10px 22px',
              borderRadius: '99px',
              border: `2px solid ${activeTab === key ? '#92400e' : '#e2e8f0'}`,
              background: activeTab === key ? '#92400e' : '#fff',
              color: activeTab === key ? '#fff' : '#475569',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton" style={{ height: '220px', borderRadius: '16px' }} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {filtered.map(p => {
              const cart = inCart(p.id);
              return (
                <div key={p.id} style={{
                  background: 'var(--color-surface)',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                  transition: 'transform 0.2s',
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'}
                >
                  <div
                    onClick={() => navigate(`/product/${p.id}`)}
                    style={{
                      height: '120px',
                      background: p.category === 'rice'
                        ? 'linear-gradient(135deg, #fef3c7, #fde68a)'
                        : 'linear-gradient(135deg, #f3e8ff, #e9d5ff)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer',
                    }}>
                    {/* Fallback SVG rendered in background */}
                    <div style={{ position: 'absolute', zIndex: 1 }}>
                      {p.category === 'rice' ? <RiceIcon /> : <PulseIcon />}
                    </div>
                    {p.imageUrl && (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 2 }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                  </div>
                  <div style={{ padding: '16px' }}>
                    <h3 onClick={() => navigate(`/product/${p.id}`)} style={{ fontWeight: '700', fontSize: '15px', color: '#0f172a', marginBottom: '4px', cursor: 'pointer' }}>{p.name}</h3>
                    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>{p.farmer?.name} · ★ {p.farmer?.rating}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '800', fontSize: '18px', color: '#92400e' }}>₹{p.basePrice}<span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '400' }}>/{p.unit}</span></span>
                      <button onClick={() => handleAdd(p)} style={{
                        padding: '8px 14px',
                        background: cart ? '#92400e' : 'linear-gradient(135deg, #92400e, #78350f)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(146,64,14,0.3)',
                      }}>
                        {cart ? `✓ ${cart.qty} in cart` : '+ Add'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RicePulsePage;
