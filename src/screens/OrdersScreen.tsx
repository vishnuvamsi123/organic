import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

interface Order {
  id: string;
  status: 'PLACED' | 'FARMER_ACCEPTED' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';
  total: number;
  date: string;
  items: OrderItem[];
  farmerName: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  PLACED:          { label: 'Placed',     color: '#92400e', bg: '#fef3c7', icon: '📦' },
  FARMER_ACCEPTED: { label: 'Confirmed',  color: '#1e40af', bg: '#dbeafe', icon: '✅' },
  CONFIRMED:       { label: 'Confirmed',  color: '#1e40af', bg: '#dbeafe', icon: '✅' },
  DISPATCHED:      { label: 'On the way', color: '#5b21b6', bg: '#ede9fe', icon: '🛵' },
  DELIVERED:       { label: 'Delivered',  color: '#166534', bg: '#dcfce7', icon: '🎉' },
  CANCELLED:       { label: 'Cancelled',  color: '#991b1b', bg: '#fee2e2', icon: '❌' },
};

// NOTE: In a real app, orders would be fetched from the backend via API.
// For this demo, we start with an empty list to match new user experience.
const DEMO_ORDERS: Order[] = [];

const OrdersScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [orders] = useState<Order[]>(DEMO_ORDERS);

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📦</Text>
      <Text style={styles.emptyTitle}>No orders yet</Text>
      <Text style={styles.emptySub}>Start shopping to see your orders here</Text>
      <TouchableOpacity
        style={styles.shopBtn}
        onPress={() => navigation.navigate('Home' as never)}
      >
        <Text style={styles.shopBtnText}>🛒 Browse Products</Text>
      </TouchableOpacity>
    </View>
  );

  const renderOrder = ({ item }: { item: Order }) => {
    const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.PLACED;
    const isTrackable = ['PLACED', 'FARMER_ACCEPTED', 'DISPATCHED'].includes(item.status);

    return (
      <View style={styles.orderCard}>
        {/* Header row */}
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderId}>
              {cfg.icon} Order #{item.id.slice(0, 8).toUpperCase()}
            </Text>
            <Text style={styles.orderMeta}>{item.date} · {item.farmerName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: cfg.bg, borderColor: cfg.color }]}>
            <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        {/* Items */}
        <View style={styles.orderDivider} />
        <View style={styles.orderItems}>
          <Text style={styles.itemsText}>
            {item.items.slice(0, 2).map(i => i.name).join(', ')}
            {item.items.length > 2 ? ` +${item.items.length - 2} more` : ''}
          </Text>
          <Text style={styles.totalText}>₹{item.total}</Text>
        </View>

        {/* Step tracker mini */}
        <View style={styles.miniTracker}>
          {['PLACED', 'FARMER_ACCEPTED', 'DISPATCHED', 'DELIVERED'].map((s, i) => {
            const statusIndex = Object.keys(STATUS_CONFIG).indexOf(item.status);
            const stepDone = i <= ['PLACED', 'FARMER_ACCEPTED', 'DISPATCHED', 'DELIVERED'].indexOf(item.status);
            return (
              <View key={s} style={styles.miniStepRow}>
                <View style={[styles.miniDot, stepDone && styles.miniDotDone]} />
                {i < 3 && <View style={[styles.miniLine, stepDone && styles.miniLineDone]} />}
              </View>
            );
          })}
        </View>

        {/* Track button */}
        {isTrackable && (
          <TouchableOpacity
            style={styles.trackBtn}
            onPress={() => navigation.navigate('Tracking', {
              orderId: item.id,
              status: item.status,
              total: item.total,
              items: item.items.map(i => i.name).join(', '),
            })}
          >
            <Text style={styles.trackBtnText}>🗺️ Track Live Order</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{orders.length}</Text>
        </View>
      </View>

      <FlatList
        data={orders}
        keyExtractor={item => item.id}
        renderItem={renderOrder}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={orders.length === 0 ? styles.emptyList : styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0fdf4' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 20,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#0f172a', flex: 1 },
  countBadge: {
    backgroundColor: '#16a34a',
    borderRadius: 99,
    minWidth: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  countText: { color: '#fff', fontWeight: '800', fontSize: 13 },

  list: { padding: 16, gap: 14 },
  emptyList: { flex: 1 },

  // Empty state
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: { fontSize: 72, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 28 },
  shopBtn: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  shopBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },

  // Order card
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderId: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 3 },
  orderMeta: { fontSize: 12, color: '#94a3b8' },
  statusBadge: {
    borderRadius: 99,
    borderWidth: 1.5,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: { fontSize: 11, fontWeight: '700' },

  orderDivider: { height: 1, backgroundColor: '#f1f5f9', marginBottom: 12 },
  orderItems: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  itemsText: { fontSize: 13, color: '#64748b', flex: 1, marginRight: 8 },
  totalText: { fontSize: 18, fontWeight: '800', color: '#16a34a' },

  // Mini tracker
  miniTracker: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  miniStepRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  miniDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#e2e8f0', borderWidth: 1.5, borderColor: '#cbd5e1' },
  miniDotDone: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  miniLine: { flex: 1, height: 3, backgroundColor: '#e2e8f0' },
  miniLineDone: { backgroundColor: '#16a34a' },

  // Track button
  trackBtn: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#16a34a',
    padding: 12,
    alignItems: 'center',
  },
  trackBtnText: { color: '#16a34a', fontWeight: '800', fontSize: 14 },
});

export default OrdersScreen;
