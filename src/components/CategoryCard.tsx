// src/components/CategoryCard.tsx
// Small rounded card for a product category used on the Home screen

import React from 'react';
import { TouchableOpacity, Text, View, Image } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { Feather } from '@expo/vector-icons';

type Props = {
  name: string;
  iconName: keyof typeof Feather.glyphMap;
  onPress: () => void;
};

const Card = styled(TouchableOpacity)`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.md}px;
  width: 80px;
  height: 100px;
  justify-content: center;
  align-items: center;
  margin-horizontal: 8px;
  shadow-color: #000;
  shadow-opacity: 0.05;
  shadow-radius: 3px;
  elevation: 1;
`;

export default function CategoryCard({ name, iconName, onPress }: Props) {
  const theme = useTheme();
  return (
    <Card onPress={onPress} activeOpacity={0.8}>
      <Feather name={iconName} size={28} color={theme.colors.primary} />
      <Text style={{ marginTop: 4, fontSize: 12, color: theme.colors.text }}>{name}</Text>
    </Card>
  );
}
