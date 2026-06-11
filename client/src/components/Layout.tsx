import React from 'react';
import { Header } from './Header';
import { ToastProvider } from './ToastProvider';
import { ThemeProvider } from '../context/ThemeContext';
import { ErrorBoundary } from './ErrorBoundary';

/**
 * Layout component that wraps the entire app with common UI pieces:
 *  - ThemeProvider (dark mode toggle)
 *  - ToastProvider (global notifications)
 *  - Header (global navigation)
 *  - ErrorBoundary (catches rendering errors)
 *  - Main content area (`children`)
 */
export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ErrorBoundary>
          <Header />
          <main className="min-h-screen bg-background dark:bg-gray-900 p-4">
            {children}
          </main>
        </ErrorBoundary>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default Layout;
