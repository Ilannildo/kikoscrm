"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { ArrowLeft, Briefcase } from "lucide-react";
import {
  CreateDealSchema,
  DealStatus,
  type CreateDealDto,
} from "@kikos/shared";
import type { z } from "zod";

type DealFormValues = z.input<typeof CreateDealSchema>;
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@kikos/ui/components/button";
import { Input } from "@kikos/ui/components/input";
import { Select } from "@kikos/ui/components/select";
import { Textarea } from "@kikos/ui/components/textarea";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@kikos/ui/components/field";
import { Separator } from "@kikos/ui/components/separator";
import { Spinner } from "@kikos/ui/components/spinner";
import { useToast } from "@kikos/ui/components/toast";
import { MoneyInput } from "@/components/ui/money-input";
import { api } from "@/trpc/react";
import { DEAL_STATUS_META, DEAL_STATUS_ORDER } from "@/lib/status";

export default function CreateDealPage() {
  const router = useRouter();
  const { toast } = useToast();

  const { data: me } = api.users.me.useQuery();
  const isAdmin = me?.role === "admin";

  const { data: leadsData } = api.leads.list.useQuery({
    page: 1,
    pageSize: 100,
  });
  const leads = leadsData?.data ?? [];

  const { data: sellersData } = api.sellers.list.useQuery(
    { page: 1, pageSize: 100 },
    { enabled: isAdmin }
  );
  const sellers = sellersData?.data ?? [];

  const createMutation = api.deals.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Negócio criado",
        description: "O negócio foi criado com sucesso.",
        variant: "success",
      });
      router.push("/deals");
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar negócio",
        description: error.message,
        variant: "error",
      });
    },
  });

const form = useForm<DealFormValues>({
    resolver: zodResolver(CreateDealSchema),
    defaultValues: {
      name: "",
      value: "",
      description: "",
      leadId: "",
      sellerId: me?.id ?? "",
      status: DealStatus.new,
    },
  });

  const onSubmit = (data: DealFormValues) => {
    createMutation.mutate(data as CreateDealDto);
  };

  return (
    <div>
      <PageHeader
        title="Cadastrar Novo Negócio"
        description="Vincule o negócio ao pipeline comercial"
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="size-4" />
            Voltar
          </Button>
        }
      />

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-3xl space-y-6"
      >
        <FieldSet>
          <FieldLegend>Vincular Negócio ao Pipeline</FieldLegend>
          <FieldGroup className="grid gap-5 md:grid-cols-2">
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="name">Nome do Negócio *</FieldLabel>
                  <Input
                    {...field}
                    id="name"
                    placeholder="Ex.: Academia X — Kit Completo"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="leadId"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="leadId">Lead Vinculado *</FieldLabel>
                  <Select
                    {...field}
                    id="leadId"
                    aria-invalid={fieldState.invalid}
                  >
                    <option value="">Selecione um lead</option>
                    {leads.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                        {l.company ? ` — ${l.company}` : ""}
                      </option>
                    ))}
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="value"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="value">Valor Estimado (R$) *</FieldLabel>
                  <MoneyInput
                    id="value"
                    value={field.value}
                    onValueChange={(v) => field.onChange(v)}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="sellerId"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="sellerId">
                    Vendedor Responsável *
                  </FieldLabel>
                  {isAdmin ? (
                    <Select
                      {...field}
                      id="sellerId"
                      aria-invalid={fieldState.invalid}
                    >
                      <option value="">Selecione um vendedor</option>
                      {sellers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <Input
                      {...field}
                      id="sellerId"
                      value={me?.name ?? ""}
                      disabled
                    />
                  )}
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="status"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="status">
                    Status Inicial no Funil
                  </FieldLabel>
                  <Select
                    {...field}
                    id="status"
                    aria-invalid={fieldState.invalid}
                  >
                    {DEAL_STATUS_ORDER.map((s) => (
                      <option key={s} value={s}>
                        {DEAL_STATUS_META[s].label}
                      </option>
                    ))}
                  </Select>
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="description"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="description">Descrição</FieldLabel>
                  <Input
                    {...field}
                    id="description"
                    value={field.value ?? ""}
                    placeholder="Descrição breve do escopo"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>

        <Separator />

        <FieldSet>
          <FieldLegend>Descrição do Negócio & Escopo</FieldLegend>
          <Controller
            control={form.control}
            name="description"
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="descriptionLong">Detalhes e escopo</FieldLabel>
                <Textarea
                  id="descriptionLong"
                  rows={4}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder="Descreva o escopo, entregas e detalhes do negócio..."
                />
              </Field>
            )}
          />
        </FieldSet>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={createMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-accent text-accent-foreground"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <Spinner className="size-4" />
            ) : (
              <Briefcase className="size-4" />
            )}
            Criar Negócio
          </Button>
        </div>
      </form>
    </div>
  );
}
