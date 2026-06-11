// src/App.tsx
// Entry point – registers the navigation tree

import React from 'react';
import { LogBox } from 'react-native';
import AppNavigator from './navigation/AppNavigator';

// Ignore non‑critical warnings that appear during dev (e.g., Animated: `useNativeDriver`)
LogBox.ignoreLogs(['Animated: `useNativeDriver`']);

export default function App() {
  return <AppNavigator />;
}
