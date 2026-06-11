import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';
import { useAuth } from '../context/AuthContext';

interface Product {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  unit: string;
  availableQty: number;
}

interface FarmerOrder {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  user?: { email: string };
  items?: { product: { name: string }; qty: number }[];
}

const FarmerDashboardPage: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState<'orders' | 'products'>('orders');
  const [orders, setOrders] = useState<FarmerOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', category: 'vegetable', basePrice: '', unit: 'kg', availableQty: '' });

  const token = localStorage.getItem('token');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, productsRes] = await Promise.all([
        axios.get('/api/v1/farmers/orders', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/v1/farmers/products', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setOrders(ordersRes.data.orders ?? []);
      setProducts(productsRes.data.products ?? []);
    } catch {
      setOrders([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const acceptOrder = async (orderId: string) => {
    try {
      await axios.post(`/api/v1/farmers/orders/${orderId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast('✅ Order accepted!', 'success');
      fetchData();
    } catch {
      toast('Failed to accept order', 'error');
    }
  };

  const addProduct = async () => {
    try {
      await axios.post('/api/v1/farmers/products', {
        name: newProduct.name,
        category: newProduct.category,
        basePrice: Number(newProduct.basePrice),
        unit: newProduct.unit,
        availableQty: Number(newProduct.availableQty),
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast('✅ Product added!', 'success');
      setShowAddProduct(false);
      setNewProduct({ name: '', category: 'vegetable', basePrice: '', unit: 'kg', availableQty: '' });
      fetchData();
    } catch {
      toast('Failed to add product', 'error');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await axios.delete(`/api/v1/farmers/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast('Product deleted', 'success');
      fetchData();
    } catch {
      toast('Failed to delete product', 'error');
    }
  };

  const stats = [
    { label: 'Pending Orders', value: orders.filter(o => o.status === 'PLACED').length, icon: '📦', color: '#fef3c7', textColor: '#92400e' },
    { label: 'Active Orders', value: orders.filter(o => o.status === 'FARMER_ACCEPTED').length, icon: '🚚', color: '#dbeafe', textColor: '#1e40af' },
    { label: 'Products Listed', value: products.length, icon: '🌿', color: '#dcfce7', textColor: '#166534' },
    { label: 'Total Revenue', value: `₹${orders.filter(o => o.status !== 'CANCELLED').reduce((s, o) => s + o.total, 0)}`, icon: '💰', color: '#ede9fe', textColor: '#5b21b6' },
  ];

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--color-background)', padding: '32px 20px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>👨‍🌾 Farmer Dashboard</h1>
            <p style={{ color: '#64748b', fontSize: '15px' }}>Manage your products and incoming orders</p>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }} style={{
            padding: '10px 20px',
            background: '#fee2e2',
            color: '#dc2626',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            fontSize: '14px',
          }}>🚪 Logout</button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {stats.map(s => (
            <div key={s.label} style={{
              background: 'var(--color-surface)',
              borderRadius: '20px',
              padding: '20px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: s.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                flexShrink: 0,
              }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: s.textColor }}>{s.value}</div>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '14px', padding: '4px', marginBottom: '24px', width: 'fit-content' }}>
          {(['orders', 'products'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '10px 24px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '14px',
              background: tab === t ? '#fff' : 'transparent',
              color: tab === t ? 'var(--color-primary)' : '#64748b',
              boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s',
            }}>
              {t === 'orders' ? '📦 Orders' : '🌿 My Products'}
            </button>
          ))}
        </div>

        {/* Orders tab */}
        {tab === 'orders' && (
          <div>
            {loading ? (
              <div className="skeleton" style={{ height: '200px', borderRadius: '20px' }} />
            ) : orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', background: 'var(--color-surface)', borderRadius: '20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
                <p style={{ color: '#64748b', fontWeight: '600' }}>No orders yet. They'll appear here when customers order your products.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {orders.map(order => (
                  <div key={order.id} style={{
                    background: 'var(--color-surface)',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px',
                    flexWrap: 'wrap',
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>
                        {order.user?.email ?? 'Customer'} · ₹{order.total}
                      </div>
                      <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                        {order.items?.map(i => `${i.product?.name} ×${i.qty}`).join(', ')}
                      </div>
                    </div>
                    {order.status === 'PLACED' && (
                      <button onClick={() => acceptOrder(order.id)} style={{
                        padding: '10px 20px',
                        background: 'var(--color-primary)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        fontSize: '14px',
                      }}>Accept Order ✅</button>
                    )}
                    {order.status !== 'PLACED' && (
                      <span style={{
                        padding: '6px 14px',
                        borderRadius: '99px',
                        fontSize: '13px',
                        fontWeight: '700',
                        background: '#dcfce7',
                        color: '#166534',
                      }}>{order.status}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Products tab */}
        {tab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <button onClick={() => setShowAddProduct(true)} style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, var(--color-primary), #0d9488)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '14px',
                boxShadow: '0 4px 12px rgba(22,163,74,0.3)',
              }}>+ Add Product</button>
            </div>

            {showAddProduct && (
              <div style={{
                background: 'var(--color-surface)',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                marginBottom: '20px',
                border: '2px solid #bbf7d0',
              }}>
                <h3 style={{ fontWeight: '700', marginBottom: '16px', color: '#0f172a' }}>Add New Product</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {[
                    { label: 'Product Name', key: 'name', type: 'text', placeholder: 'e.g. Organic Tomatoes' },
                    { label: 'Price (₹)', key: 'basePrice', type: 'number', placeholder: '50' },
                    { label: 'Unit', key: 'unit', type: 'text', placeholder: 'kg / bunch / piece' },
                    { label: 'Available Qty', key: 'availableQty', type: 'number', placeholder: '100' },
                  ].map(field => (
                    <div key={field.key}>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>{field.label}</label>
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={(newProduct as any)[field.key]}
                        onChange={e => setNewProduct(p => ({ ...p, [field.key]: e.target.value }))}
                        style={{ width: '100%', padding: '10px 12px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const }}
                      />
                    </div>
                  ))}
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>Category</label>
                    <select value={newProduct.category} onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))}
                      style={{ width: '100%', padding: '10px 12px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const }}>
                      <option value="vegetable">Vegetable</option>
                      <option value="fruit">Fruit</option>
                      <option value="rice">Rice</option>
                      <option value="pulse">Pulse</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  <button onClick={addProduct} style={{ padding: '10px 24px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>Save Product</button>
                  <button onClick={() => setShowAddProduct(false)} style={{ padding: '10px 24px', background: 'none', border: '2px solid #e2e8f0', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', color: '#64748b' }}>Cancel</button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="skeleton" style={{ height: '200px', borderRadius: '20px' }} />
            ) : products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', background: 'var(--color-surface)', borderRadius: '20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🌱</div>
                <p style={{ color: '#64748b', fontWeight: '600' }}>No products yet. Add your first organic product!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                {products.map(p => (
                  <div key={p.id} style={{ background: 'var(--color-surface)', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
                    <div style={{ fontWeight: '700', fontSize: '16px', color: '#0f172a', marginBottom: '6px' }}>{p.name}</div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>{p.category} · {p.unit} · Qty: {p.availableQty}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '800', fontSize: '18px', color: 'var(--color-primary)' }}>₹{p.basePrice}</span>
                      <button onClick={() => deleteProduct(p.id)} style={{
                        padding: '6px 12px',
                        background: '#fee2e2',
                        color: '#dc2626',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}>🗑 Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerDashboardPage;
