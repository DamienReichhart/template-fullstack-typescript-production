/** Locale-less paths of every page. Pass them to the locale-aware `Link` / `router`. */
export const AppRoutes = {
  home: '/',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  verifyEmail: '/verify-email',
  dashboard: '/dashboard',
} as const;

export type AppRoute = (typeof AppRoutes)[keyof typeof AppRoutes];

/** Require a session. */
const PROTECTED_ROUTES: readonly string[] = [AppRoutes.dashboard];
/** Pointless with a session (redirect to the dashboard). */
const GUEST_ONLY_ROUTES: readonly string[] = [
  AppRoutes.login,
  AppRoutes.register,
  AppRoutes.forgotPassword,
];

const matches = (routes: readonly string[], path: string) =>
  routes.some((route) => path === route || path.startsWith(`${route}/`));

export const isProtectedRoute = (path: string) => matches(PROTECTED_ROUTES, path);
export const isGuestOnlyRoute = (path: string) => matches(GUEST_ONLY_ROUTES, path);

/** Public pages listed in the sitemap. */
export const INDEXABLE_ROUTES: readonly AppRoute[] = [
  AppRoutes.home,
  AppRoutes.login,
  AppRoutes.register,
];
