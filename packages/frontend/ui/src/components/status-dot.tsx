import { cn } from '../lib/cn.ts';

const tones = {
  up: 'bg-success',
  down: 'bg-destructive',
  degraded: 'bg-warning',
  idle: 'bg-muted-foreground/40',
} as const;

export interface StatusDotProps {
  tone: keyof typeof tones;
  /** Accessible text, e.g. "Database: up". The dot itself conveys nothing to screen readers. */
  label: string;
  className?: string;
}

export function StatusDot({ tone, label, className }: StatusDotProps) {
  return (
    <span className={cn('inline-flex items-center', className)}>
      <span aria-hidden="true" className={cn('size-2.5 rounded-full', tones[tone])} />
      <span className="sr-only">{label}</span>
    </span>
  );
}
