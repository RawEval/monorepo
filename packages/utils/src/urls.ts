/**
 * App URL configuration for monorepo
 *
 * In production, each app runs on its own subdomain.
 * In development, apps run on different ports.
 *
 * Environment variables:
 * - NEXT_PUBLIC_BASE_DOMAIN: Base domain (default: 'raweval.com')
 * - NEXT_PUBLIC_LANDING_URL: Override landing URL
 * - NEXT_PUBLIC_CHAT_URL: Override chat URL
 * - NEXT_PUBLIC_EXPERTS_URL: Override experts URL
 * - NEXT_PUBLIC_ADMIN_URL: Override admin URL
 */

type AppName = 'landing' | 'chat' | 'experts' | 'admin';

interface AppUrls {
  landing: string;
  chat: string;
  experts: string;
  admin: string;
}

/**
 * Get the base URL for an app
 * Client-safe: NEXT_PUBLIC_ env vars are available in both server and client
 */
function getAppUrl(app: AppName): string {
  // Check for explicit URL override first
  const urlOverrides: Record<AppName, string | undefined> = {
    landing: process.env.NEXT_PUBLIC_LANDING_URL,
    chat: process.env.NEXT_PUBLIC_CHAT_URL,
    experts: process.env.NEXT_PUBLIC_EXPERTS_URL,
    admin: process.env.NEXT_PUBLIC_ADMIN_URL,
  };

  const override = urlOverrides[app];
  if (override) {
    return override;
  }

  const isProduction = process.env.NODE_ENV === 'production';

  // In production, use subdomains
  if (isProduction) {
    const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'raweval.com';
    const subdomainMap: Record<AppName, string> = {
      landing: 'www',
      chat: 'chat',
      experts: 'experts',
      admin: 'admin',
    };

    const subdomain = subdomainMap[app];
    return `https://${subdomain}.${baseDomain}`;
  }

  // In development, use localhost with ports
  const portMap: Record<AppName, number> = {
    landing: 3000,
    chat: 3001,
    experts: 3002,
    admin: 3003,
  };

  const port = portMap[app];
  const protocol = process.env.NEXT_PUBLIC_PROTOCOL || 'http';
  const host = process.env.NEXT_PUBLIC_HOST || 'localhost';

  return `${protocol}://${host}:${port}`;
}

/**
 * Get all app URLs
 */
export function getAppUrls(): AppUrls {
  return {
    landing: getAppUrl('landing'),
    chat: getAppUrl('chat'),
    experts: getAppUrl('experts'),
    admin: getAppUrl('admin'),
  };
}

/**
 * Get URL for a specific app
 */
export function getAppUrlFor(app: AppName): string {
  return getAppUrl(app);
}

/**
 * Get URL for a specific app with a path
 */
export function getAppPath(app: AppName, path: string = ''): string {
  const baseUrl = getAppUrl(app);
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Pre-configured app URLs for easy access
 */
export const appUrls = {
  landing: (path?: string) => getAppPath('landing', path),
  chat: (path?: string) => getAppPath('chat', path),
  experts: (path?: string) => getAppPath('experts', path),
  admin: (path?: string) => getAppPath('admin', path),
};
