import type { ConfigType } from '@template/config';

import type { mediaConfig } from './media-env.schema.ts';

export type MediaConfig = ConfigType<typeof mediaConfig>;
