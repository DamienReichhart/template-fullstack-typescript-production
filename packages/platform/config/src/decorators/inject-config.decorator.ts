import { Inject } from '@nestjs/common';

import type { ConfigDefinition } from '../loader/config-definition.ts';

/** `constructor(@InjectConfig(databaseConfig) config: ConfigType<typeof databaseConfig>)` */
export const InjectConfig = (
  definition: ConfigDefinition,
): ParameterDecorator & PropertyDecorator => Inject(definition.token);
