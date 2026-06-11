import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface OrderItem { product: { name: string }; qty: number; priceAtOrder: number; }
interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
  farmer?: { name: string };
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string; icon: string }> = {
  PLACED:           { color: '#92400e', bg: '#fef3c7', label: 'Placed',    icon: '📦' },
  FARMER_ACCEPTED:  { color: '#1e40af', bg: '#dbeafe', label: 'Confirmed', icon: '✅' },
  CONFIRMED:        { color: '#1e40af', bg: '#dbeafe', label: 'Confirmed', icon: '✅' },
  DISPATCHED:       { color: '#5b21b6', bg: '#ede9fe', label: 'On the way',icon: '🚚' },
  DELIVERED:        { color: '#166534', bg: '#dcfce7', label: 'Delivered', icon: '🎉' },
  CANCELLED:        { color: '#991b1b', bg: '#fee2e2', label: 'Cancelled', icon: '❌' },
};

const MOCK_ORDERS: Order[] = [
  { id: 'ord-001', status: 'DELIVERED', total: 520, createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), items: [{ product: { name: 'Organic Basmati Rice' }, qty: 2, priceAtOrder: 120 }, { product: { name: 'Red Lentils' }, qty: 3, priceAtOrder: 85 }], farmer: { name: 'Ravi Kumar' } },
  { id: 'ord-002', status: 'DISPATCHED', total: 350, createdAt: new Date(Date.now() - 3600000).toISOString(), items: [{ product: { name: 'Alphonso Mangoes' }, qty: 1, priceAtOrder: 350 }], farmer: { name: 'Konkan Harvest' } },
  { id: 'ord-003', status: 'PLACED', total: 165, createdAt: new Date().toISOString(), items: [{ product: { name: 'Fresh Spinach' }, qty: 3, priceAtOrder: 25 }, { product: { name: 'Organic Bananas' }, qty: 2, priceAtOrder: 45 }], farmer: { name: 'Mohan Farms' } },
];

const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('/api/v1/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Always use server data — never fall back to fake orders
        setOrders(data.orders ?? []);
      } catch {
        // If the request fails (e.g. server down), show empty state — not fake data
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--color-background)', padding: '32px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>My Orders</h1>
        <p style={{ color: '#64748b', marginBottom: '28px', fontSize: '15px' }}>{orders.length} order{orders.length !== 1 ? 's' : ''} total</p>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '140px', borderRadius: '20px' }} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📦</div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>No orders yet</h2>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>Start shopping to see your orders here</p>
            <button onClick={() => navigate('/home')} style={{
              padding: '12px 28px',
              background: 'var(--color-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '15px',
            }}>Browse Products</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {orders.map(order => {
              const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PLACED;
              const date = new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
              return (
                <div key={order.id} style={{
                  background: 'var(--color-surface)',
                  borderRadius: '20px',
                  padding: '20px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  border: '2px solid transparent',
                }}
                  onClick={() => navigate(`/track/${order.id}`)}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
                    (e.currentTarget as HTMLElement).style.borderColor = '#bbf7d0';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '16px', color: '#0f172a', marginBottom: '4px' }}>
                        {cfg.icon} Order #{order.id.slice(0, 8).toUpperCase()}
                      </div>
                      <div style={{ fontSize: '13px', color: '#94a3b8' }}>{date} · {order.farmer?.name ?? 'Local Farm'}</div>
                    </div>
                    <span style={{
                      padding: '5px 12px',
                      borderRadius: '99px',
                      fontSize: '12px',
                      fontWeight: '700',
                      background: cfg.bg,
                      color: cfg.color,
                    }}>{cfg.label}</span>
                  </div>

                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                      {order.items?.slice(0, 2).map(i => i.product?.name).join(', ')}
                      {(order.items?.length ?? 0) > 2 ? ` +${(order.items?.length ?? 0) - 2} more` : ''}
                    </div>
                    <div style={{ fontWeight: '800', fontSize: '18px', color: 'var(--color-primary)' }}>₹{order.total}</div>
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

export default OrderHistoryPage;
