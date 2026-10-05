import { Body, Container, Head, Hr, Html, Preview, Section, Text } from '@react-email/components';
import type { ReactNode } from 'react';

const styles = {
  body: {
    backgroundColor: '#f4f4f5',
    fontFamily: 'Inter, -apple-system, Segoe UI, Roboto, sans-serif',
    margin: 0,
    padding: '32px 0',
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    margin: '0 auto',
    maxWidth: '520px',
    padding: '40px',
  },
  brand: { color: '#18181b', fontSize: '18px', fontWeight: 700, margin: '0 0 24px' },
  divider: { borderColor: '#e4e4e7', margin: '32px 0 16px' },
  footer: { color: '#71717a', fontSize: '12px', lineHeight: '18px', margin: 0 },
} as const;

export interface EmailLayoutProps {
  lang: string;
  appName: string;
  preview: string;
  footer: string;
  children: ReactNode;
}

/** Shared frame of every email: brand, preview text, content, footer. */
export function EmailLayout({ lang, appName, preview, footer, children }: EmailLayoutProps) {
  return (
    <Html lang={lang}>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.brand}>{appName}</Text>
          <Section>{children}</Section>
          <Hr style={styles.divider} />
          <Text style={styles.footer}>{footer}</Text>
        </Container>
      </Body>
    </Html>
  );
}
