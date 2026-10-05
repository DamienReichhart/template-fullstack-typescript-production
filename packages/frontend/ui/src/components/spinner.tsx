import { Loader2 } from 'lucide-react';
import type { ComponentProps } from 'react';

import { cn } from '../lib/cn.js';

export function Spinner({ className, ...props }: ComponentProps<'svg'>) {
  return (
    <Loader2
      role="status"
      aria-hidden="true"
      className={cn('size-4 animate-spin', className)}
      {...props}
    />
  );
}
