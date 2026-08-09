"use client";

import { authClient } from "@/lib/auth-client";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ISignUpRequest, SignUpRequestSchema } from "@kikos/shared";
import { Button } from "@kikos/ui/components/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@kikos/ui/components/field";
import { Input } from "@kikos/ui/components/input";
import { Target } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<ISignUpRequest>({
    resolver: zodResolver(SignUpRequestSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: ISignUpRequest) => {
    setIsLoading(true);
    await authClient.signUp.email(data, {
      onError(error) {
        setIsLoading(false);
        console.log(error.error)
        // toast.error(message ?? 'Email ou senha incorretos', {
        //   position: 'top-right',
        // });
        return
      },
    });

    window.location.replace(`/login`);
    setIsLoading(false);
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
              Criar conta
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Comece a usar o Kikos CRM
            </p>
          </div>
        </div>

        <form className="space-y-4 rounded-xl border border-border/60 bg-card p-6 shadow-sm" id="register-in-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="mt-10 mb-6 grid grid-cols-1 gap-4">
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="name">Nome completo *</FieldLabel>
                  <Input
                    {...field}
                    id="name"
                    required
                    placeholder="Digite o seu nome"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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

          <div className="mt-6 w-full">
            <Button
              type="submit"
              variant="default"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              Cadastrar
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link href="/login" className="font-medium text-accent hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
