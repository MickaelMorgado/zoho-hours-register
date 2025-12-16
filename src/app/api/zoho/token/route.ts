import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, grant_type, client_id, client_secret, redirect_uri } = body;

    if (!code || grant_type !== 'authorization_code') {
      return NextResponse.json(
        { error: 'Invalid request. Code and grant_type=authorization_code required' },
        { status: 400 }
      );
    }

    // Use client credentials from request body, or fall back to environment variables
    const clientId = client_id || process.env.ZOHO_CLIENT_ID;
    const clientSecret = client_secret || process.env.ZOHO_CLIENT_SECRET;
    const redirectUri = redirect_uri || process.env.ZOHO_REDIRECT_URI || 'http://localhost:3000';

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Zoho client credentials not provided. Configure them in Settings or environment variables.' },
        { status: 400 }
      );
    }

    // Exchange authorization code for access/refresh tokens
    const tokenUrl = 'https://accounts.zoho.com/oauth/v2/token';

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code: code,
    });

    console.log('🔑 Exchanging authorization code for tokens...');

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await response.json();

    console.log('🔍 Zoho token exchange response:', JSON.stringify(data, null, 2));

    if (!response.ok || data.error) {
      console.error('Token exchange failed:', data);
      return NextResponse.json(
        {
          error: data.error || 'Failed to exchange authorization code',
          details: data
        },
        { status: response.status || 400 }
      );
    }

    console.log('✅ Successfully exchanged authorization code for tokens');

    return NextResponse.json({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      token_type: data.token_type || 'Bearer',
    });

  } catch (error) {
    console.error('Error exchanging authorization code:', error);
    return NextResponse.json(
      { error: 'Failed to exchange authorization code', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.ZOHO_CLIENT_ID;
    const clientSecret = process.env.ZOHO_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Zoho client credentials not configured' },
        { status: 500 }
      );
    }

    // For server-to-server OAuth2, try client_credentials grant
    const tokenUrl = 'https://accounts.zoho.com/oauth/v2/token';

    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'ZohoProjects.portals.all,ZohoProjects.projects.all,ZohoProjects.tasks.all,ZohoProjects.timesheets.all',
    });

    console.log('🔑 Requesting Zoho access token...');

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await response.json();

    console.log('🔍 Zoho token response:', JSON.stringify(data, null, 2));

    // Zoho sometimes returns 200 with error in body
    if (!response.ok || data.error) {
      console.error('Token request failed:', data);
      return NextResponse.json(
        {
          error: 'Failed to get access token',
          details: data
        },
        { status: response.status || 400 }
      );
    }

    console.log('✅ Got access token from Zoho');
    console.log('🔑 Access Token:', data.access_token?.substring(0, 20) + '...');

    return NextResponse.json({
      success: true,
      access_token: data.access_token,
      expires_in: data.expires_in,
      token_type: data.token_type,
      message: 'Copy this access_token to your .env.local file as ZOHO_ACCESS_TOKEN',
      full_response: data, // Include full response for debugging
    });

  } catch (error) {
    console.error('Error getting Zoho token:', error);
    return NextResponse.json(
      { error: 'Failed to get access token', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
