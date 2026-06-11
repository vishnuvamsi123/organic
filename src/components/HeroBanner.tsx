// src/components/HeroBanner.tsx
// A full‑width hero banner with overlay text and optional CTA button

import React from 'react';
import { ImageBackground, Text, TouchableOpacity, View } from 'react-native';
import styled, { useTheme } from 'styled-components/native';

type Props = {
  imageUri: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  onPress?: () => void;
};

const Overlay = styled(View)`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.3);
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(3)}px;
`;

const Title = styled(Text)`
  font-size: 28px;
  color: #fff;
  font-weight: 700;
  text-align: center;
  margin-bottom: 8px;
`;

const Subtitle = styled(Text)`
  font-size: 16px;
  color: #eee;
  text-align: center;
  margin-bottom: 12px;
`;

export default function HeroBanner({ imageUri, title, subtitle, ctaLabel, onPress }: Props) {
  const theme = useTheme();
  return (
    <ImageBackground
      source={{ uri: imageUri }}
      style={{ width: '100%', height: 200, borderRadius: theme.radii.md, overflow: 'hidden' }}
    >
      <Overlay>
        <Title>{title}</Title>
        {subtitle && <Subtitle>{subtitle}</Subtitle>}
        {ctaLabel && onPress && (
          <TouchableOpacity
            onPress={onPress}
            style={{
              backgroundColor: theme.colors.primary,
              paddingHorizontal: theme.spacing(2),
              paddingVertical: theme.spacing(1),
              borderRadius: theme.radii.md,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>{ctaLabel}</Text>
          </TouchableOpacity>
        )}
      </Overlay>
    </ImageBackground>
  );
}
