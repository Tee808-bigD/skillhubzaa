/**
 * Surfaces the resolved API base URL at startup so a missing deployment
 * variable fails visibly instead of silently calling a relative /api/.
 */
export const validateFrontendEnv = (): string => {
  const configured =
    import.meta.env.VITE_API_BASE_URL ||
    (typeof window !== 'undefined' ? localStorage.getItem('skillhub_custom_api_url') : null) ||
    '';

  if (import.meta.env.DEV) {
    console.info('[env] API base URL:', configured || '/api/ (relative, proxied)');
  } else if (!configured) {
    console.error(
      '[env] VITE_API_BASE_URL is not set. The built app will call /api/ on its own origin. ' +
        'Set it in Netlify (Site settings → Environment variables) and redeploy, or set ' +
        'localStorage.skillhub_custom_api_url at runtime.'
    );
  }

  if (configured && !configured.endsWith('/')) {
    console.warn('[env] API base URL should end with a trailing slash:', configured);
  }

  return configured;
};
