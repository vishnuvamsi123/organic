// src/screens/ProductDetailScreen.tsx
// Detailed view for a single product

import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { products } from '../data/mockData';

// ─── Navigation type ──────────────────────────────────────────────────────────

type ParamList = {
  ProductDetail: { productId: string };
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarRow({ rating }: { rating: number }) {
  return (
    <View style={styles.starRow}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Feather
          key={i}
          name="star"
          size={16}
          color={i < Math.round(rating) ? '#FFD700' : '#ddd'}
        />
      ))}
      <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProductDetailScreen() {
  const navigation = useNavigation();
  const { params } = useRoute<RouteProp<ParamList, 'ProductDetail'>>();
  const product = products.find((p) => p.id === params?.productId);

  const [qty, setQty] = useState(1);

  if (!product) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.errorHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.errorHeaderTitle}>Product</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.center}>
          <Feather name="alert-circle" size={64} color="#c8e6c9" />
          <Text style={styles.notFoundText}>Product not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const onAddToCart = () => {
    Alert.alert(
      '🛒 Added to Cart',
      `${qty} × ${product.name} added to your cart.\nTotal: ₹${product.basePrice * qty}`,
      [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => navigation.goBack() },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Sticky header */}
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          {product.name}
        </Text>
        <TouchableOpacity
          style={styles.shareBtn}
          onPress={() => Alert.alert('Share', 'Share functionality coming soon!')}
        >
          <Feather name="share-2" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product image */}
        <View style={styles.imageWrapper}>
          <Image
            source={{
              uri:
                product.image ||
                'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&fit=crop',
            }}
            style={styles.image}
            resizeMode="cover"
          />
          {/* Organic badge */}
          <View style={styles.organicBadge}>
            <Text style={styles.organicBadgeText}>🌿 ORGANIC</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.contentPad}>
          {/* Category + name */}
          <View style={styles.categoryRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
              </Text>
            </View>
          </View>

          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.unitText}>per {product.unit}</Text>

          <StarRow rating={product.rating} />

          {/* Price + Qty */}
          <View style={styles.priceQtyRow}>
            <Text style={styles.price}>₹{product.basePrice}</Text>
            <View style={styles.qtySelector}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQty((q) => Math.max(1, q - 1))}
              >
                <Feather name="minus" size={16} color="#2E7D32" />
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{qty}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQty((q) => q + 1)}
              >
                <Feather name="plus" size={16} color="#2E7D32" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Farmer info */}
          <View style={styles.farmerCard}>
            <View style={styles.farmerAvatar}>
              <Feather name="user" size={22} color="#2E7D32" />
            </View>
            <View style={styles.farmerInfo}>
              <Text style={styles.farmerLabel}>Sourced from</Text>
              <Text style={styles.farmerName}>{product.farmer.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Feather name="star" size={12} color="#FFD700" />
                <Text style={styles.farmerRating}>
                  {product.farmer.rating.toFixed(1)} Farmer Rating
                </Text>
              </View>
            </View>
            <View style={styles.verifiedBadge}>
              <Feather name="check-circle" size={14} color="#2E7D32" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>About this Product</Text>
          <Text style={styles.description}>
            {product.description
              ? `${product.description}\n\nFreshly harvested and delivered within 24 hours to preserve maximum nutrition. Our farmers are certified by India Organic (NPOP).`
              : '100% certified organic, sourced directly from local farms. No chemical pesticides or artificial fertilisers are used. Freshly harvested and delivered within 24 hours to preserve maximum nutrition and flavour.\n\nOur farmers follow sustainable farming practices and are certified by India Organic (NPOP). Every purchase supports small-scale farmers and promotes eco-friendly agriculture.'}
          </Text>

          {/* Features */}
          <Text style={styles.sectionTitle}>Why Choose Organic?</Text>
          {[
            { icon: 'check-circle' as const, text: 'No chemical pesticides' },
            { icon: 'check-circle' as const, text: 'Higher nutritional value' },
            { icon: 'check-circle' as const, text: 'Supports local farmers' },
            { icon: 'check-circle' as const, text: 'Eco-friendly & sustainable' },
          ].map((feat) => (
            <View key={feat.text} style={styles.featureRow}>
              <Feather name={feat.icon} size={16} color="#4CAF50" />
              <Text style={styles.featureText}>{feat.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Sticky Add to Cart */}
      <View style={styles.cartFooter}>
        <View>
          <Text style={styles.footerLabel}>Total Price</Text>
          <Text style={styles.footerTotal}>₹{product.basePrice * qty}</Text>
        </View>
        <TouchableOpacity
          style={styles.cartBtn}
          onPress={onAddToCart}
          activeOpacity={0.85}
        >
          <Feather name="shopping-cart" size={18} color="#fff" />
          <Text style={styles.cartBtnText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F1F8E9',
  },

  // Nav header
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backBtn: {
    padding: 8,
  },
  shareBtn: {
    padding: 8,
  },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginHorizontal: 8,
  },

  // Image
  imageWrapper: {
    position: 'relative',
    height: 300,
    backgroundColor: '#e8f5e9',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  organicBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: '#2E7D32',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  organicBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },

  // Content
  contentPad: {
    padding: 20,
    paddingBottom: 120,
  },
  categoryRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  categoryBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
  },
  productName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1b5e20',
    marginBottom: 2,
  },
  unitText: {
    fontSize: 13,
    color: '#888',
    marginBottom: 8,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 16,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginLeft: 6,
  },

  // Price & Qty
  priceQtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  price: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2E7D32',
  },
  qtySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    minWidth: 24,
    textAlign: 'center',
  },

  // Farmer card
  farmerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  farmerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e8f5e9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  farmerInfo: {
    flex: 1,
  },
  farmerLabel: {
    fontSize: 11,
    color: '#aaa',
    marginBottom: 2,
  },
  farmerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  farmerRating: {
    fontSize: 12,
    color: '#888',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 11,
    color: '#2E7D32',
    fontWeight: '600',
  },

  // Description & features
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
    marginTop: 4,
  },
  description: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#444',
  },

  // Cart footer
  cartFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingBottom: 20,
    elevation: 8,
  },
  footerLabel: {
    fontSize: 12,
    color: '#888',
  },
  footerTotal: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2E7D32',
  },
  cartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2E7D32',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 28,
    elevation: 3,
  },
  cartBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  // Error state
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  errorHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 16,
    color: '#888',
    marginTop: 16,
  },
});