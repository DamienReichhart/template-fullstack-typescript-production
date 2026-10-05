import { Card, CardDescription, CardHeader, CardTitle } from '@template/ui/primitives/card';
import { Boxes, Globe, Lock, Timer } from 'lucide-react';
import { useTranslations } from 'next-intl';

const FEATURES = [
  { key: 'architecture', icon: Boxes },
  { key: 'jobs', icon: Timer },
  { key: 'security', icon: Lock },
  { key: 'i18n', icon: Globe },
] as const;

export function FeatureGrid() {
  const t = useTranslations('marketing.features');
  return (
    <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-24">
      <h2 className="text-center text-2xl font-semibold">{t('title')}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map(({ key, icon: Icon }) => (
          <Card key={key}>
            <CardHeader>
              <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
              <CardTitle>
                <h3>{t(`items.${key}.title`)}</h3>
              </CardTitle>
              <CardDescription>{t(`items.${key}.description`)}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
