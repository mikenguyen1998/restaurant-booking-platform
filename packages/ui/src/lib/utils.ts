import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Class name helper expected by shadcn/ui components.
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
