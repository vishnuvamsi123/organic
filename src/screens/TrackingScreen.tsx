import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Dimensions,
  Animated,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenContainer from '../components/ScreenContainer';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

const STATUS_STEPS = [
  { key: 'PLACED',          label: 'Placed',     icon: '📦', desc: 'Order received'           },
  { key: 'FARMER_ACCEPTED', label: 'Confirmed',  icon: '✅', desc: 'Farmer confirmed'         },
  { key: 'DISPATCHED',      label: 'On the way', icon: '🛵', desc: 'Out for delivery'         },
  { key: 'DELIVERED',       label: 'Delivered',  icon: '🎉', desc: 'Delivered successfully'   },
];

const STATUS_INDEX: Record<string, number> = {
  PLACED: 0, FARMER_ACCEPTED: 1, CONFIRMED: 1, DISPATCHED: 2, DELIVERED: 3,
};

const STATUS_COLOR: Record<string, string> = {
  PLACED: '#f59e0b',
  FARMER_ACCEPTED: '#3b82f6',
  CONFIRMED: '#3b82f6',
  DISPATCHED: '#8b5cf6',
  DELIVERED: '#16a34a',
  CANCELLED: '#ef4444',
};

interface RouteParams {
  orderId: string;
  status?: string;
  total?: number;
  items?: string;
}

