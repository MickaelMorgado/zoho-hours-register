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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    console.log('🔧 API Route Debug:');
    console.log('- Project ID:', projectId);

    const accessToken = request.headers.get('x-zoho-access-token');
    const portalId = request.headers.get('x-zoho-portal-id');
    const refreshCache = request.nextUrl.searchParams.get('refreshCache') === 'true';

    console.log('- ZOHO_PORTAL_NAME:', portalId);
    console.log('- Access Token (header):', accessToken ? '✓ Provided' : '✗ Missing');
    console.log('- refreshCache:', refreshCache ? 'forced' : 'cached');

    if (!portalId) {
      return NextResponse.json({ error: 'Missing Zoho portal name configuration' }, { status: 400 });
    }

    if (!accessToken) {
      return NextResponse.json({ error: 'Missing access token' }, { status: 401 });
    }

    const zohoClient = new ZohoClient({
      portalName: portalId,
      apiToken: accessToken,
      clientId: process.env.NEXT_PUBLIC_ZOHO_CLIENT_ID || '',
      clientSecret: process.env.NEXT_PUBLIC_ZOHO_CLIENT_SECRET || '',
    });

    const cacheKey = `tasks:${portalId}:${projectId}`;
    const cacheResult = await fetchWithCache(cacheKey, () => zohoClient.getTasks(projectId), {
      ttlMs: CACHE_TTL_MS,
      forceRefresh: refreshCache,
    });

    const headers = new Headers();
    headers.set('x-cache-status', cacheResult.fromCache ? 'HIT' : 'MISS');
    if (refreshCache) headers.set('x-cache-refresh', 'true');

    console.log('🌐 Fetching tasks for project ID:', projectId);
    console.log('✅ Fetched tasks:', cacheResult.value.length);

    return NextResponse.json({ tasks: cacheResult.value }, { headers });
  } catch (error) {
    const statusCode = error instanceof ZohoApiError ? error.statusCode : 500;
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tasks';
    const isThrottle = error instanceof ZohoApiError && error.message?.includes('URL_ROLLING_THROTTLES_LIMIT_EXCEEDED');
    const responseStatus = isThrottle ? 429 : statusCode;

    const headers = new Headers();
    headers.set('x-cache-status', 'ERROR');
    if (isThrottle) {
      const retryAfter = parseRetryAfter(errorMessage);
      if (retryAfter) headers.set('Retry-After', String(retryAfter));
    }

    console.error('❌ Error fetching tasks:', {
      statusCode: responseStatus,
      errorMessage,
      isZohoApiError: error instanceof ZohoApiError,
      fullError: error,
    });

    return NextResponse.json(
      { error: 'Failed to fetch tasks', details: errorMessage },
      { status: responseStatus, headers }
    );
  }
}
