'use client';

import { cn } from '@template/ui/lib/cn';
import type { ComponentProps } from 'react';

import { Link, usePathname } from '@/i18n/navigation';

/** A locale-aware link that marks itself as the current page. */
export function NavLink({ className, href, ...props }: ComponentProps<typeof Link>) {
  const pathname = usePathname();
  const active = typeof href === 'string' && (pathname === href || pathname.startsWith(`${href}/`));
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
        active && 'text-foreground',
        className,
      )}
      {...props}
    />
  );
}
