import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/ToastProvider';

type Step = 'address' | 'summary' | 'payment';

const STEPS: { key: Step; label: string; icon: string }[] = [
  { key: 'address', label: 'Address', icon: '📍' },
  { key: 'summary', label: 'Summary', icon: '📋' },
  { key: 'payment', label: 'Payment', icon: '💳' },
];

const CheckoutPage: React.FC = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('address');
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [address, setAddress] = useState({ line1: '', city: 'Amalapuram', state: 'Andhra Pradesh', pincode: '533201' });
  const [coords, setCoords] = useState({ lat: 16.5787, lon: 82.0061 });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCoords({ lat: latitude, lon: longitude });
          try {
            const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            if (res.data && res.data.address) {
              const addr = res.data.address;
              const cityVal = addr.city || addr.town || addr.village || addr.county || 'Amalapuram';
              const stateVal = addr.state || 'Andhra Pradesh';
              const pincodeVal = addr.postcode || '533201';
              const line1Val = [
                addr.road,
                addr.suburb,
                addr.neighbourhood
              ].filter(Boolean).join(', ') || '';

              setAddress({
                line1: line1Val,
                city: cityVal,
                state: stateVal,
                pincode: pincodeVal,
              });
            }
          } catch (e) {
            console.error('Error reverse-geocoding coordinates:', e);
          }
        },
        (error) => {
          console.warn('Geolocation lookup failed or denied, using Amalapuram defaults:', error);
          setCoords({ lat: 16.5787, lon: 82.0061 });
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setCoords({ lat: 16.5787, lon: 82.0061 });
    }
  }, []);

  const delivery = 40;
  const subtotal = totalPrice;
  const total = subtotal + delivery - discount;

  const stepIndex = STEPS.findIndex(s => s.key === step);

  useEffect(() => {
    if (items.length === 0) navigate('/cart');
  }, []);

  const applyCoupon = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post('/api/v1/coupons/apply', { code: coupon }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const computedDiscount = data.discountAmount || (subtotal * (data.discountPercent || 0)) / 100;
      setDiscount(computedDiscount);
      toast(`✅ Coupon applied! You saved ₹${computedDiscount}`, 'success');
    } catch {
      toast('Invalid or expired coupon', 'error');
    }
  };

  const placeOrder = async () => {
    setPlacing(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        lat: coords.lat,
        lon: coords.lon,
        items: items.map(i => ({ productId: i.productId, qty: i.qty })),
        couponCode: coupon || undefined,
      };
      const { data } = await axios.post('/api/v1/orders', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      clearCart();
      toast('🎉 Order placed successfully!', 'success');
      navigate(`/track/${data.orderId}`);
    } catch (err: any) {
      toast(err?.response?.data?.error ?? 'Order failed', 'error');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--color-background)', padding: '32px 20px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '32px' }}>Checkout</h1>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '36px' }}>
          {STEPS.map((s, i) => (
            <React.Fragment key={s.key}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: i <= stepIndex ? 'var(--color-primary)' : '#e2e8f0',
                  color: i <= stepIndex ? '#fff' : '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: '700',
                  transition: 'all 0.3s',
                  boxShadow: i === stepIndex ? '0 4px 12px rgba(22,163,74,0.4)' : 'none',
                }}>
                  {i < stepIndex ? '✓' : s.icon}
                </div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: i <= stepIndex ? 'var(--color-primary)' : '#94a3b8' }}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  flex: 1,
                  height: '3px',
                  background: i < stepIndex ? 'var(--color-primary)' : '#e2e8f0',
                  margin: '0 8px',
                  marginBottom: '22px',
                  transition: 'background 0.3s',
                }} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div style={{ background: 'var(--color-surface)', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          {/* Step 1: Address */}
          {step === 'address' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>📍 Delivery Address</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <FormInput label="Address Line" placeholder="House no., Street, Area" value={address.line1} onChange={v => setAddress(a => ({ ...a, line1: v }))} />
                <FormInput label="City" placeholder="Amalapuram" value={address.city} onChange={v => setAddress(a => ({ ...a, city: v }))} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <FormInput label="State" placeholder="Andhra Pradesh" value={address.state} onChange={v => setAddress(a => ({ ...a, state: v }))} />
                  <FormInput label="Pincode" placeholder="533201" value={address.pincode} onChange={v => setAddress(a => ({ ...a, pincode: v }))} />
                </div>
              </div>
              <button
                onClick={() => setStep('summary')}
                disabled={!address.line1 || !address.city || !address.pincode}
                style={primaryBtnStyle(!address.line1 || !address.city || !address.pincode)}
              >
                Continue to Summary →
              </button>
            </div>
          )}

          {/* Step 2: Summary */}
          {step === 'summary' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>📋 Order Summary</h2>

              <div style={{ marginBottom: '20px' }}>
                {items.map(item => (
                  <div key={item.productId} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom: '1px solid #f1f5f9',
                    fontSize: '15px',
                    color: '#0f172a',
                  }}>
                    <span>{item.name} × {item.qty}</span>
                    <span style={{ fontWeight: '700' }}>₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input
                  type="text"
                  placeholder="Coupon code (e.g. ORGANIC10)"
                  value={coupon}
                  onChange={e => setCoupon(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '14px',
                    outline: 'none',
                    color: '#0f172a',
                  }}
                />
                <button onClick={applyCoupon} style={{
                  padding: '12px 20px',
                  background: 'var(--color-primary)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}>Apply</button>
              </div>

              {/* Totals */}
              <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                <Row label="Subtotal" val={`₹${subtotal}`} />
                <Row label="Delivery" val={`₹${delivery}`} />
                {discount > 0 && <Row label="Coupon Discount" val={`-₹${discount}`} green />}
                <div style={{ borderTop: '2px solid #e2e8f0', marginTop: '10px', paddingTop: '10px' }}>
                  <Row label="Total" val={`₹${total}`} bold />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setStep('address')} style={secondaryBtnStyle}>← Back</button>
                <button onClick={() => setStep('payment')} style={{ ...primaryBtnStyle(false), flex: 1 }}>
                  Continue to Payment →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 'payment' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>💳 Payment</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                {[
                  { icon: '📱', label: 'UPI / GPay / PhonePe', desc: 'Pay via any UPI app' },
                  { icon: '💳', label: 'Debit / Credit Card', desc: 'Visa, Mastercard, RuPay' },
                  { icon: '🏦', label: 'Net Banking', desc: 'All major banks supported' },
                  { icon: '💵', label: 'Cash on Delivery', desc: 'Pay when you receive' },
                ].map((opt, i) => (
                  <label key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '16px',
                    border: `2px solid ${i === 0 ? 'var(--color-primary)' : '#e2e8f0'}`,
                    borderRadius: '14px',
                    cursor: 'pointer',
                    background: i === 0 ? '#f0fdf4' : '#fff',
                    transition: 'all 0.2s',
                  }}>
                    <input type="radio" name="payment" defaultChecked={i === 0} style={{ accentColor: 'var(--color-primary)' }} />
                    <span style={{ fontSize: '24px' }}>{opt.icon}</span>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>{opt.label}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              <div style={{ background: '#f0fdf4', borderRadius: '14px', padding: '16px', marginBottom: '24px', border: '1px solid #bbf7d0' }}>
                <p style={{ fontWeight: '700', fontSize: '16px', color: '#0f172a', marginBottom: '4px' }}>
                  Total Payable: <span style={{ color: 'var(--color-primary)' }}>₹{total}</span>
                </p>
                <p style={{ fontSize: '13px', color: '#64748b' }}>Deliver to: {address.line1}, {address.city} - {address.pincode}</p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setStep('summary')} style={secondaryBtnStyle}>← Back</button>
                <button
                  onClick={placeOrder}
                  disabled={placing}
                  style={{ ...primaryBtnStyle(placing), flex: 1 }}
                >
                  {placing ? '⏳ Placing Order...' : '🎉 Place Order'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function FormInput({ label, placeholder, value, onChange }: { label: string; placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '12px 14px',
          border: '2px solid #e2e8f0',
          borderRadius: '12px',
          fontSize: '15px',
          outline: 'none',
          color: '#0f172a',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

function Row({ label, val, green, bold }: { label: string; val: string; green?: boolean; bold?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
      <span style={{ fontSize: '14px', color: '#64748b' }}>{label}</span>
      <span style={{ fontSize: bold ? '18px' : '14px', fontWeight: bold ? '800' : '600', color: green ? '#16a34a' : bold ? '#0f172a' : '#475569' }}>{val}</span>
    </div>
  );
}

const primaryBtnStyle = (disabled: boolean): React.CSSProperties => ({
  marginTop: '8px',
  width: '100%',
  padding: '14px',
  background: disabled ? '#94a3b8' : 'linear-gradient(135deg, var(--color-primary) 0%, #0d9488 100%)',
  color: '#fff',
  border: 'none',
  borderRadius: '12px',
  fontSize: '16px',
  fontWeight: '700',
  cursor: disabled ? 'not-allowed' : 'pointer',
  boxShadow: disabled ? 'none' : '0 4px 12px rgba(22,163,74,0.3)',
});

const secondaryBtnStyle: React.CSSProperties = {
  marginTop: '8px',
  padding: '14px 20px',
  background: 'none',
  border: '2px solid #e2e8f0',
  borderRadius: '12px',
  fontSize: '15px',
  fontWeight: '600',
  color: '#64748b',
  cursor: 'pointer',
};

export default CheckoutPage;
