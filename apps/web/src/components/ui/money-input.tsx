"use client";

import * as React from "react";

interface MoneyInputProps
  extends Omit<React.ComponentProps<"input">, "value" | "onChange" | "type"> {
  value: number | string;
  onValueChange: (value: string) => void;
}

function parseToNumber(value: string): number {
  const cleaned = value.replace(/\D/g, "");
  if (!cleaned) return 0;
  return Number(cleaned) / 100;
}

function formatToBRLString(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Input de valor monetário em BRL.
 * Mantém o valor formatado como moeda enquanto digita, expondo
 * sempre o valor numérico "cru" (string decimal) via `onValueChange`.
 */
export function MoneyInput({
  value,
  onValueChange,
  className,
  ...props
}: MoneyInputProps) {
  const [display, setDisplay] = React.useState("");

  // Sync display whenever the external value changes (e.g. reset/editing)
  React.useEffect(() => {
    const num = typeof value === "string" ? Number(value) : value;
    if (Number.isNaN(num)) {
      setDisplay("");
      return;
    }
    setDisplay(num === 0 ? "" : formatToBRLString(num));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const num = parseToNumber(raw);
    setDisplay(num === 0 ? "" : formatToBRLString(num));
    onValueChange(num === 0 ? "" : String(num));
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      value={display}
      onChange={handleChange}
      placeholder="R$ 0,00"
      className="h-11 w-full min-w-0 rounded-xl border border-stone-200 bg-transparent px-3 py-2 text-base outline-none transition-[color,box-shadow] selection:bg-primary-500 selection:text-primary-50 placeholder:text-stone-400 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-primary-500 focus-visible:ring-[3px] focus-visible:ring-primary-500/50 aria-invalid:border-red-500 aria-invalid:ring-red-500/20"
      {...props}
    />
  );
}
