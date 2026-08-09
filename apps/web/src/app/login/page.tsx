"use client";

import { authClient } from "@/lib/auth-client";
import { zodResolver } from '@hookform/resolvers/zod';
import { ISignInRequest, SignInRequestSchema } from "@kikos/shared";
import { Button } from "@kikos/ui/components/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@kikos/ui/components/field";
import { Input } from "@kikos/ui/components/input";
import { Target } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Controller, useForm } from 'react-hook-form';

export default function LoginPage() {
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<ISignInRequest>({
    resolver: zodResolver(SignInRequestSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: ISignInRequest) => {
    setIsLoading(true);

    const result = await authClient.signIn.email({
      email: data.email,
      password: data.password,
    });

    if (result?.error) {
      setIsLoading(false);

      return
    }

    window.location.replace('/dashboard');
  };

  const onChangeEmail = (value: string) => {
    const email = value.toLowerCase();
    form.setValue('email', email);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <Target className="size-6" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Kikos CRM
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Entre para acessar seu painel comercial
            </p>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 rounded-xl border border-border/60 bg-card p-6 shadow-sm">
          <FieldGroup className="grid-2 mt-10 mb-6 gap-6 md:grid-cols-2">
            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="email">E-mail *</FieldLabel>
                  <Input
                    {...field}
                    id="email"
                    required
                    type="email"
                    placeholder="Digite o seu e-mail"
                    onChange={(e) => onChangeEmail(e.target.value)}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel aria-required htmlFor="password">
                    Senha *
                  </FieldLabel>

                  <Input
                    {...field}
                    id="password"
                    type="password"
                    required
                    placeholder="******"
                    aria-invalid={fieldState.invalid}
                  />

                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>

          <div className="mb-6 flex w-full justify-end">
            <Link className="font-normal text-sm text-stone-800" href="/recover-password">
              Esqueceu sua senha?
            </Link>
          </div>

          <div className="mb-6 w-full">
            <Button
              type="submit"
              variant="default"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              Entrar
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Não tem conta?{" "}
          <Link href="/register" className="font-medium text-accent hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
