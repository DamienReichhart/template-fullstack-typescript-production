import { Button } from '@react-email/components';
import type { ReactNode } from 'react';

const style = {
  backgroundColor: '#18181b',
  borderRadius: '8px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '14px',
  fontWeight: 600,
  padding: '12px 20px',
  textDecoration: 'none',
} as const;

export function EmailButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Button href={href} style={style}>
      {children}
    </Button>
  );
}
