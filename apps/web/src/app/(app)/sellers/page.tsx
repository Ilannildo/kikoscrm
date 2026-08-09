"use client";

import * as React from "react";
import { Plus, Search, UserPlus, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@kikos/ui/components/button";
import { Input } from "@kikos/ui/components/input";
import { Skeleton } from "@kikos/ui/components/skeleton";
import { EmptyState } from "@kikos/ui/components/empty-state";
import { ErrorState } from "@kikos/ui/components/error-state";
import { Drawer } from "@kikos/ui/components/drawer";
import { useToast } from "@kikos/ui/components/toast";
import { SellerCard } from "@/components/sellers/seller-card";
import { SellerForm, type SellerFormValues } from "@/components/sellers/seller-form";
import { api } from "@/trpc/react";
import { UserRole } from "@kikos/shared";

export default function SellersPage() {
  const { toast } = useToast();
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [createOpen, setCreateOpen] = React.useState(false);

  const { data: me } = api.users.me.useQuery();
  const isAdmin = me?.role === UserRole.admin;

  // Debounce a busca
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isError, error, refetch } =
    api.sellers.list.useQuery({
      page: 1,
      pageSize: 100,
      search: debouncedSearch || undefined,
    });

  const utils = api.useUtils();

  const createMutation = api.users.create.useMutation({
    onSuccess: () => {
      setCreateOpen(false);
      toast({
        title: "Vendedor criado",
        description: "O vendedor foi cadastrado com sucesso.",
        variant: "success",
      });
      utils.sellers.list.invalidate();
    },
    onError: (err) => {
      toast({
        title: "Erro ao criar vendedor",
        description: err.message,
        variant: "error",
      });
    },
  });

  const sellers = data?.data ?? [];
  const hasSearch = debouncedSearch.trim().length > 0;

  const handleCreate = (values: SellerFormValues) => {
    createMutation.mutate({
      ...values,
      role: UserRole.seller,
    });
  };

  return (
    <div>
      <PageHeader
        title="Vendedores"
        description="Acompanhe o desempenho da sua equipe de vendas"
actions={
          isAdmin ? (
            <Button
              className="bg-accent text-accent-foreground"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-4" />
              Novo Vendedor
            </Button>
          ) : null
        }
      />

      {/* Search */}
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center">
        <form
          onSubmit={(e) => e.preventDefault()}
          className="relative flex-1 md:max-w-sm"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            className="h-9 rounded-md pl-9"
          />
        </form>
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border/60 bg-card p-5"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="size-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
              <Skeleton className="mt-4 h-9 w-full" />
              <Skeleton className="mt-4 h-1.5 w-full" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="Erro ao carregar vendedores"
          message={error?.message}
          onRetry={() => refetch()}
        />
      ) : sellers.length === 0 ? (
        hasSearch ? (
          <EmptyState
            icon={<Users className="size-6" />}
            title="Nenhum vendedor encontrado"
            description="Não existem vendedores correspondentes aos filtros atuais."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setDebouncedSearch("");
                }}
              >
                Limpar filtros
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={<Users className="size-6" />}
            title="Nenhum vendedor cadastrado"
            description="Comece adicionando o primeiro vendedor ao CRM."
action={
              isAdmin ? (
                <Button
                  className="bg-accent text-accent-foreground"
                  onClick={() => setCreateOpen(true)}
                >
                  <UserPlus className="size-4" />
                  Novo Vendedor
                </Button>
              ) : null
            }
          />
        )
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sellers.map((seller) => (
            <SellerCard key={seller.id} seller={seller} />
          ))}
        </div>
      )}

      {/* Create drawer */}
      <Drawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Novo Vendedor"
        description="Cadastre um novo vendedor na equipe"
      >
        <SellerForm
          isSubmitting={createMutation.isPending}
          submitLabel={createMutation.isPending ? "Criando..." : "Criar Vendedor"}
          onSubmit={handleCreate}
          onCancel={() => setCreateOpen(false)}
        />
      </Drawer>
    </div>
  );
}
