
  import React from 'react';
  import { colors, spacing } from '../theme';

  export type ButtonVariant = 'primary' | 'secondary' | 'danger';

  interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    children: React.ReactNode;
  }

  export const Button: React.FC<Props> = ({
    variant = 'primary',
    disabled,
    className = '',
    ...rest
  }) => {
    const base = `inline-flex items-center justify-center rounded-md px-${spacing.md} py-${spacing.sm} font-medium
  transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`;
    const variantClasses: Record<ButtonVariant, string> = {
      primary: `bg-${colors.primary} text-white hover:bg-${colors.primary}/90`,
      secondary: `bg-${colors.secondary} text-white hover:bg-${colors.secondary}/90`,
      danger: `bg-${colors.error} text-white hover:bg-${colors.error}/90`,
    };
    const disabledCls = disabled
      ? 'opacity-50 cursor-not-allowed animate-pulse-primary' // <-- pulse added
      : '';
    return (
      <button
        className={`${base} ${variantClasses[variant]} ${disabledCls} ${className}`}
        disabled={disabled}
        {...rest}
      >
        {rest.children}
      </button>
    );
  };

  export default Button;