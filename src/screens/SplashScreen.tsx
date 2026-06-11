// src/screens/SplashScreen.tsx
// Animated splash screen – shows logo animation then navigates to onboarding

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';

export default function SplashScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      // replace so user cannot go back to splash
      navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <LottieView
        source={require('../assets/animations/splash.json')}
        autoPlay
        loop={false}
        style={styles.lottie}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F6F0', justifyContent: 'center', alignItems: 'center' },
  lottie: { width: 240, height: 240 },
});
