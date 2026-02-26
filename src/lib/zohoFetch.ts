// Zoho API fetch wrapper with automatic token refresh
// Intercepts 401 responses, refreshes the access token, and retries once.

interface ZohoTokens {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  token_type?: string;
}

interface ZohoCredentials {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  portalId: string;
  portalName: string;
  portalSlug: string;
}

// Prevent concurrent refresh requests — only one refresh at a time
let refreshPromise: Promise<string | null> | null = null;

/**
 * Read stored tokens and credentials from localStorage.
 */
function getStoredTokens(): ZohoTokens | null {
  try {
    const raw = localStorage.getItem('zoho_tokens');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getStoredCredentials(): ZohoCredentials | null {
  try {
    const raw = localStorage.getItem('zoho_credentials');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Persist updated tokens to localStorage (keeps existing refresh_token).
 */
function saveTokens(newAccessToken: string, existingTokens: ZohoTokens): void {
  const updated: ZohoTokens = {
    ...existingTokens,
    access_token: newAccessToken,
  };
  localStorage.setItem('zoho_tokens', JSON.stringify(updated));
}

/**
 * Call the server-side refresh endpoint.
 * Returns the new access_token, or null if refresh failed.
 */
async function refreshAccessToken(): Promise<string | null> {
  const tokens = getStoredTokens();
  const credentials = getStoredCredentials();

  if (!tokens?.refresh_token) {
    console.warn('No refresh_token available — cannot refresh.');
    return null;
  }

  if (!credentials?.clientId || !credentials?.clientSecret) {
    console.warn('No client credentials available — cannot refresh.');
    return null;
  }

  try {
    console.log('🔄 Refreshing Zoho access token...');

    const response = await fetch('/api/zoho/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: tokens.refresh_token,
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('Token refresh failed:', err);
      return null;
    }

    const data = await response.json();
    const newAccessToken = data.access_token;

    if (!newAccessToken) {
      console.error('Refresh response missing access_token:', data);
      return null;
    }

    // Persist the new access token
    saveTokens(newAccessToken, tokens);
    console.log('✅ Access token refreshed and saved.');

    // Dispatch a custom event so other components can react (e.g. update headers)
    window.dispatchEvent(new CustomEvent('zoho-token-refreshed', { detail: { access_token: newAccessToken } }));

    return newAccessToken;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
}

/**
 * Build the standard Zoho headers from localStorage.
 */
export function getZohoHeaders(): Record<string, string> {
  const tokens = getStoredTokens();
  const credentials = getStoredCredentials();
  const headers: Record<string, string> = {};

  if (tokens?.access_token) {
    headers['x-zoho-access-token'] = tokens.access_token;
  }
  if (credentials?.portalId) {
    headers['x-zoho-portal-id'] = credentials.portalId;
  }

  return headers;
}

/**
 * Fetch wrapper for Zoho API routes.
 * Automatically adds auth headers, detects 401, refreshes token, and retries once.
 */
export async function zohoFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = {
    ...getZohoHeaders(),
    ...(options.headers as Record<string, string> || {}),
  };

  // First attempt
  let response = await fetch(url, { ...options, headers });

  // If 401, try to refresh and retry once
  if (response.status === 401) {
    // Deduplicate concurrent refreshes
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }

    const newToken = await refreshPromise;

    if (newToken) {
      // Retry with the new token
      headers['x-zoho-access-token'] = newToken;
      response = await fetch(url, { ...options, headers });
    }
  }

  return response;
}

export default zohoFetch;