// Simple animated delivery map (React Native canvas-free)
const DeliveryMap: React.FC<{ status: string; locationName: string }> = ({ status, locationName }) => {
  const step = STATUS_INDEX[status] ?? 0;
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (step >= 2) {
      // Animate delivery dot from 0 to 1 (farmer to customer)
      Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, { toValue: 1, duration: 3000, useNativeDriver: false }),
          Animated.timing(animValue, { toValue: 0, duration: 100, useNativeDriver: false }),
        ])
      ).start();
    }
  }, [step]);

  const deliveryLeft = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['8%', '80%'],
  });

  return (
    <View style={styles.mapContainer}>
      {/* Map background with road */}
      <View style={styles.mapBg}>
        {/* Grid lines (stylised map look) */}
        {[0.25, 0.5, 0.75].map(pos => (
          <View key={pos} style={[styles.gridLine, { top: `${pos * 100}%` as any }]} />
        ))}
        {[0.2, 0.4, 0.6, 0.8].map(pos => (
          <View key={pos} style={[styles.gridLineV, { left: `${pos * 100}%` as any }]} />
        ))}

        {/* Route road */}
        <View style={styles.routeRoad} />
        <View style={styles.routeDash} />

        {/* Farmer marker */}
        <View style={[styles.mapMarker, { left: '5%', top: '35%' }]}>
          <View style={[styles.markerBubble, { backgroundColor: '#16a34a' }]}>
            <Text style={styles.markerEmoji}>🏪</Text>
          </View>
          <Text style={styles.markerLabel}>Farmer</Text>
        </View>

        {/* Customer marker */}
        <View style={[styles.mapMarker, { right: '5%', top: '35%' }]}>
          <View style={[styles.markerBubble, { backgroundColor: '#2563eb' }]}>
            <Text style={styles.markerEmoji}>🏠</Text>
          </View>
          <Text style={styles.markerLabel} numberOfLines={1}>{locationName.split(',')[0] || 'You'}</Text>
        </View>

        {/* Delivery partner (animated) */}
        {step >= 2 && (
          <Animated.View style={[styles.deliveryMarker, { left: deliveryLeft }]}>
            <View style={styles.deliveryBubble}>
              <Text style={{ fontSize: 18 }}>🛵</Text>
            </View>
          </Animated.View>
        )}

        {/* LIVE badge */}
        {step >= 2 && (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
      </View>

      {/* Map label */}
      <View style={styles.mapLabel}>
        <Text style={styles.mapLabelText}>🗺️ Live Delivery Tracking</Text>
        <Text style={styles.mapLabelSub}>Real-time route from farm to your door</Text>
      </View>
    </View>
  );
};

const TrackingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { orderId, status: initialStatus = 'PLACED', total = 0, items = '' } = (route.params || {}) as RouteParams;

  const [status, setStatus] = useState(initialStatus);
  const [locationName, setLocationName] = useState('Amalapuram, AP');
  const currentStep = STATUS_INDEX[status] ?? 0;

  useEffect(() => {
    (async () => {
      try {
        let { status: permissionStatus } = await Location.requestForegroundPermissionsAsync();
        if (permissionStatus !== 'granted') return;

        let location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        let geocode = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (geocode && geocode.length > 0) {
          const address = geocode[0];
          const city = address.city || address.district || address.subregion || 'Amalapuram';
          const region = address.region || 'AP';
          setLocationName(`${city}, ${region}`);
        }
      } catch (e) {
        console.warn('Could not fetch mobile live location for tracking, using Amalapuram defaults:', e);
      }
    })();
  }, []);

  // Simulate status progression for demo
  useEffect(() => {
    const timer = setInterval(() => {
      setStatus(prev => {
        const idx = STATUS_INDEX[prev] ?? 0;
        const next = STATUS_STEPS[Math.min(idx + 1, STATUS_STEPS.length - 1)]?.key ?? prev;
        return next;
      });
    }, 10000); // progress every 10s for demo
    return () => clearInterval(timer);
  }, []);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.pageHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Order Tracking</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Order ID */}
        <View style={styles.orderIdRow}>
          <Text style={styles.orderIdLabel}>Order ID</Text>
          <Text style={styles.orderIdValue}>#{(orderId || 'DEMO001').slice(0, 8).toUpperCase()}</Text>
          <View style={[styles.statusPill, { backgroundColor: STATUS_COLOR[status] + '22', borderColor: STATUS_COLOR[status] }]}>
            <Text style={[styles.statusPillText, { color: STATUS_COLOR[status] }]}>
              {STATUS_STEPS[currentStep]?.icon} {STATUS_STEPS[currentStep]?.label}
            </Text>
          </View>
        </View>

        {/* Live Map */}
        <DeliveryMap status={status} locationName={locationName} />

        {/* Progress Stepper */}
        <View style={styles.stepperCard}>
          <Text style={styles.stepperTitle}>Delivery Progress</Text>
          <View style={styles.stepperRow}>
            {STATUS_STEPS.map((step, i) => {
              const done = i <= currentStep;
              const active = i === currentStep;
              return (
                <View key={step.key} style={styles.stepItem}>
                  <View style={[
                    styles.stepDot,
                    done && styles.stepDotDone,
                    active && styles.stepDotActive,
                  ]}>
                    {done
                      ? <Text style={{ fontSize: 16 }}>{step.icon}</Text>
                      : <Text style={styles.stepNum}>{i + 1}</Text>}
                  </View>
                  {i < STATUS_STEPS.length - 1 && (
                    <View style={[styles.stepLine, done && styles.stepLineDone]} />
                  )}
                  <Text style={[styles.stepLabel, done && styles.stepLabelDone]}>{step.label}</Text>
                </View>
              );
            })}
          </View>

          {/* Current status card */}
          <View style={styles.currentStatusCard}>
            <Text style={{ fontSize: 32, marginBottom: 6 }}>{STATUS_STEPS[currentStep]?.icon}</Text>
            <Text style={styles.currentStatusTitle}>{STATUS_STEPS[currentStep]?.label}</Text>
            <Text style={styles.currentStatusDesc}>{STATUS_STEPS[currentStep]?.desc}</Text>
          </View>
        </View>

        {/* Order Summary */}
        {total > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.cardTitle}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Items</Text>
              <Text style={styles.summaryValue}>{items || 'Organic Products'}</Text>
            </View>
            <View style={[styles.summaryRow, { marginTop: 8 }]}>
              <Text style={[styles.summaryLabel, { fontWeight: '700' }]}>Total Paid</Text>
              <Text style={[styles.summaryValue, { color: '#16a34a', fontWeight: '800', fontSize: 18 }]}>₹{total}</Text>
            </View>
          </View>
        )}

        {/* Delivery Partner */}
        <View style={styles.partnerCard}>
          <View style={styles.partnerAvatar}>
            <Text style={{ fontSize: 24 }}>🛵</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.partnerName}>Rajesh Kumar</Text>
            <Text style={styles.partnerSub}>Delivery Partner · ★ 4.9 · On time</Text>
          </View>
          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => Linking.openURL('tel:+919876543210')}
          >
            <Text style={styles.callBtnText}>📞 Call</Text>
          </TouchableOpacity>
        </View>

        {/* ETA */}
        {status !== 'DELIVERED' && (
          <View style={styles.etaCard}>
            <Text style={{ fontSize: 20, marginRight: 8 }}>⏱️</Text>
            <View>
              <Text style={styles.etaTitle}>Estimated Delivery</Text>
              <Text style={styles.etaTime}>Today, 4:00 PM – 6:00 PM</Text>
            </View>
          </View>
        )}

        {/* Back button */}
        <TouchableOpacity style={styles.backToOrdersBtn} onPress={() => navigation.navigate('Orders' as never)}>
          <Text style={styles.backToOrdersText}>← View All Orders</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  container: { paddingBottom: 40 },

  pageHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 8 },
  backBtn: { padding: 8 },
  backText: { color: '#16a34a', fontWeight: '700', fontSize: 15 },
  pageTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },

  orderIdRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, marginBottom: 16, flexWrap: 'wrap' },
  orderIdLabel: { fontSize: 13, color: '#64748b' },
  orderIdValue: { fontSize: 13, fontWeight: '700', fontFamily: 'monospace', color: '#0f172a' },
  statusPill: { borderRadius: 99, borderWidth: 1.5, paddingHorizontal: 10, paddingVertical: 3, marginLeft: 'auto' },
  statusPillText: { fontSize: 12, fontWeight: '700' },

  // Map
  mapContainer: { marginHorizontal: 16, marginBottom: 16, borderRadius: 20, overflow: 'hidden', elevation: 6, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  mapBg: { height: 220, backgroundColor: '#e8f5e9', position: 'relative' },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(22,163,74,0.1)' },
  gridLineV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(22,163,74,0.1)' },
  routeRoad: { position: 'absolute', top: '47%', left: '10%', right: '10%', height: 8, backgroundColor: '#c7f2cc', borderRadius: 4 },
  routeDash: { position: 'absolute', top: '49%', left: '10%', right: '10%', height: 3, backgroundColor: '#16a34a', borderRadius: 2, opacity: 0.6 },
  mapMarker: { position: 'absolute', alignItems: 'center' },
  markerBubble: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#fff', elevation: 4 },
  markerEmoji: { fontSize: 20 },
  markerLabel: { fontSize: 11, fontWeight: '700', color: '#0f172a', marginTop: 4, backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  deliveryMarker: { position: 'absolute', top: '28%' },
  deliveryBubble: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#f59e0b', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#fff', elevation: 6 },
  liveBadge: { position: 'absolute', top: 10, right: 10, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(239,68,68,0.15)', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#ef4444' },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#ef4444' },
  liveText: { fontSize: 10, fontWeight: '800', color: '#ef4444', letterSpacing: 1 },
  mapLabel: { backgroundColor: '#14532d', padding: 12, paddingHorizontal: 16 },
  mapLabelText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  mapLabelSub: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 },

  // Stepper
  stepperCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginHorizontal: 16, marginBottom: 12, elevation: 4, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 2 } },
  stepperTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 20 },
  stepperRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  stepItem: { alignItems: 'center', flex: 1, position: 'relative' },
  stepDot: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#e2e8f0' },
  stepDotDone: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  stepDotActive: { borderColor: '#16a34a', shadowColor: '#16a34a', shadowOpacity: 0.4, shadowRadius: 8, elevation: 4 },
  stepNum: { fontSize: 14, fontWeight: '700', color: '#94a3b8' },
  stepLine: { position: 'absolute', top: 22, left: '60%', right: '-40%', height: 3, backgroundColor: '#e2e8f0' },
  stepLineDone: { backgroundColor: '#16a34a' },
  stepLabel: { fontSize: 10, fontWeight: '600', color: '#94a3b8', marginTop: 8, textAlign: 'center' },
  stepLabelDone: { color: '#0f172a' },

  currentStatusCard: { backgroundColor: '#f0fdf4', borderRadius: 14, padding: 18, alignItems: 'center', borderWidth: 1, borderColor: '#bbf7d0' },
  currentStatusTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  currentStatusDesc: { fontSize: 13, color: '#64748b' },

  // Summary
  summaryCard: { backgroundColor: '#fff', borderRadius: 18, padding: 20, marginHorizontal: 16, marginBottom: 12, elevation: 3, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#0f172a', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 13, color: '#64748b' },
  summaryValue: { fontSize: 13, color: '#0f172a', fontWeight: '600' },

  // Partner
  partnerCard: { backgroundColor: '#fff', borderRadius: 18, padding: 18, marginHorizontal: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 14, elevation: 3, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8 },
  partnerAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center' },
  partnerName: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  partnerSub: { fontSize: 12, color: '#64748b', marginTop: 2 },
  callBtn: { backgroundColor: '#16a34a', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  callBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  // ETA
  etaCard: { backgroundColor: '#fefce8', borderRadius: 14, padding: 16, marginHorizontal: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#fef08a' },
  etaTitle: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  etaTime: { fontSize: 15, fontWeight: '800', color: '#0f172a', marginTop: 2 },

  // Bottom button
  backToOrdersBtn: { marginHorizontal: 16, marginTop: 8, padding: 16, borderRadius: 14, borderWidth: 2, borderColor: '#e2e8f0', alignItems: 'center' },
  backToOrdersText: { fontSize: 15, fontWeight: '700', color: '#475569' },
});

export default TrackingScreen;
