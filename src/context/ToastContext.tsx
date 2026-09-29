import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, title?: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'info', title?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message, title }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  const success = useCallback((message: string, title = 'Success') => {
    addToast(message, 'success', title);
  }, [addToast]);

  const error = useCallback((message: string, title = 'Error') => {
    addToast(message, 'error', title);
  }, [addToast]);

  const info = useCallback((message: string, title = 'Notice') => {
    addToast(message, 'info', title);
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, info }}>
      {children}
      <div className="toast-container" style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none'
      }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast-item toast-${t.type}`}
            style={{
              pointerEvents: 'auto',
              minWidth: '320px',
              maxWidth: '420px',
              padding: '14px 18px',
              borderRadius: '10px',
              background: t.type === 'error' ? 'rgba(38, 10, 15, 0.95)' : t.type === 'success' ? 'rgba(8, 30, 20, 0.95)' : 'rgba(15, 23, 42, 0.95)',
              border: `1px solid ${t.type === 'error' ? 'rgba(239, 68, 68, 0.4)' : t.type === 'success' ? 'rgba(0, 255, 102, 0.4)' : 'rgba(56, 189, 248, 0.4)'}`,
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(0, 255, 102, 0.05)',
              backdropFilter: 'blur(12px)',
              color: '#f3f4f6',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              fontFamily: '"Plus Jakarta Sans", sans-serif'
            }}
          >
            <div style={{ marginTop: '2px', flexShrink: 0 }}>
              {t.type === 'success' && <CheckCircle2 size={18} color="#00ff66" />}
              {t.type === 'error' && <AlertCircle size={18} color="#ef4444" />}
              {t.type === 'info' && <Info size={18} color="#38bdf8" />}
            </div>
            <div style={{ flex: 1 }}>
              {t.title && (
                <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '2px', color: '#fff' }}>
                  {t.title}
                </div>
              )}
              <div style={{ fontSize: '0.8125rem', color: '#d1d5db', lineHeight: 1.4 }}>
                {t.message}
              </div>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#9ca3af',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={14} />
            </button>
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
