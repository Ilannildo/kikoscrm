'use client';

import { Button, buttonVariants } from '@kikos/ui/components/button';
import { cn } from '@kikos/ui/lib/utils';
import Link from 'next/link';
import { useEffect } from 'react';

interface Props {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function GlobalError({ error, reset }: Props) {
	useEffect(() => {
		// Log the error to an error reporting service
		console.error(error.message);
	}, [error]);

	return (
		<div className="flex min-h-dvh flex-col items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-md text-center">
				<div className="mx-auto h-12 w-12 text-primary" />
				<h1 className="mt-4 font-bold text-3xl text-foreground tracking-tight sm:text-4xl">
					Oops 🙁!
				</h1>
				<p className="mt-4 text-stone-400">
					Lamentamos, mas ocorreu um erro inesperado. Tente novamente mais tarde ou entre em contato
					com o suporte se o problema persistir.
				</p>
				<div className="mt-6 flex flex-row items-center justify-between gap-4">
					<Link
						href="/"
						className={cn(buttonVariants({ variant: 'outline' }))}
						prefetch={false}
					>
						Ir para o início
					</Link>
					<Button onClick={reset}>Tentar novamente</Button>
				</div>
			</div>
		</div>
	);
}
