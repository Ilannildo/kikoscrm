"use client";

import { PageHeader } from "@/components/layout/page-header";

export default function SellersPage() {
  return (
    <div>
      <PageHeader
        title="Vendedores"
        description="Acompanhe o desempenho da sua equipe de vendas"
      />
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border/60 text-sm text-muted-foreground">
        Em breve: lista de vendedores
      </div>
    </div>
  );
}
