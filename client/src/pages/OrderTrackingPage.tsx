import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

declare const L: any; // Leaflet loaded via CDN in index.html

interface OrderStatus {
  orderId: string;
  status: string;
  lat?: number;
  lon?: number;
}

const STATUS_STEPS = [
  { key: 'PLACED', label: 'Order Placed', icon: '📦', desc: 'Your order has been received' },
  { key: 'FARMER_ACCEPTED', label: 'Confirmed', icon: '✅', desc: 'Farmer accepted your order' },
  { key: 'DISPATCHED', label: 'Dispatched', icon: '🚚', desc: 'Your order is on the way' },
  { key: 'DELIVERED', label: 'Delivered', icon: '🎉', desc: 'Order delivered successfully' },
];

const STATUS_INDEX: Record<string, number> = {
  PLACED: 0, FARMER_ACCEPTED: 1, CONFIRMED: 1, DISPATCHED: 2, DELIVERED: 3,
};

// Demo coordinates (Amalapuram area)
const FARMER_LAT = 16.5787;
const FARMER_LON = 82.0061;
const CUSTOMER_LAT = 16.5787;
const CUSTOMER_LON = 82.0061;

const OrderTrackingPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState<{ lat: number; lon: number }>({ lat: CUSTOMER_LAT, lon: CUSTOMER_LON });
  const [coordsLoaded, setCoordsLoaded] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const deliveryMarkerRef = useRef<any>(null);
  const animFrameRef = useRef<number>(0);

  const fetchStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`/api/v1/orders/${orderId}/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrder(data);
    } catch {
      setOrder({ orderId: orderId ?? 'demo', status: 'DISPATCHED', lat: CUSTOMER_LAT, lon: CUSTOMER_LON });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    intervalRef.current = setInterval(fetchStatus, 15000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [orderId]);

  // Initialize Leaflet map
  useEffect(() => {
    if (!order || !mapContainerRef.current || mapRef.current || !coordsLoaded) return;
    if (typeof L === 'undefined') return;

    const custLat = coords.lat;
    const custLon = coords.lon;

    // Offset farmer coordinates slightly relative to the customer's live coordinates
    const farmerLat = custLat - 0.0125;
    const farmerLon = custLon - 0.0145;

    const map = L.map(mapContainerRef.current, { zoomControl: true, scrollWheelZoom: false }).setView([custLat, custLon], 13);
    mapRef.current = map;

    // Tile layer (Google Maps Layer)
    L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      attribution: '© Google Maps',
      maxZoom: 18,
    }).addTo(map);

    // Farmer marker (shop)
    const farmerIcon = L.divIcon({
      html: `<div style="background:#16a34a;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.3);">🏪</div>`,
      className: '',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
    L.marker([farmerLat, farmerLon], { icon: farmerIcon }).addTo(map)
      .bindPopup('<b>Organic Farmer</b><br/>Your order is being prepared here');

    // Customer marker (home)
    const customerIcon = L.divIcon({
      html: `<div style="background:#2563eb;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.3);">🏠</div>`,
      className: '',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
    L.marker([custLat, custLon], { icon: customerIcon }).addTo(map)
      .bindPopup('<b>Your Location</b><br/>Delivery destination');

    // Route polyline
    const routePoints: [number, number][] = [
      [farmerLat, farmerLon],
      [farmerLat + 0.003, farmerLon + 0.003],
      [farmerLat + 0.006, farmerLon + 0.008],
      [farmerLat + 0.009, farmerLon + 0.011],
      [custLat, custLon],
    ];
    L.polyline(routePoints, { color: '#16a34a', weight: 4, opacity: 0.7, dashArray: '8 4' }).addTo(map);

    // Delivery partner marker — animate if dispatched
    const deliveryIcon = L.divIcon({
      html: `<div style="background:#f59e0b;width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;border:3px solid white;box-shadow:0 4px 16px rgba(245,158,11,0.5);">🛵</div>`,
      className: '',
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    const currentStep = STATUS_INDEX[order.status ?? ''] ?? 0;
    if (currentStep >= 2) { // DISPATCHED or beyond
      const startLat = farmerLat;
      const startLon = farmerLon;
      const deliveryMarker = L.marker([startLat, startLon], { icon: deliveryIcon }).addTo(map);
      deliveryMarkerRef.current = deliveryMarker;

      // Animate delivery marker along route
      let progress = 0;
      const totalPoints = routePoints.length - 1;
      const animate = () => {
        progress += 0.002;
        if (progress > totalPoints) progress = 0;
        const idx = Math.floor(progress);
        const frac = progress - idx;
        if (idx < totalPoints) {
          const [lat1, lon1] = routePoints[idx];
          const [lat2, lon2] = routePoints[idx + 1];
          const lat = lat1 + (lat2 - lat1) * frac;
          const lon = lon1 + (lon2 - lon1) * frac;
          deliveryMarker.setLatLng([lat, lon]);
        }
        animFrameRef.current = requestAnimationFrame(animate);
      };
      animFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, [order?.status, coordsLoaded]);

  const currentStep = STATUS_INDEX[order?.status ?? ''] ?? 0;

  if (loading) {
    return (
      <div style={{ maxWidth: '600px', margin: '60px auto', padding: '0 20px' }}>
        <div className="skeleton" style={{ height: '400px', borderRadius: '24px' }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--color-background)', padding: '32px 20px' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>
            {order?.status === 'DELIVERED' ? '🎉' : '📦'}
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>Live Order Tracking</h1>
          <p style={{ color: '#64748b', fontSize: '13px' }}>
            Order ID: <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#0f172a' }}>#{order?.orderId?.slice(0, 8)?.toUpperCase()}</span>
          </p>
        </div>

        {/* Live Map */}
        <div style={{
          borderRadius: '20px', overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          marginBottom: '24px',
          border: '2px solid #bbf7d0',
        }}>
          <div style={{ background: 'linear-gradient(135deg, #14532d, #16a34a)', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>🗺️</span>
            <span style={{ color: '#fff', fontWeight: '700', fontSize: '14px' }}>Live Delivery Map</span>
            {currentStep >= 2 && (
              <span style={{ marginLeft: 'auto', background: 'rgba(245,158,11,0.2)', border: '1px solid #f59e0b', color: '#fbbf24', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '99px' }}>🔴 LIVE</span>
            )}
          </div>
          <div ref={mapContainerRef} style={{ height: '300px', background: '#e8f5e9' }} />
        </div>

        {/* Status card */}
        <div style={{ background: 'var(--color-surface)', borderRadius: '24px', padding: '28px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', marginBottom: '20px' }}>
          {/* Progress stepper */}
          <div style={{ position: 'relative', marginBottom: '32px' }}>
            <div style={{ position: 'absolute', top: '22px', left: '22px', right: '22px', height: '4px', background: '#e2e8f0', borderRadius: '2px' }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--color-primary), #0d9488)', borderRadius: '2px', width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%`, transition: 'width 0.8s ease-out' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
              {STATUS_STEPS.map((step, i) => {
                const done = i <= currentStep;
                const active = i === currentStep;
                return (
                  <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '50%',
                      background: done ? 'var(--color-primary)' : '#f1f5f9',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                      transition: 'all 0.4s', boxShadow: active ? '0 0 0 6px rgba(22,163,74,0.2)' : 'none',
                      position: 'relative', zIndex: 1,
                    }}>
                      {done ? step.icon : <span style={{ fontSize: '14px', fontWeight: '700', color: '#94a3b8' }}>{i + 1}</span>}
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: done ? '#0f172a' : '#94a3b8', textAlign: 'center' }}>{step.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', borderRadius: '14px', padding: '18px', textAlign: 'center', border: '1px solid #bbf7d0' }}>
            <div style={{ fontSize: '28px', marginBottom: '6px' }}>{STATUS_STEPS[currentStep]?.icon}</div>
            <div style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>{STATUS_STEPS[currentStep]?.label}</div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>{STATUS_STEPS[currentStep]?.desc}</div>
          </div>

          {order?.status !== 'DELIVERED' && (
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '13px' }}>
              <span>⏱</span>
              <span>Estimated delivery: <strong>Today, 4:00 PM – 6:00 PM</strong></span>
            </div>
          )}
        </div>

        {/* Delivery partner */}
        <div style={{ background: 'var(--color-surface)', borderRadius: '18px', padding: '18px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg, #bbf7d0, #6ee7b7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>🛵</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '15px' }}>Rajesh Kumar</div>
            <div style={{ color: '#64748b', fontSize: '12px' }}>Delivery Partner · ★ 4.9 · On time</div>
          </div>
          <a href="tel:+919876543210" style={{ padding: '10px 16px', background: 'var(--color-primary)', color: '#fff', borderRadius: '12px', textDecoration: 'none', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            📞 Call
          </a>
        </div>

        <button onClick={() => navigate('/orders')} style={{ width: '100%', padding: '14px', background: 'none', border: '2px solid #e2e8f0', borderRadius: '14px', fontSize: '15px', fontWeight: '600', color: '#475569', cursor: 'pointer' }}>
          ← View All Orders
        </button>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
