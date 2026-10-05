import { Heading, Text } from '@react-email/components';
import type { ReactNode } from 'react';

export function EmailHeading({ children }: { children: ReactNode }) {
  return (
    <Heading style={{ color: '#18181b', fontSize: '22px', margin: '0 0 16px' }}>{children}</Heading>
  );
}

export function EmailParagraph({
  children,
  muted = false,
}: {
  children: ReactNode;
  muted?: boolean;
}) {
  return (
    <Text
      style={{
        color: muted ? '#71717a' : '#3f3f46',
        fontSize: '14px',
        lineHeight: '22px',
        margin: '0 0 16px',
      }}
    >
      {children}
    </Text>
  );
}
