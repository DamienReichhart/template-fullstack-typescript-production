import type { INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';

import { createOpenApiDocument, type OpenApiMetadata } from './create-openapi-document.ts';

export const DOCS_PATH = 'docs';

/** Serves the Swagger UI at `/docs` and the raw document at `/docs/json`. */
export function setupSwagger(app: INestApplication, metadata: OpenApiMetadata): void {
  SwaggerModule.setup(DOCS_PATH, app, () => createOpenApiDocument(app, metadata), {
    jsonDocumentUrl: `${DOCS_PATH}/json`,
    swaggerOptions: { withCredentials: true, persistAuthorization: true },
  });
}
