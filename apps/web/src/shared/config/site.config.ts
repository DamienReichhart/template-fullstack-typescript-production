import { publicEnv } from './public-env';

export const siteConfig = {
  name: 'Template',
  url: publicEnv.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, ''),
} as const;
