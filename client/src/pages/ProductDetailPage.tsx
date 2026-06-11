import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
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
  description?: string;
  farmer: { id: string; name: string; rating: number; reviewCount: number; lat: number; lon: number };
}

const categoryEmoji: Record<string, string> = {
  rice: '🌾', pulse: '🫘', vegetable: '🥦', fruit: '🍎',
};

const FALLBACK: Record<string, Product> = {
  's1': { id: 's1', name: 'Organic Basmati Rice (Basmati Biyyam)', category: 'rice', basePrice: 120, unit: 'kg', availableQty: 50, farmer: { id: 'f1', name: 'Ravi Kumar', rating: 4.8, reviewCount: 124, lat: 16.5787, lon: 82.0061 } },
  's4': { id: 's4', name: 'Alphonso Mangoes (Mamidi Pandu)', category: 'fruit', basePrice: 350, unit: 'dozen', availableQty: 20, farmer: { id: 'f2', name: 'Konkan Harvest', rating: 4.9, reviewCount: 89, lat: 16.7, lon: 73.3 } },
};

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, items, updateQty } = useCart();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  const cartItem = items.find(i => i.productId === id);

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`/api/v1/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProduct(data.product);
      } catch {
        setProduct(FALLBACK[id ?? ''] ?? null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < qty; i++) {
      addToCart({ productId: product.id, name: product.name, price: product.basePrice, unit: product.unit, farmerName: product.farmer?.name });
    }
    toast(`🛒 ${qty}× ${product.name} added to cart!`, 'success');
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
        <div className="skeleton" style={{ height: '320px', borderRadius: '24px', marginBottom: '24px' }} />
        <div className="skeleton" style={{ height: '200px', borderRadius: '16px' }} />
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: '48px' }}>😕</div>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '16px' }}>Product not found</h2>
        <button onClick={() => navigate('/home')} style={{ marginTop: '16px', padding: '12px 24px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '600' }}>
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--color-background)', padding: '32px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Back */}
        <button onClick={() => navigate(-1)} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--color-primary)', fontWeight: '600', fontSize: '15px',
          marginBottom: '24px', padding: 0,
        }}>
          ← Back
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>
          {/* Left: Image */}
          <div style={{
            background: '#f0fdf4', borderRadius: '24px', height: '340px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Fallback emoji rendered in background */}
            <span style={{ position: 'absolute', fontSize: '120px', zIndex: 1 }}>
              {categoryEmoji[product.category] ?? '🌿'}
            </span>
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.name}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 2 }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
            <div style={{
              position: 'absolute', top: '16px', right: '16px',
              background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)',
              padding: '6px 14px', borderRadius: '99px',
              fontSize: '13px', fontWeight: '700', color: 'var(--color-primary)',
              textTransform: 'capitalize', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}>{product.category}</div>
            {product.description && (
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                padding: '32px 20px 16px',
              }} />
            )}
          </div>

          {/* Right: Details */}
          <div>
            <h1 style={{ fontSize: '30px', fontWeight: '800', color: '#0f172a', marginBottom: '8px', lineHeight: 1.2 }}>
              {product.name}
            </h1>

            {/* Farmer info */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: '#f0fdf4',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '20px',
              border: '1px solid #bbf7d0',
            }}>
              <span style={{ fontSize: '28px' }}>👨‍🌾</span>
              <div>
                <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '15px' }}>{product.farmer?.name ?? 'Local Farmer'}</div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>
                  ★ {product.farmer?.rating ?? 4.5} · {product.farmer?.reviewCount ?? 50}+ reviews
                </div>
              </div>
            </div>

            {/* Price */}
            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '36px', fontWeight: '900', color: 'var(--color-primary)' }}>₹{product.basePrice}</span>
              <span style={{ fontSize: '16px', color: '#64748b', marginLeft: '6px' }}>per {product.unit}</span>
            </div>

            {/* Availability */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: product.availableQty > 10 ? '#dcfce7' : '#fef3c7',
              color: product.availableQty > 10 ? '#166534' : '#92400e',
              padding: '6px 14px',
              borderRadius: '99px',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '24px',
            }}>
              {product.availableQty > 10 ? '✅ In Stock' : `⚠️ Only ${product.availableQty} left`}
            </div>

            {/* Description */}
            <p style={{ color: '#475569', fontSize: '15px', lineHeight: 1.7, marginBottom: '28px' }}>
              {product.description ?? '100% certified organic, sourced directly from local farms. No pesticides, no preservatives. Freshly harvested and delivered within 24 hours of your order. Supports sustainable farming practices.'}
            </p>

            {/* Qty selector + Add to cart */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                overflow: 'hidden',
              }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{
                  padding: '10px 16px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#0f172a',
                }}>−</button>
                <span style={{ padding: '10px 16px', fontWeight: '700', fontSize: '16px', color: '#0f172a', minWidth: '40px', textAlign: 'center' }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.availableQty, q + 1))} style={{
                  padding: '10px 16px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#0f172a',
                }}>+</button>
              </div>
              <button onClick={handleAddToCart} style={{
                flex: 1,
                padding: '14px 20px',
                background: 'linear-gradient(135deg, var(--color-primary) 0%, #0d9488 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(22,163,74,0.35)',
                transition: 'all 0.2s',
              }}>
                🛒 Add {qty} to Cart — ₹{product.basePrice * qty}
              </button>
            </div>

            {cartItem && (
              <p style={{ fontSize: '13px', color: 'var(--color-primary)', fontWeight: '600' }}>
                ✓ Already {cartItem.qty} in your cart
              </p>
            )}
          </div>
        </div>

        {/* Reviews section */}
        <div style={{ marginTop: '48px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '20px' }}>Customer Reviews</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {[
              { name: 'Arjun R.', rating: 5, comment: 'Absolutely fresh! Delivered the same day. Will order again.', date: '3 days ago' },
              { name: 'Meena P.', rating: 5, comment: 'Best quality organic produce I\'ve had. Farmer Ravi is amazing!', date: '1 week ago' },
              { name: 'Suresh K.', rating: 4, comment: 'Good quality, slight delay in delivery but product was fresh.', date: '2 weeks ago' },
            ].map(review => (
              <div key={review.name} style={{
                background: 'var(--color-surface)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '700', color: '#0f172a' }}>{review.name}</span>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>{review.date}</span>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </div>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
