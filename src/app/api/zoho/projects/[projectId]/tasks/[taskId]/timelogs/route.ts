import { ZohoClient, ZohoApiError } from '@/lib/zohoClient';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; taskId: string }> }
) {
  try {
    const { projectId, taskId } = await params;

    console.log('🔧 Timelog API Route Debug:');
    console.log('- Project ID:', projectId);
    console.log('- Task ID:', taskId);

    // Get token and credentials from headers
    const accessToken = request.headers.get('x-zoho-access-token');
    const portalId = request.headers.get('x-zoho-portal-id');

    console.log('- ZOHO_PORTAL_NAME:', portalId);
    console.log('- Access Token (header):', accessToken ? '\u2713 Provided' : '\u2717 Missing');

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

    // Parse request body
    const body = await request.json();
    const { date, hours, minutes, notes, bill_status, start_time, end_time } = body;

    if (!date || hours === undefined || minutes === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: date, hours, minutes' },
        { status: 400 }
      );
    }

    // Create Zoho client
    const zohoClient = new ZohoClient({
      portalName: portalId,
      apiToken: accessToken,
      clientId: process.env.NEXT_PUBLIC_ZOHO_CLIENT_ID || '',
      clientSecret: process.env.NEXT_PUBLIC_ZOHO_CLIENT_SECRET || '',
    });

    // Create time log — pass IDs as strings to preserve precision for large Zoho IDs
    console.log('Creating time log for project:', projectId, 'task:', taskId);
    console.log('Payload:', { date, hours, minutes, notes, bill_status, start_time, end_time });
    const timeLog = await zohoClient.createTimeLog(
      projectId,
      taskId,
      { date, hours, minutes, notes, bill_status, start_time, end_time }
    );

    console.log('✅ Time log created successfully');

    return NextResponse.json({ timelog: timeLog });
  } catch (error) {
    console.error('Error creating time log:', error);

    const statusCode = error instanceof ZohoApiError ? error.statusCode : 500;
    const errorMessage = error instanceof Error ? error.message : 'Failed to create time log';

    return NextResponse.json(
      {
        error: 'Failed to create time log',
        details: errorMessage
      },
      { status: statusCode }
    );
  }
}
