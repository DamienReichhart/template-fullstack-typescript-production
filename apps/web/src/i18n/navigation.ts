import { createNavigation } from 'next-intl/navigation';

import { routing } from './routing';

/** Locale-aware replacements for `next/link` and `next/navigation`. Use these, never the originals. */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
