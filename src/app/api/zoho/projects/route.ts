import { ZohoClient } from '@/lib/zohoClient';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get credentials from environment
    const clientId = process.env.ZOHO_CLIENT_ID;
    const clientSecret = process.env.ZOHO_CLIENT_SECRET;

    // Try to get access token from request headers first (for localStorage tokens)
    let accessToken = request.headers.get('x-zoho-access-token') || process.env.ZOHO_ACCESS_TOKEN;

    // Try to get portal ID from request headers first (for user settings)
    let portalName = request.headers.get('x-zoho-portal-id');

    // Debug logging
    console.log('🔧 API Route Debug:');
    console.log('- ZOHO_CLIENT_ID:', clientId ? '✓ Set' : '✗ Not set');
    console.log('- ZOHO_CLIENT_SECRET:', clientSecret ? '✓ Set' : '✗ Not set');
    console.log('- Portal ID (header):', portalName || '✗ Not provided');
    console.log('- Access Token (header):', accessToken ? '✓ Provided' : '✗ Not provided');
    console.log('- Access Token (env):', process.env.ZOHO_ACCESS_TOKEN ? '✓ Set' : '✗ Not set');

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

    const projects = await zohoClient.getProjects();

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching Zoho projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
