import { ZohoClient } from '@/lib/zohoClient';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;

    console.log('🔧 API Route Debug:');
    console.log('- Project ID:', projectId);

    // Get token and credentials from headers
    const accessToken = request.headers.get('x-zoho-access-token');
    const portalId = request.headers.get('x-zoho-portal-id');

    console.log('- ZOHO_PORTAL_NAME:', portalId);
    console.log('- Access Token (header):', accessToken ? '✓ Provided' : '✗ Missing');

    if (!portalId) {
      return NextResponse.json(
        { error: 'Missing Zoho portal name configuration' },
        { status: 400 }
      );
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Missing access token' },
        { status: 401 }
      );
    }

    // Create Zoho client
    const zohoClient = new ZohoClient({
      portalName: portalId,
      apiToken: accessToken,
      clientId: process.env.NEXT_PUBLIC_ZOHO_CLIENT_ID || '',
      clientSecret: process.env.NEXT_PUBLIC_ZOHO_CLIENT_SECRET || '',
    });

    // Fetch project details
    console.log('🌐 Fetching project details for ID:', projectId);
    const projectData = await zohoClient.getProject(parseInt(projectId));

    console.log('✅ Fetched project:', projectData?.name || 'Unknown');

    return NextResponse.json({
      project: projectData,
    });
  } catch (error) {
    console.error('❌ Error fetching project:', error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch project';

    // Check if this is an OAuth token error
    const isOAuthError = errorMessage.toLowerCase().includes('invalid') &&
                        (errorMessage.toLowerCase().includes('oauth') ||
                         errorMessage.toLowerCase().includes('token') ||
                         errorMessage.toLowerCase().includes('access'));

    return NextResponse.json(
      {
        error: 'Failed to fetch project',
        details: errorMessage
      },
      { status: isOAuthError ? 401 : 500 }
    );
  }
}
