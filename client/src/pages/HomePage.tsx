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
  description?: string;
  farmer: { name: string; rating: number };
}

const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Rice', 'Pulses', 'Dairy'];

const CATEGORY_ICONS: Record<string, string> = {
  All: '🛒', Vegetables: '🥦', Fruits: '🍎', Rice: '🌾', Pulses: '🫘', Dairy: '🥛',
};

const BANNERS = [
  { id: 1, image: 'banners/offer_delivery.png', title: 'Free Delivery', subtitle: 'On orders above ₹200' },
  { id: 2, image: 'banners/offer_vegetables.png', title: 'Pure Farm Fresh', subtitle: 'Pure farm fresh vegetables' },
  { id: 3, image: 'banners/offer_fruits.png', title: 'Luxury Orchard Fruits', subtitle: '100% natural and handpicked' },
  { id: 4, image: 'banners/offer_grains.png', title: 'Pulses & Rice', subtitle: 'Traditional premium quality' },
];

const SAMPLE_PRODUCTS: Product[] = [
  { id: 's1', name: 'Organic Basmati Rice (Basmati Biyyam)', category: 'rice', basePrice: 120, unit: 'kg', availableQty: 50, farmer: { name: 'Ravi Kumar', rating: 4.8 } },
  { id: 's2', name: 'Red Lentils (Masoor Dal)', category: 'pulse', basePrice: 85, unit: 'kg', availableQty: 30, farmer: { name: 'Priya Singh', rating: 4.5 } },
  { id: 's3', name: 'Fresh Spinach (Palakura)', category: 'vegetable', basePrice: 25, unit: 'bunch', availableQty: 80, farmer: { name: 'Mohan Farms', rating: 4.7 } },
  { id: 's4', name: 'Alphonso Mangoes (Mamidi Pandu)', category: 'fruit', basePrice: 350, unit: 'dozen', availableQty: 20, farmer: { name: 'Konkan Harvest', rating: 4.9 } },
  { id: 's5', name: 'Green Moong Dal (Pesarapappu)', category: 'pulse', basePrice: 95, unit: 'kg', availableQty: 40, farmer: { name: 'Priya Singh', rating: 4.5 } },
  { id: 's6', name: 'Fresh Tomatoes', category: 'vegetable', basePrice: 30, unit: 'kg', availableQty: 100, farmer: { name: 'Ravi Kumar', rating: 4.8 } },
  { id: 's7', name: 'Organic Bananas (Arati Pandu)', category: 'fruit', basePrice: 45, unit: 'dozen', availableQty: 60, farmer: { name: 'Green Valley', rating: 4.3 } },
  { id: 's8', name: 'Brown Rice', category: 'rice', basePrice: 90, unit: 'kg', availableQty: 35, farmer: { name: 'Ravi Kumar', rating: 4.8 } },
];

const categoryEmoji: Record<string, string> = {
  rice: '🌾', pulse: '🫘', vegetable: '🥦', fruit: '🍎',
};

