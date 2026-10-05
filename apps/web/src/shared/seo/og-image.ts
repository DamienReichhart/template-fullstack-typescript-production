/** The per-locale social card rendered by `app/[locale]/opengraph-image.tsx`. */
export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;

/** Relative to `metadataBase`; Next serves the route at this path. */
export const ogImagePath = (locale: string): string => `/${locale}/opengraph-image`;
