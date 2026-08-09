"use client";

import { PageHeader } from "@/components/layout/page-header";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateLeadSchema, LeadStatus, type CreateLeadDto } from "@kikos/shared";
import { Button } from "@kikos/ui/components/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@kikos/ui/components/field";
import { Input } from "@kikos/ui/components/input";
import { Select } from "@kikos/ui/components/select";
import { Separator } from "@kikos/ui/components/separator";
import { Spinner } from "@kikos/ui/components/spinner";
import { Textarea } from "@kikos/ui/components/textarea";
import { useToast } from "@kikos/ui/components/toast";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";

export default function CreateLeadPage() {
  const router = useRouter();
  const { toast } = useToast();

  const { data: me } = api.users.me.useQuery();
  const isAdmin = me?.role === "admin";

  const { data: sellersData } = api.sellers.list.useQuery(
    { page: 1, pageSize: 100 },
    { enabled: isAdmin }
  );
  const sellers = sellersData?.data ?? [];

  const createMutation = api.leads.create.useMutation({
    onSuccess: (lead) => {
      toast({
        title: "Lead criado",
        description: "O lead foi criado com sucesso.",
        variant: "success",
      });
      router.push("/leads");
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar lead",
        description: error.message,
        variant: "error",
      });
    },
  });

  const form = useForm<CreateLeadDto>({
    resolver: zodResolver(CreateLeadSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      source: "",
      notes: "",
      status: LeadStatus.new,
      sellerId: "",
    },
  });

  const onSubmit = (data: CreateLeadDto) => {
    createMutation.mutate(data);
  };

  return (
    <div>
      <PageHeader
        title="Criar Novo Lead"
        description="Preencha as informações do contato"
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
          <FieldLegend>Informações Gerais do Contato</FieldLegend>
          <FieldGroup className="grid gap-5 md:grid-cols-2">
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="name">Nome Completo *</FieldLabel>
                  <Input
                    {...field}
                    id="name"
                    placeholder="Nome do contato"
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
              name="company"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="company">
                    Nome da Empresa / Condomínio
                  </FieldLabel>
<Input
                    {...field}
                    id="company"
                    value={field.value ?? ""}
                    placeholder="Empresa ou condomínio"
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
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="email">E-mail *</FieldLabel>
<Input
                    {...field}
                    id="email"
                    type="email"
                    value={field.value ?? ""}
                    placeholder="email@empresa.com"
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
              name="phone"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="phone">Telefone</FieldLabel>
<Input
                    {...field}
                    id="phone"
                    value={field.value ?? ""}
                    placeholder="(11) 99999-9999"
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
              name="source"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="source">Origem do Lead</FieldLabel>
<Input
                    {...field}
                    id="source"
                    value={field.value ?? ""}
                    placeholder="Ex.: Indicação, Site, Redes sociais"
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
                    <Input {...field} id="sellerId" disabled value={me?.name ?? ""} />
                  )}
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
          <FieldLegend>Observações e Histórico Preliminar</FieldLegend>
          <Controller
            control={form.control}
            name="notes"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="notes">Observações</FieldLabel>
<Textarea
                  {...field}
                  id="notes"
                  rows={4}
                  value={field.value ?? ""}
                  placeholder="Adicione observações sobre o contato..."
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
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
              <Save className="size-4" />
            )}
            Salvar Lead
          </Button>
        </div>
      </form>
    </div>
  );
}