const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeBanner, setActiveBanner] = useState(0);
  const navigate = useNavigate();
  const { addToCart, items } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async (lat: number, lon: number) => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`/api/v1/products?lat=${lat}&lon=${lon}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(data.products?.length ? data.products : SAMPLE_PRODUCTS);
      } catch {
        setProducts(SAMPLE_PRODUCTS);
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

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBanner(prev => (prev + 1) % BANNERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const catMap: Record<string, string> = {
      'Vegetables': 'vegetable',
      'Fruits': 'fruit',
      'Rice': 'rice',
      'Pulses': 'pulse',
      'Dairy': 'dairy'
    };
    const matchCat = activeCategory === 'All' || p.category === catMap[activeCategory];
    return matchSearch && matchCat;
  });

  const handleAddToCart = (p: Product) => {
    addToCart({ productId: p.id, name: p.name, price: p.basePrice, unit: p.unit, farmerName: p.farmer?.name });
    toast(`🛒 ${p.name} added to cart!`, 'success');
  };

  const inCart = (id: string) => items.find(i => i.productId === id);

  if (loading) {
    return (
      <div style={{ padding: '40px 20px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ height: '200px', borderRadius: '20px', marginBottom: '32px' }} className="skeleton" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ height: '280px', borderRadius: '16px' }} className="skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--color-background)', padding: '0 0 40px 0' }}>
      {/* Vintage Premium Promotional Banners Slider (Half of the page height, un-stretched actual poster centered) */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '50vh', // Half of the page height!
        minHeight: '350px',
        maxHeight: '520px',
        overflow: 'hidden',
        borderBottom: '4px solid rgba(212, 175, 55, 0.5)', // gold vintage border outline
        background: '#0e2416', // Deep vintage dark green background
      }}>
        {/* Slides */}
        <div style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          transform: `translateX(-${activeBanner * 100}%)`,
          transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          {BANNERS.map((banner, index) => (
            <div key={banner.id} style={{
              minWidth: '100%',
              height: '100%',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}>
              {/* Blurred background representation of the poster */}
              {index !== 0 && (
                <img
                  src={`${import.meta.env.BASE_URL}${banner.image}`}
                  alt=""
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'blur(30px) brightness(0.35) sepia(0.2)',
                    transform: 'scale(1.15)', // Prevent white edges during blur
                    zIndex: 1,
                  }}
                />
              )}
              
              {/* Actual poster */}
              <img
                src={`${import.meta.env.BASE_URL}${banner.image}`}
                alt={banner.title}
                style={{
                  position: 'relative',
                  height: '100%',
                  maxHeight: '100%',
                  width: index === 0 ? '100%' : 'auto',
                  objectFit: index === 0 ? 'cover' : 'contain', // index 0 fills the header place, others preserve aspect ratio
                  zIndex: 2,
                  boxShadow: index === 0 ? 'none' : '0 10px 40px rgba(0,0,0,0.5)',
                }}
              />
            </div>
          ))}
        </div>

        {/* Left Arrow */}
        <button
          onClick={() => setActiveBanner(prev => (prev - 1 + BANNERS.length) % BANNERS.length)}
          style={{
            position: 'absolute',
            top: '50%',
            left: '24px',
            transform: 'translateY(-50%)',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(28, 25, 23, 0.65)',
            border: '1.5px solid rgba(212, 175, 55, 0.5)',
            color: '#d4af37',
            fontSize: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            backdropFilter: 'blur(8px)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(28, 25, 23, 0.85)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(28, 25, 23, 0.65)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
          }}
        >
          ‹
        </button>

        {/* Right Arrow */}
        <button
          onClick={() => setActiveBanner(prev => (prev + 1) % BANNERS.length)}
          style={{
            position: 'absolute',
            top: '50%',
            right: '24px',
            transform: 'translateY(-50%)',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(28, 25, 23, 0.65)',
            border: '1.5px solid rgba(212, 175, 55, 0.5)',
            color: '#d4af37',
            fontSize: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            backdropFilter: 'blur(8px)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(28, 25, 23, 0.85)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(28, 25, 23, 0.65)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
          }}
        >
          ›
        </button>

        {/* Dot Indicators */}
        <div style={{
          position: 'absolute',
          bottom: '24px',
          right: '24px',
          display: 'flex',
          gap: '8px',
          zIndex: 10,
        }}>
          {BANNERS.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveBanner(index)}
              style={{
                width: activeBanner === index ? '24px' : '8px',
                height: '8px',
                borderRadius: '99px',
                background: activeBanner === index ? '#d4af37' : 'rgba(255,255,255,0.4)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Page Content Wrapper */}
      <div style={{ maxWidth: '1280px', margin: '40px auto 0 auto', padding: '0 20px' }}>
        {/* Centered Vintage Search Bar */}
        <div style={{
          maxWidth: '640px',
          margin: '0 auto 40px auto',
          display: 'flex',
          background: 'var(--color-surface)',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '2px solid var(--color-border)',
          boxShadow: '0 10px 25px rgba(27,63,39,0.05)',
          transition: 'all 0.3s',
        }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--color-primary)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(27,63,39,0.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--color-border)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(27,63,39,0.05)';
          }}
        >
          <span style={{ padding: '0 16px', fontSize: '20px', display: 'flex', alignItems: 'center' }}>🔍</span>
          <input
            type="text"
            placeholder="Search for vegetables, fruits, grains..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1,
              padding: '16px 0',
              border: 'none',
              outline: 'none',
              fontSize: '15px',
              color: 'var(--color-text)',
              background: 'transparent',
            }}
          />
        </div>

        {/* Category chips */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 20px',
              borderRadius: '99px',
              border: `2px solid ${activeCategory === cat ? 'var(--color-primary)' : 'var(--color-border)'}`,
              background: activeCategory === cat ? 'var(--color-primary)' : 'var(--color-surface)',
              color: activeCategory === cat ? '#fff' : 'var(--color-text)',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: activeCategory === cat ? '0 4px 12px rgba(27,63,39,0.3)' : 'none',
            }}>
              <span>{CATEGORY_ICONS[cat]}</span>
              {cat}
            </button>
          ))}
        </div>

        {/* Section header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a' }}>
            {activeCategory === 'All' ? 'All Products' : activeCategory}
            <span style={{ marginLeft: '10px', fontSize: '15px', color: '#64748b', fontWeight: '500' }}>
              ({filtered.length} items)
            </span>
          </h2>
          <button
            onClick={() => navigate('/rice-pulses')}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: '2px solid var(--color-primary)',
              borderRadius: '99px',
              color: 'var(--color-primary)',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Rice & Pulses →
          </button>
        </div>

        {/* Product grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <p style={{ fontSize: '18px', fontWeight: '600' }}>No products found</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '20px',
          }}>
            {filtered.map(p => {
              const cartItem = inCart(p.id);
              return (
                <div key={p.id} style={{
                  background: 'var(--color-surface)',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
                  }}
                >
                  {/* Card image area */}
                  <div onClick={() => navigate(`/product/${p.id}`)} style={{
                    height: '160px',
                    background: 'linear-gradient(135deg, #f5efe6 0%, #e7e3d4 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative', overflow: 'hidden',
                  }}>
                    {/* Fallback emoji rendered in background */}
                    <span style={{ position: 'absolute', fontSize: '64px', zIndex: 1 }}>
                      {categoryEmoji[p.category] ?? '🌿'}
                    </span>
                    {p.imageUrl && (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s', zIndex: 2 }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                    <span style={{
                      position: 'absolute', top: '10px', left: '10px',
                      background: 'rgba(255,255,255,0.9)',
                      backdropFilter: 'blur(4px)',
                      color: 'var(--color-primary)',
                      fontSize: '11px', fontWeight: '700',
                      padding: '3px 10px', borderRadius: '99px',
                      textTransform: 'capitalize',
                      zIndex: 3,
                    }}>{p.category}</span>
                  </div>

                  <div style={{ padding: '16px' }}>
                    <h3
                      onClick={() => navigate(`/product/${p.id}`)}
                      style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '4px', cursor: 'pointer' }}
                    >{p.name}</h3>
                    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
                      {p.farmer?.name ?? 'Local Farmer'} · ★ {p.farmer?.rating ?? '4.5'}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-primary)' }}>
                          ₹{p.basePrice}
                        </span>
                        <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '4px' }}>/ {p.unit}</span>
                      </div>
                      <button onClick={() => handleAddToCart(p)} style={{
                        padding: '8px 14px',
                        background: cartItem
                          ? 'var(--color-primary)'
                          : 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: '0 2px 8px rgba(27,63,39,0.3)',
                      }}>
                        {cartItem ? `✓ ${cartItem.qty} in cart` : '+ Add'}
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

export default HomePage;
