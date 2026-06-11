import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/ToastProvider';

const CartPage: React.FC = () => {
  const { items, totalPrice, updateQty, removeFromCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();

  const deliveryFee = items.length > 0 ? 40 : 0;
  const grandTotal = totalPrice + deliveryFee;

  const handleRemove = (name: string, productId: string) => {
    removeFromCart(productId);
    toast(`Removed ${name} from cart`, 'success');
  };

  const categoryEmoji: Record<string, string> = {
    rice: '🌾', pulse: '🫘', vegetable: '🥦', fruit: '🍎',
  };

  if (items.length === 0) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-background)',
        padding: '40px 20px',
      }}>
        <div style={{ fontSize: '80px', marginBottom: '24px' }}>🛒</div>
        <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>Your cart is empty</h2>
        <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '16px' }}>
          Add some fresh organic products to get started!
        </p>
        <button
          onClick={() => navigate('/home')}
          style={{
            padding: '14px 32px',
            background: 'linear-gradient(135deg, var(--color-primary) 0%, #0d9488 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '14px',
            fontSize: '16px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(22,163,74,0.35)',
          }}
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--color-background)', padding: '32px 20px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '28px' }}>
          🛒 My Cart <span style={{ fontSize: '16px', color: '#64748b', fontWeight: '500' }}>({items.length} items)</span>
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px', alignItems: 'start' }}>
          {/* Cart items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {items.map(item => (
              <div key={item.productId} style={{
                background: 'var(--color-surface)',
                borderRadius: '16px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                transition: 'box-shadow 0.2s',
              }}>
                {/* Product icon */}
                <div style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '36px',
                  flexShrink: 0,
                }}>🥬</div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', fontSize: '16px', color: '#0f172a', marginBottom: '4px' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
                    {item.farmerName ? `From ${item.farmerName}` : 'Local Farm'} · ₹{item.price}/{item.unit}
                  </div>
                  {/* Qty controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button onClick={() => updateQty(item.productId, item.qty - 1)} style={qtyBtnStyle}>−</button>
                    <span style={{ fontWeight: '700', fontSize: '16px', minWidth: '24px', textAlign: 'center' }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.productId, item.qty + 1)} style={qtyBtnStyle}>+</button>
                  </div>
                </div>

                {/* Price + remove */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-primary)', marginBottom: '8px' }}>
                    ₹{item.price * item.qty}
                  </div>
                  <button onClick={() => handleRemove(item.name, item.productId)} style={{
                    background: 'none',
                    border: '1px solid #fee2e2',
                    borderRadius: '8px',
                    color: '#ef4444',
                    fontSize: '12px',
                    fontWeight: '600',
                    padding: '4px 10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}>
                    🗑 Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div style={{
            background: 'var(--color-surface)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            position: 'sticky',
            top: '84px',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: '#0f172a' }}>Order Summary</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <SummaryRow label="Subtotal" value={`₹${totalPrice}`} />
              <SummaryRow label="Delivery Fee" value={`₹${deliveryFee}`} muted />
              <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '12px', marginTop: '4px' }}>
                <SummaryRow label="Total" value={`₹${grandTotal}`} bold />
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              style={{
                width: '100%',
                padding: '16px',
                background: 'linear-gradient(135deg, var(--color-primary) 0%, #0d9488 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '14px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(22,163,74,0.35)',
                transition: 'all 0.2s',
              }}
            >
              Proceed to Checkout →
            </button>
            <button
              onClick={() => navigate('/home')}
              style={{
                width: '100%',
                padding: '12px',
                background: 'none',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#64748b',
                cursor: 'pointer',
                marginTop: '10px',
                transition: 'all 0.2s',
              }}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const qtyBtnStyle: React.CSSProperties = {
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  border: '2px solid #e2e8f0',
  background: '#f8fafc',
  fontSize: '16px',
  fontWeight: '700',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s',
  color: '#0f172a',
};

function SummaryRow({ label, value, muted, bold }: { label: string; value: string; muted?: boolean; bold?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '14px', color: muted ? '#94a3b8' : '#475569', fontWeight: bold ? '700' : '500' }}>{label}</span>
      <span style={{ fontSize: bold ? '20px' : '15px', fontWeight: bold ? '800' : '600', color: bold ? 'var(--color-primary)' : '#0f172a' }}>{value}</span>
    </div>
  );
}

export default CartPage;
