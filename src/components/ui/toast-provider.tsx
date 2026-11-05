"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type ToastVariant = "success" | "error" | "info";

type ToastItemData = {
  id: string;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  addToast: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const toastVariants: Variants = {
  initial: { opacity: 0, y: 12, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: 8,
    scale: 0.98,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

const variantClasses: Record<ToastVariant, string> = {
  success:
    "border-emerald-500/30 bg-emerald-50 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-100",
  error:
    "border-red-500/30 bg-red-50 text-red-950 dark:bg-red-950 dark:text-red-100",
  info: "border-border bg-background text-foreground",
};

type ToastProps = {
  toast: ToastItemData;
  onDismiss: (id: string) => void;
};

function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      onDismiss(toast.id);
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [onDismiss, toast.id]);

  return (
    <motion.div
      layout
      variants={toastVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      role={toast.variant === "error" ? "alert" : "status"}
      className={`flex min-w-72 items-start justify-between gap-4 rounded-xl border p-4 text-sm shadow-lg ${variantClasses[toast.variant]}`}
    >
      <p className="leading-5">{toast.message}</p>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={() => onDismiss(toast.id)}
        className="rounded-md px-1 text-lg leading-5 opacity-70 outline-none hover:opacity-100 focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <span aria-hidden="true">×</span>
      </button>
    </motion.div>
  );
}

type ToastProviderProps = {
  children: ReactNode;
};

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItemData[]>([]);

  const addToast = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      setToasts((current) =>
        [...current, { id: crypto.randomUUID(), message, variant }].slice(-4)
      );
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div
        role="region"
        aria-label="Notifications"
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3"
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <Toast toast={toast} onDismiss={dismissToast} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider.");
  }

  return context;
}
