// src/components/ScreenContainer.tsx
// Wrapper that applies safe‑area handling, background, and padding

import React from 'react';
import { SafeAreaView, StatusBar, ImageBackground } from 'react-native';
import styled, { useTheme } from 'styled-components/native';

const backgroundImage = require('../assets/mobile_background.png');

const InnerContainer = styled(SafeAreaView)<{ noPadding?: boolean }>`
  flex: 1;
  background-color: rgba(243, 237, 215, 0.15); /* light tint to blend contents */
  padding: ${({ theme, noPadding }) => noPadding ? '0px' : `${theme.spacing(2)}px`};
`;

const SolidContainer = styled(SafeAreaView)<{ bg: string; noPadding?: boolean }>`
  flex: 1;
  background-color: ${({ bg }) => bg};
  padding: ${({ theme, noPadding }) => noPadding ? '0px' : `${theme.spacing(2)}px`};
`;

type Props = {
  children: React.ReactNode;
  backgroundColor?: string; // optional override
  noPadding?: boolean;
};

export function ScreenContainer({ children, backgroundColor, noPadding }: Props) {
  const theme = useTheme();

  if (backgroundColor) {
    return (
      <SolidContainer bg={backgroundColor} noPadding={noPadding}>
        <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
        {children}
      </SolidContainer>
    );
  }

  return (
    <ImageBackground 
      source={backgroundImage} 
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <InnerContainer noPadding={noPadding}>
        {children}
      </InnerContainer>
    </ImageBackground>
  );
}

export default ScreenContainer;