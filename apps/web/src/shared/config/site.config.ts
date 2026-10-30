import { withoutTrailingSlashes } from '@template/contracts/common';

import { publicEnv } from './public-env';

export const siteConfig = {
  name: 'Template',
  url: withoutTrailingSlashes(publicEnv.NEXT_PUBLIC_SITE_URL),
} as const;
