// src/components/AuthInput.tsx
// Re‑usable styled text input for auth forms

import React from 'react';
import { TextInput, TextInputProps } from 'react-native';
import styled from 'styled-components/native';

const StyledInput = styled(TextInput)`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.md}px;
  padding: ${({ theme }) => theme.spacing(2)}px;
  margin-vertical: ${({ theme }) => theme.spacing(1)}px;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text};
`;

type Props = TextInputProps & {
  placeholder: string;
};

export default function AuthInput({ placeholder, ...rest }: Props) {
  return (
    <StyledInput
      placeholder={placeholder}
      placeholderTextColor="#777"
      autoCapitalize="none"
      {...rest}
    />
  );
}
