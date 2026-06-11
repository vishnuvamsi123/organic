// src/screens/OnboardingScreen.tsx
// Simple three‑page onboarding carousel with smooth fade transitions

import React, { useRef } from 'react';
import { View, Text, Dimensions, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenContainer from '../components/ScreenContainer';

const { width } = Dimensions.get('window');

const pages = [
  {
    key: '1',
    title: 'Pure, Organic Quality',
    description: 'All products are USDA certified organic and sourced directly from trusted farms.',
    image: require('../assets/onboarding/organic1.png'),
  },
  {
    key: '2',
    title: 'Fresh From the Farm',
    description: 'Get the freshest produce delivered to your doorstep every day.',
    image: require('../assets/onboarding/organic2.png'),
  },
  {
    key: '3',
    title: 'Smart Healthy Choices',
    description: 'AI‑powered recommendations help you stay on track with your wellness goals.',
    image: require('../assets/onboarding/organic3.png'),
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const flatListRef = useRef<FlatList>(null);
  const renderItem = ({ item }: any) => (
    <View style={styles.page} key={item.key} accessibilityLabel={`Onboarding page ${item.key}`}>
      <Image source={item.image} style={styles.image} resizeMode="contain" />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.desc}>{item.description}</Text>
    </View>
  );

  const onDone = () => navigation.replace('Login');

  return (
    <ScreenContainer>
      <FlatList
        ref={flatListRef}
        data={pages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
        keyExtractor={item => item.key}
      />
      <View style={styles.footer}>
        <View style={styles.dotsContainer}>
          {pages.map(p => (
            <View key={p.key} style={styles.dot} />
          ))}
        </View>
        <TouchableOpacity style={styles.button} onPress={onDone} accessibilityLabel="Get Started">
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  page: { width, alignItems: 'center', paddingTop: 40 },
  image: { width: width * 0.7, height: width * 0.7 },
  title: { fontSize: 24, fontWeight: '700', marginTop: 20, textAlign: 'center', color: '#222' },
  desc: { fontSize: 16, marginTop: 12, textAlign: 'center', color: '#555', paddingHorizontal: 30 },
  footer: { position: 'absolute', bottom: 40, width: '100%', alignItems: 'center' },
  dotsContainer: { flexDirection: 'row', marginBottom: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4CAF50', marginHorizontal: 4 },
  button: { backgroundColor: '#2E7D32', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 24 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
