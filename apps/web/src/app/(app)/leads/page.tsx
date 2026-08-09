"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@kikos/ui/components/button";

export default function LeadsPage() {
  return (
    <div>
      <PageHeader
        title="Leads"
        description="Todos os contatos e oportunidades comerciais"
        actions={<Button className="bg-accent text-accent-foreground">Novo lead</Button>}
      />
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border/60 text-sm text-muted-foreground">
        Em breve: listagem de leads
      </div>
    </div>
  );
}
