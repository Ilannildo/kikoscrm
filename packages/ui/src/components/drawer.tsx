"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@kikos/ui/lib/utils";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  side?: "right" | "left";
}

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
  side = "right",
}: DrawerProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-black/60 animate-in fade-in"
        onClick={onClose}
      />
      <div
        className={cn(
          "absolute inset-y-0 flex w-full max-w-md flex-col bg-card shadow-xl animate-in slide-in-from-right-2",
          side === "right" ? "right-0" : "left-0",
          className
        )}
      >
        <div className="flex items-start justify-between border-b border-border p-4">
          <div>
            {title && (
              <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            )}
            {description && (
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Fechar"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
        {footer && (
          <div className="border-t border-border p-4">{footer}</div>
        )}
      </div>
    </div>
  );
}
