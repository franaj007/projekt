import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  success: (message: string) => void;
  error:   (message: string) => void;
  info:    (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);
let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, type: ToastType) => {
    const id = ++nextId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />,
    error:   <XCircle    className="w-5 h-5 text-red-500   flex-shrink-0" />,
    info:    <Info       className="w-5 h-5 text-blue-500  flex-shrink-0" />,
  };

  const bg: Record<ToastType, string> = {
    success: 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20',
    error:   'border-red-200   dark:border-red-800   bg-red-50   dark:bg-red-900/20',
    info:    'border-blue-200  dark:border-blue-800  bg-blue-50  dark:bg-blue-900/20',
  };

  return (
    <ToastContext.Provider value={{ success: (m) => push(m, 'success'), error: (m) => push(m, 'error'), info: (m) => push(m, 'info') }}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg backdrop-blur-sm max-w-sm w-full pointer-events-auto
              animate-in slide-in-from-bottom-2 fade-in duration-300 ${bg[t.type]}`}
          >
            {icons[t.type]}
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 flex-1">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
