import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type, message, duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => removeToast(id), duration);
  }, [removeToast]);

  const toast = {
    success: (msg, duration) => addToast('success', msg, duration),
    error: (msg, duration) => addToast('error', msg, duration),
    info: (msg, duration) => addToast('info', msg, duration),
    warning: (msg, duration) => addToast('warning', msg, duration),
  };

  const config = {
    success: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'M5 13l4 4L19 7' },
    error: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'M6 18L18 6M6 6l12 12' },
    info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          const cfg = config[t.type] || config.info;
          return (
            <div key={t.id}
              className={`${cfg.bg} ${cfg.border} ${cfg.text} border rounded-xl shadow-lg p-4 flex items-start gap-3 animate-slide-in pointer-events-auto`}
              role="alert"
            >
              <div className={`w-6 h-6 rounded-full ${cfg.bg} flex items-center justify-center shrink-0`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d={cfg.icon} />
                </svg>
              </div>
              <p className="flex-1 text-sm font-medium">{t.message}</p>
              <button
                onClick={() => removeToast(t.id)}
                className="opacity-50 hover:opacity-100 shrink-0"
                aria-label="ປິດ"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
