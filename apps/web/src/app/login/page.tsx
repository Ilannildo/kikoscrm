"use client";
import { KikosLogo } from "@kikos/ui/components/kikos-logo";
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
import { useToast } from "@kikos/ui/components/toast";

export default function LoginPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const {toast} = useToast()

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
      toast({
        title: "Login",
        description: result.error.message ?? 'Verifique suas credenciais',
        variant: "error"
      })  

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
        <div className="flex flex-col items-center mb-8">
          <KikosLogo size="lg" />
<p className="text-sm text-muted-foreground mt-3">Entre na sua conta corporativa para continuar</p>
        </div>


        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 rounded-xl border border-border/60 bg-card p-6 shadow-sm">
<FieldGroup className="mt-10 mb-6 gap-6">
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
          <Link href="/register" className="font-medium text-accent-foreground hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
