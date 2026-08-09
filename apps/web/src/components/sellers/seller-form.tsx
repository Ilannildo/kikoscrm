"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@kikos/ui/components/button";
import { Input } from "@kikos/ui/components/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from "@kikos/ui/components/field";
import { Spinner } from "@kikos/ui/components/spinner";

const sellerFormSchema = z.object({
  name: z.string().min(1, "O nome é um campo obrigatório"),
  email: z.string().email("Formato de e-mail inválido"),
  password: z
    .string()
    .min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export type SellerFormValues = z.infer<typeof sellerFormSchema>;

interface SellerFormProps {
  defaultValues?: Partial<SellerFormValues>;
  isSubmitting?: boolean;
  submitLabel?: string;
  onSubmit: (data: SellerFormValues) => void;
  onCancel?: () => void;
}

export function SellerForm({
  defaultValues,
  isSubmitting = false,
  submitLabel = "Criar Vendedor",
  onSubmit,
  onCancel,
}: SellerFormProps) {
  const form = useForm<SellerFormValues>({
    resolver: zodResolver(sellerFormSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      email: defaultValues?.email ?? "",
      password: defaultValues?.password ?? "",
    },
  });

  const handleSubmit = (data: SellerFormValues) => {
    onSubmit(data);
  };

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className="space-y-6"
      noValidate
    >
      <FieldSet>
        <FieldLegend>Informações do Vendedor</FieldLegend>
        <FieldGroup>
          <Controller
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="seller-name">Nome *</FieldLabel>
                <Input
                  {...field}
                  id="seller-name"
                  placeholder="Nome completo"
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
                <FieldLabel htmlFor="seller-email">E-mail *</FieldLabel>
                <Input
                  {...field}
                  id="seller-email"
                  type="email"
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
            name="password"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="seller-password">Senha *</FieldLabel>
                <Input
                  {...field}
                  id="seller-password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
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

      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          className="bg-accent text-accent-foreground"
          disabled={isSubmitting}
        >
          {isSubmitting && <Spinner className="size-4" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
