// src/components/BottomNav.tsx
// Premium bottom navigation with glass‑morphism effect

import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import styled, { useTheme } from 'styled-components/native';
import { Feather } from '@expo/vector-icons';

const TabBarContainer = styled(BlurView).attrs({ intensity: 85, tint: 'light' })`
  flex-direction: row;
  justify-content: space-around;
  padding-vertical: ${({ theme }) => theme.spacing(2)}px;
  border-top-left-radius: ${({ theme }) => theme.radii.lg}px;
  border-top-right-radius: ${({ theme }) => theme.radii.lg}px;
`;

export default function BottomNav({ state, descriptors, navigation }: BottomTabBarProps) {
  const theme = useTheme();

  return (
    <TabBarContainer>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          (options.tabBarLabel as string) ?? options.title ?? route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // Map route name to an icon name from Feather
        const iconMap: Record<string, keyof typeof Feather.glyphMap> = {
          Home: 'home',
          Search: 'search',
          Cart: 'shopping-cart',
          Orders: 'list',
          Profile: 'user',
        };
        const iconName = iconMap[label] || 'circle';

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
          >
            <Feather
              name={iconName}
              size={24}
              color={isFocused ? theme.colors.primary : '#777'}
            />
          </TouchableOpacity>
        );
      })}
    </TabBarContainer>
  );
}
