import type * as React from 'react';
import { cn } from '../lib/utils';


function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn(
				'h-11 w-full min-w-0 rounded-xl border border-stone-200 bg-transparent px-3 py-2 text-base outline-none transition-[color,box-shadow] selection:bg-primary-500 selection:text-primary-50 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-sm file:text-stone-800 placeholder:text-stone-400 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
				'focus-visible:border-primary-500 focus-visible:ring-[3px] focus-visible:ring-primary-500/50',
				'aria-invalid:border-red-500 aria-invalid:ring-red-500/20',
				className,
			)}
			{...props}
		/>
	);
}

export { Input };
