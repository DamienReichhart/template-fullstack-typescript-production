import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule, type OpenAPIObject } from '@nestjs/swagger';
import { AuthCookies } from '@template/contracts/common';
import { cleanupOpenApiDoc } from 'nestjs-zod';

export interface OpenApiMetadata {
  title: string;
  version: string;
  description?: string;
}

/** The OpenAPI document of the app, generated from its controllers and Zod DTOs. */
export function createOpenApiDocument(
  app: INestApplication,
  metadata: OpenApiMetadata,
): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle(metadata.title)
    .setVersion(metadata.version)
    .setDescription(metadata.description ?? '')
    .addCookieAuth(AuthCookies.accessToken)
    .build();
  return cleanupOpenApiDoc(SwaggerModule.createDocument(app, config));
}
