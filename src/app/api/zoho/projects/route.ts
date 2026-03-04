import { ZohoClient, ZohoApiError } from '@/lib/zohoClient';
import { fetchWithCache, CACHE_TTL_MS } from '@/lib/serverCache';
import { NextRequest, NextResponse } from 'next/server';

function parseRetryAfter(message?: string): number | undefined {
  if (!message) return undefined;
  const minuteMatch = message.match(/after\s*(\d+)\s*minutes?/i);
  if (minuteMatch) return Number(minuteMatch[1]) * 60;
  const secondMatch = message.match(/after\s*(\d+)\s*seconds?/i);
  if (secondMatch) return Number(secondMatch[1]);
  return undefined;
}

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.ZOHO_CLIENT_ID;
    const clientSecret = process.env.ZOHO_CLIENT_SECRET;

    const accessToken = request.headers.get('x-zoho-access-token') || process.env.ZOHO_ACCESS_TOKEN;
    const portalName = request.headers.get('x-zoho-portal-id');
    const refreshCache = request.nextUrl.searchParams.get('refreshCache') === 'true';

    console.log('🔧 API Route Debug:');
    console.log('- ZOHO_CLIENT_ID:', clientId ? '✓ Set' : '✗ Not set');
    console.log('- ZOHO_CLIENT_SECRET:', clientSecret ? '✓ Set' : '✗ Not set');
    console.log('- Portal ID (header):', portalName || '✗ Not provided');
    console.log('- Access Token (header):', accessToken ? '✓ Provided' : '✗ Not provided');
    console.log('- Access Token (env):', process.env.ZOHO_ACCESS_TOKEN ? '✓ Set' : '✗ Not set');
    console.log('- refreshCache:', refreshCache ? 'forced' : 'cached');

    if (!portalName) {
      console.error('Missing Zoho portal ID configuration');
      return NextResponse.json(
        { error: 'Zoho portal ID configuration missing. Please set it in Settings.' },
        { status: 500 }
      );
    }

    if (!accessToken) {
      console.error('No access token available');
      return NextResponse.json(
        { error: 'No access token available. Please configure OAuth tokens in Settings.' },
        { status: 401 }
      );
    }

    const zohoClient = new ZohoClient({
      portalName,
      apiToken: accessToken,
      clientId,
      clientSecret,
    });

    const cacheKey = `projects:${portalName}`;
    const cacheResult = await fetchWithCache(cacheKey, () => zohoClient.getProjects(), {
      ttlMs: CACHE_TTL_MS,
      forceRefresh: refreshCache,
    });

    const headers = new Headers();
    headers.set('x-cache-status', cacheResult.fromCache ? 'HIT' : 'MISS');
    if (refreshCache) headers.set('x-cache-refresh', 'true');

    return NextResponse.json(
      { projects: cacheResult.value },
      { headers }
    );
  } catch (error) {
    console.error('Error fetching Zoho projects:', error);

    const isZohoApiError = error instanceof ZohoApiError;
    const isThrottle = isZohoApiError && error.message?.includes('URL_ROLLING_THROTTLES_LIMIT_EXCEEDED');
    const statusCode = isThrottle
      ? 429
      : isZohoApiError
        ? error.statusCode
        : 500;
    const headers = new Headers();
    headers.set('x-cache-status', 'ERROR');

    if (isThrottle) {
      const retryAfter = parseRetryAfter(error.message);
      if (retryAfter) {
        headers.set('Retry-After', String(retryAfter));
      }
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: 'Failed to fetch projects', details: errorMessage },
      { status: statusCode, headers }
    );
  }
}
