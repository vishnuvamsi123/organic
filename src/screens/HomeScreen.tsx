// src/screens/HomeScreen.tsx — Premium home with product images and logo
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { products, categories } from '../data/mockData';
import ScreenContainer from '../components/ScreenContainer';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');
const CARD_W = (width - 48) / 2;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [locationName, setLocationName] = useState('Amalapuram, AP');

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Foreground location permission was denied');
          return;
        }

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
        console.warn('Could not fetch mobile live location, using Amalapuram defaults:', e);
      }
    })();
  }, []);

  const filtered = products.filter(p => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <ScreenContainer noPadding>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Header */}
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.logoRow}>
              <Image
                source={require('../assets/logo.jpg')}
                style={styles.logo}
                resizeMode="cover"
              />
              <View>
                <Text style={styles.brandName}>Organic</Text>
                <Text style={styles.brandTagline}>📍 {locationName} 🌱</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.cartIconBtn} onPress={() => navigation.navigate('Cart')}>
              <View style={styles.cartIconWrap}>
                {/* Cart SVG-like icon using View */}
                <Text style={{ fontSize: 22 }}>🛒</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
            <TextInput
              placeholder="Search vegetables, fruits, rice..."
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />
          </View>
        </View>

        {/* Category Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {categories.map(cat => {
            const active = activeCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setActiveCategory(cat.id)}
                style={[styles.chip, active && { backgroundColor: '#16a34a', borderColor: '#16a34a' }]}
              >
                <Text style={[styles.chipText, active && { color: '#fff' }]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {activeCategory === 'all' ? 'All Products' : categories.find(c => c.id === activeCategory)?.name ?? 'Products'}
          </Text>
          <Text style={styles.sectionCount}>{filtered.length} items</Text>
        </View>

        {/* Product Grid */}
        <View style={styles.grid}>
          {filtered.map(product => (
            <TouchableOpacity
              key={product.id}
              style={styles.card}
              onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
              activeOpacity={0.85}
            >
              <Image
                source={{ uri: product.image }}
                style={styles.cardImage}
                resizeMode="cover"
              />
              <View style={styles.categoryTag}>
                <Text style={styles.categoryTagText}>{product.category}</Text>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardName} numberOfLines={2}>{product.name}</Text>
                <Text style={styles.cardFarmer} numberOfLines={1}>👨‍🌾 {product.farmer.name}</Text>
                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.cardPrice}>₹{product.basePrice}</Text>
                    <Text style={styles.cardUnit}>/{product.unit}</Text>
                  </View>
                  <View style={styles.ratingPill}>
                    <Text style={styles.ratingText}>★ {product.rating}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {filtered.length === 0 && (
          <View style={styles.noResults}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🔍</Text>
            <Text style={styles.noResultsText}>No products found</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },

  // Hero
  hero: {
    backgroundColor: 'rgba(20, 83, 45, 0.85)',
    padding: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: { width: 44, height: 44, borderRadius: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  brandName: { fontSize: 20, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  brandTagline: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 1 },
  cartIconBtn: {},
  cartIconWrap: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  searchInput: { flex: 1, color: '#fff', fontSize: 14, fontWeight: '500' },

  // Categories
  categoryScroll: { marginVertical: 16 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 99, borderWidth: 1.5, borderColor: '#cbd5e1',
    backgroundColor: '#fff',
  },
  chipText: { fontSize: 13, fontWeight: '700', color: '#475569' },

  // Section
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  sectionCount: { fontSize: 13, color: '#64748b', fontWeight: '600' },

  // Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 12 },
  card: {
    width: CARD_W,
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  cardImage: { width: '100%', height: 130 },
  categoryTag: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3,
  },
  categoryTagText: { fontSize: 10, fontWeight: '800', color: '#16a34a', textTransform: 'capitalize' },
  cardBody: { padding: 12 },
  cardName: { fontSize: 14, fontWeight: '700', color: '#0f172a', marginBottom: 4, lineHeight: 19 },
  cardFarmer: { fontSize: 11, color: '#64748b', marginBottom: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardPrice: { fontSize: 18, fontWeight: '900', color: '#16a34a' },
  cardUnit: { fontSize: 10, color: '#94a3b8', marginTop: -2 },
  ratingPill: { backgroundColor: '#f0fdf4', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  ratingText: { fontSize: 12, fontWeight: '700', color: '#16a34a' },

  // Empty
  noResults: { alignItems: 'center', padding: 60 },
  noResultsText: { fontSize: 16, fontWeight: '700', color: '#94a3b8' },
});

export default HomeScreen;
