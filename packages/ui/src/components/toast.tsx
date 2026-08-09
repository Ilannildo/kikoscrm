"use client";

import * as React from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "@kikos/ui/lib/utils";

type ToastVariant = "success" | "error" | "info";

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (options: {
    title: string;
    description?: string;
    variant?: ToastVariant;
  }) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    return { toast: () => {} };
  }
  return ctx;
}

const variantStyles: Record<ToastVariant, { icon: React.ReactNode; accent: string }> = {
  success: { icon: <CheckCircle2 className="size-4 text-status-won" />, accent: "border-status-won/30" },
  error: { icon: <XCircle className="size-4 text-destructive" />, accent: "border-destructive/30" },
  info: { icon: <Info className="size-4 text-status-new" />, accent: "border-status-new/30" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const toast = React.useCallback(
    ({ title, description, variant = "success" }: {
      title: string;
      description?: string;
      variant?: ToastVariant;
    }) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, title, description, variant }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const remove = (id: number) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex w-80 items-start gap-3 rounded-lg border bg-popover p-3 shadow-lg animate-in slide-in-from-right-2 fade-in",
              variantStyles[t.variant].accent
            )}
          >
            <div className="mt-0.5 shrink-0">{variantStyles[t.variant].icon}</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{t.title}</p>
              {t.description && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t.description}
                </p>
              )}
            </div>
            <button
              onClick={() => remove(t.id)}
              className="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Fechar notificação"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
