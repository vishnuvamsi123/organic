// src/components/ProductCard.tsx
// Premium product card with glass‑morphism, rating and add‑to‑cart button

import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { Feather } from '@expo/vector-icons';

type Props = {
  product: {
    id: string;
    name: string;
    price: string;
    image: string;
    rating: number; // 0‑5
  };
  onPress: (id: string) => void;
  onAdd: (id: string) => void;
};

const Card = styled(TouchableOpacity)`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.md}px;
  overflow: hidden;
  shadow-color: #000;
  shadow-opacity: 0.07;
  shadow-radius: 4px;
  elevation: 2;
  margin-bottom: ${({ theme }) => theme.spacing(2)}px;
`;

const Badge = styled(View)`
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: #4caf50;
  padding-horizontal: 6px;
  padding-vertical: 2px;
  border-radius: 12px;
`;

export default function ProductCard({ product, onPress, onAdd }: Props) {
  const theme = useTheme();
  return (
    <Card onPress={() => onPress(product.id)} activeOpacity={0.9}>
      <Image source={{ uri: product.image }} style={{ width: '100%', height: 140 }} />
      <Badge>
        <Text style={{ color: '#fff', fontSize: 10, fontWeight: '600' }}>ORGANIC</Text>
      </Badge>
      <View style={{ padding: theme.spacing(2) }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.text }}>{product.name}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, alignItems: 'center' }}>
          <Text style={{ color: theme.colors.primary, fontSize: 15, fontWeight: '700' }}>{product.price}</Text>
          <TouchableOpacity onPress={() => onAdd(product.id)}>
            <Feather name="plus-circle" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', marginTop: 4 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Feather
              key={i}
              name="star"
              size={14}
              color={i < Math.round(product.rating) ? '#FFD700' : '#ccc'}
            />
          ))}
        </View>
      </View>
    </Card>
  );
}
