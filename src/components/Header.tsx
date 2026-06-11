// src/components/Header.tsx
// Simple header with optional back button and action icon

import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import styled, { useTheme } from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';

const HeaderContainer = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-vertical: ${({ theme }) => theme.spacing(1)}px;
`;

const Title = styled(Text)`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

type Props = {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  actionIcon?: keyof typeof Feather.glyphMap;
  onAction?: () => void;
};

export default function Header({ title, showBack = false, onBack, actionIcon, onAction }: Props) {
  const theme = useTheme();
  const navigation = useNavigation();

  const handleBack = () => {
    if (onBack) onBack();
    else navigation.goBack();
  };

  return (
    <HeaderContainer>
      {showBack ? (
        <TouchableOpacity onPress={handleBack} accessibilityLabel="Back">
          <Feather name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      ) : <View style={{ width: 24 }} />}
      <Title>{title}</Title>
      {actionIcon ? (
        <TouchableOpacity onPress={onAction} accessibilityLabel="Action">
          <Feather name={actionIcon} size={24} color={theme.colors.text} />
        </TouchableOpacity>
      ) : <View style={{ width: 24 }} />}
    </HeaderContainer>
  );
}
