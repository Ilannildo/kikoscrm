

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@kikos/ui/components/button";

export default function DealsPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Gerencie seu pipeline comercial"
        actions={<Button className="bg-accent text-accent-foreground">Novo negócio</Button>}
      />
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border/60 text-sm text-muted-foreground">
        Em breve: Dashboard
      </div>
    </div>
  );
}
