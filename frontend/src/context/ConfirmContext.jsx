import { createContext, useContext, useState, useCallback } from 'react';

const ConfirmContext = createContext(null);

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used inside ConfirmProvider');
  return ctx;
};

export function ConfirmProvider({ children }) {
  const [state, setState] = useState({
    open: false,
    title: '',
    message: '',
    confirmText: 'ຢືນຢັນ',
    cancelText: 'ຍົກເລີກ',
    variant: 'danger', // 'danger' | 'warning' | 'info'
    resolve: null,
  });

  const confirm = useCallback((opts) => {
    return new Promise((resolve) => {
      setState({
        open: true,
        title: opts.title || 'ຢືນຢັນການກະທຳ',
        message: opts.message || 'ທ່ານແນ່ໃຈບໍ່?',
        confirmText: opts.confirmText || 'ຢືນຢັນ',
        cancelText: opts.cancelText || 'ຍົກເລີກ',
        variant: opts.variant || 'danger',
        resolve,
      });
    });
  }, []);

  const handleConfirm = () => {
    state.resolve?.(true);
    setState((s) => ({ ...s, open: false }));
  };

  const handleCancel = () => {
    state.resolve?.(false);
    setState((s) => ({ ...s, open: false }));
  };

  const variants = {
    danger: { bg: 'bg-red-100', icon: 'text-red-600', btn: 'bg-red-600 hover:bg-red-700' },
    warning: { bg: 'bg-yellow-100', icon: 'text-yellow-600', btn: 'bg-yellow-600 hover:bg-yellow-700' },
    info: { bg: 'bg-blue-100', icon: 'text-blue-600', btn: 'bg-blue-600 hover:bg-blue-700' },
  };
  const v = variants[state.variant] || variants.danger;

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state.open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCancel} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-12 h-12 rounded-full ${v.bg} flex items-center justify-center shrink-0`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={v.icon}>
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">{state.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{state.message}</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={handleCancel}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
              >
                {state.cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all ${v.btn}`}
              >
                {state.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
