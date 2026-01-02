import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { haptics } from '../utils/haptics';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (type: ToastType, message: string, duration?: number) => void;
  dismissToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const toastConfig: Record<ToastType, { icon: React.FC<{ size?: number }>; bgColor: string; borderColor: string; iconColor: string }> = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    iconColor: 'text-emerald-500',
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconColor: 'text-red-500',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    iconColor: 'text-amber-500',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-500',
  },
};

const ToastItem: React.FC<{ toast: Toast; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  const config = toastConfig[toast.type];
  const Icon = config.icon;

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        onDismiss(toast.id);
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm animate-in slide-in-from-top-2 fade-in duration-200 ${config.bgColor} ${config.borderColor}`}
      role="alert"
    >
      <Icon size={20} className={config.iconColor} />
      <p className="flex-1 text-sm font-medium text-slate-800">{toast.message}</p>
      <button
        onClick={() => {
          haptics.light();
          onDismiss(toast.id);
        }}
        className="p-1 rounded-lg hover:bg-black/5 transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
        aria-label="Dismiss"
      >
        <X size={16} className="text-slate-500" />
      </button>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, message: string, duration = 4000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Haptic feedback based on type
    if (type === 'success') haptics.success();
    else if (type === 'error') haptics.error();
    else if (type === 'warning') haptics.warning();
    else haptics.light();

    setToasts((prev) => [...prev, { id, type, message, duration }]);

    // Auto-dismiss (also handled in ToastItem for redundancy)
    if (duration > 0) {
      setTimeout(() => dismissToast(id), duration);
    }
  }, [dismissToast]);

  const success = useCallback((message: string, duration?: number) => showToast('success', message, duration), [showToast]);
  const error = useCallback((message: string, duration?: number) => showToast('error', message, duration), [showToast]);
  const warning = useCallback((message: string, duration?: number) => showToast('warning', message, duration), [showToast]);
  const info = useCallback((message: string, duration?: number) => showToast('info', message, duration), [showToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast, success, error, warning, info }}>
      {children}

      {/* Toast Container */}
      <div
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4 space-y-2 pointer-events-none"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onDismiss={dismissToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
