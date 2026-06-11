import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextProps {
  toast: (msg: string, type?: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

const toastColors: Record<Toast['type'], { bg: string; icon: string }> = {
  success: { bg: '#16a34a', icon: '✅' },
  error:   { bg: '#ef4444', icon: '❌' },
  info:    { bg: '#0d9488', icon: 'ℹ️'  },
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (message: string, type: Toast['type'] = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 9999,
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 20px',
            borderRadius: '14px',
            background: toastColors[t.type].bg,
            color: '#fff',
            fontWeight: '600',
            fontSize: '14px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            maxWidth: '360px',
            animation: 'slide-up 0.3s ease-out forwards',
            cursor: 'pointer',
          }} onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}>
            <span style={{ fontSize: '18px' }}>{toastColors[t.type].icon}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
