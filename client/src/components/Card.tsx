import React from 'react';
import { colors, spacing, shadows } from '../theme';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<Props> = ({ children, className = '', ...rest }) => (
  <div
    className={`bg-${colors.surface} rounded-md shadow-${shadows.md} p-${spacing.md} ${className}`}
    {...rest}
  >
    {children}
  </div>
);

export default Card;
