// src/screens/CartScreen.tsx
// Shopping cart with items list, quantity controls and order summary

import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CartItem {
  id: string;
  name: string;
  price: number;   // INR
  unit: string;
  image: string;
  qty: number;
}

// ─── Initial Demo Data ────────────────────────────────────────────────────────

const INITIAL_CART: CartItem[] = [
  {
    id: 'p8',
    name: 'Alphonso Mangoes',
    price: 599,
    unit: '1kg',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&fit=crop',
    qty: 1,
  },
  {
    id: 'p4',
    name: 'Cold-Pressed Coconut Oil',
    price: 350,
    unit: '500ml',
    image: 'https://images.unsplash.com/photo-1617720847484-a26866e27d4c?w=400&fit=crop',
    qty: 2,
  },
  {
    id: 'p10',
    name: 'Organic Turmeric Powder',
    price: 175,
    unit: '200g',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&fit=crop',
    qty: 1,
  },
];

const DELIVERY_FEE = 40;

// ─── Component ────────────────────────────────────────────────────────────────

export default function CartScreen() {
  const [cartItems, setCartItems] = useState<CartItem[]>(INITIAL_CART);

  const updateQty = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, qty: item.qty + delta } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const removeItem = (id: string) => {
    Alert.alert('Remove Item', 'Remove this item from your cart?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => setCartItems((prev) => prev.filter((i) => i.id !== id)),
      },
    ]);
  };

  const subtotal = cartItems.reduce((acc, i) => acc + i.price * i.qty, 0);
  const total = subtotal + (cartItems.length > 0 ? DELIVERY_FEE : 0);

  const placeOrder = () => {
    Alert.alert(
      '🎉 Order Placed!',
      `Your order of ₹${total} has been placed successfully. Expected delivery in 2–3 days.`,
      [
        {
          text: 'OK',
          onPress: () => setCartItems([]),
        },
      ]
    );
  };

  // ─── Empty State ──────────────────────────────────────────────────────────

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Cart</Text>
        </View>
        <View style={styles.emptyState}>
          <Feather name="shopping-cart" size={80} color="#c8e6c9" />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            Add some fresh organic products to get started
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Cart Item Row ────────────────────────────────────────────────────────

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.itemUnit}>{item.unit}</Text>
        <Text style={styles.itemPrice}>₹{item.price}</Text>
      </View>
      <View style={styles.itemControls}>
        <TouchableOpacity
          style={styles.qtyBtn}
          onPress={() => updateQty(item.id, -1)}
        >
          <Feather name="minus" size={14} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={styles.qtyText}>{item.qty}</Text>
        <TouchableOpacity
          style={styles.qtyBtn}
          onPress={() => updateQty(item.id, 1)}
        >
          <Feather name="plus" size={14} color="#2E7D32" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => removeItem(item.id)}
        >
          <Feather name="trash-2" size={16} color="#e53935" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // ─── Main Render ──────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Cart</Text>
        <Text style={styles.headerCount}>{cartItems.length} items</Text>
      </View>

      {/* Items list */}
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Order Summary</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹{subtotal}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>₹{DELIVERY_FEE}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{total}</Text>
            </View>

            <TouchableOpacity
              style={styles.placeOrderBtn}
              onPress={placeOrder}
              activeOpacity={0.85}
            >
              <Feather name="check-circle" size={20} color="#fff" />
              <Text style={styles.placeOrderText}>Place Order</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F1F8E9',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1b5e20',
  },
  headerCount: {
    fontSize: 14,
    color: '#666',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    alignItems: 'center',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#e8f5e9',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  itemUnit: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
    marginTop: 4,
  },
  itemControls: {
    alignItems: 'center',
    gap: 6,
  },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    minWidth: 20,
    textAlign: 'center',
  },
  removeBtn: {
    marginTop: 4,
    padding: 4,
  },
  separator: {
    height: 12,
  },
  summary: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1b5e20',
  },
  totalValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2E7D32',
  },
  placeOrderBtn: {
    flexDirection: 'row',
    backgroundColor: '#2E7D32',
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 8,
    elevation: 3,
  },
  placeOrderText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#444',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
