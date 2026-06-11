// src/screens/LoginScreen.tsx
// Simple login/signup screen with premium styling

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenContainer from '../components/ScreenContainer';
import AuthInput from '../components/AuthInput';
import styled, { useTheme } from 'styled-components/native';
import { Feather } from '@expo/vector-icons';

const SocialButton = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.surface};
  padding-vertical: ${({ theme }) => theme.spacing(2)}px;
  border-radius: ${({ theme }) => theme.radii.md}px;
  margin-vertical: ${({ theme }) => theme.spacing(1)}px;
  shadow-color: #000;
  shadow-opacity: 0.05;
  shadow-radius: 3px;
  elevation: 1;
`;

export default function LoginScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = () => {
    // placeholder – in a real app, call auth API
    if (email && password) {
      Alert.alert('Welcome!', `Logged in as ${email}`);
      navigation.replace('Main');
    } else {
      Alert.alert('Missing fields', 'Please enter email and password');
    }
  };

  const onSocial = (provider: string) => {
    Alert.alert('Social login', `Pretend we logged in with ${provider}`);
    navigation.replace('Main');
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Welcome to Organic App</Text>
        <AuthInput placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <AuthInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <TouchableOpacity style={styles.primaryBtn} onPress={onLogin}>
          <Text style={styles.primaryBtnText}>Log In</Text>
        </TouchableOpacity>
        <Text style={styles.orText}>or continue with</Text>
        <SocialButton onPress={() => onSocial('Google')}>
          <Feather name="google" size={20} color={theme.colors.text} style={{ marginRight: 8 }} />
          <Text style={styles.socialText}>Google</Text>
        </SocialButton>
        <SocialButton onPress={() => onSocial('Apple')}>
          <Feather name="apple" size={20} color={theme.colors.text} style={{ marginRight: 8 }} />
          <Text style={styles.socialText}>Apple</Text>
        </SocialButton>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 24, textAlign: 'center' },
  primaryBtn: {
    backgroundColor: '#2E7D32',
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 12,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  orText: { textAlign: 'center', marginVertical: 12, color: '#777' },
  socialText: { fontSize: 16, color: '#222' },
});
