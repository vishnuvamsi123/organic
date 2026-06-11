import React from 'react';
import { colors, spacing } from '../theme';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<Props> = ({ label, error, className = '', ...rest }) => (
  <div className="flex flex-col mb-4">
    {label && (
      <label className="mb-1 font-medium text-gray-700" htmlFor={rest.id}>
        {label}
      </label>
    )}
    <input
      className={`border border-gray-300 rounded-md px-${spacing.sm} py-${spacing.xs} focus:outline-none focus:ring-2 focus:ring-${colors.primary} ${error ? 'border-' + colors.error : ''} ${className}`}
      {...rest}
    />
    {error && (
      <p className="mt-1 text-sm" style={{ color: colors.error }}>
        {error}
      </p>
    )}
  </div>
);

export default Input;
