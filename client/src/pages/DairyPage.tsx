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
  { id: 'd1', name: 'Organic Cow Milk (Aavu Paalu)', category: 'dairy', basePrice: 35, unit: '500ml', availableQty: 150, farmer: { name: 'Priya Organics', rating: 4.5 } },
  { id: 'd2', name: 'Organic Buffalo Milk (Genumu Paalu)', category: 'dairy', basePrice: 40, unit: '500ml', availableQty: 120, farmer: { name: 'Ravi Kumar', rating: 4.8 } },
  { id: 'd3', name: 'Fresh Paneer (Paneer)', category: 'dairy', basePrice: 100, unit: '200g', availableQty: 80, farmer: { name: 'Mohan Farms', rating: 4.7 } },
];

const MilkIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#bca374" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);

const DairyPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, items } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async (lat: number, lon: number) => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`/api/v1/products?lat=${lat}&lon=${lon}&category=dairy`, {
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
          <h1 style={{ fontSize: '36px', fontWeight: '800', fontFamily: 'serif', color: '#f5ebe0', marginBottom: '10px' }}>Organic Dairy</h1>
          <p style={{ fontSize: '16px', color: '#d6ccc2' }}>Fresh, pure dairy products straight from local farms</p>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton" style={{ height: '220px', borderRadius: '16px' }} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {products.map(p => {
              const cart = inCart(p.id);
              return (
                <div key={p.id} style={{
                  background: 'var(--color-surface)',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 16px rgba(27,63,39,0.06)',
                  border: '1px solid var(--color-border)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(27,63,39,0.12)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(27,63,39,0.06)';
                  }}
                >
                  <div
                    onClick={() => navigate(`/product/${p.id}`)}
                    style={{
                      height: '140px',
                      background: 'linear-gradient(135deg, #f5efe6 0%, #e7e3d4 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                    }}>
                    {/* Fallback SVG rendered in background */}
                    <div style={{ position: 'absolute', zIndex: 1 }}>
                      <MilkIcon />
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
                    <h3 onClick={() => navigate(`/product/${p.id}`)} style={{ fontWeight: '700', fontSize: '15px', color: 'var(--color-text)', marginBottom: '4px', cursor: 'pointer' }}>{p.name}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>{p.farmer?.name} · ★ {p.farmer?.rating}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '800', fontSize: '18px', color: 'var(--color-primary)' }}>₹{p.basePrice}<span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: '400' }}>/{p.unit}</span></span>
                      <button onClick={() => handleAdd(p)} style={{
                        padding: '8px 14px',
                        background: cart ? 'var(--color-primary)' : 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(27,63,39,0.3)',
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

export default DairyPage;
