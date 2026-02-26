import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, grant_type, refresh_token, client_id, client_secret, redirect_uri } = body;

    // Use client credentials from request body, or fall back to environment variables
    const clientId = client_id || process.env.ZOHO_CLIENT_ID;
    const clientSecret = client_secret || process.env.ZOHO_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Zoho client credentials not provided. Configure them in Settings or environment variables.' },
        { status: 400 }
      );
    }

    const tokenUrl = 'https://accounts.zoho.com/oauth/v2/token';

    // Handle refresh_token grant
    if (grant_type === 'refresh_token') {
      if (!refresh_token) {
        return NextResponse.json(
          { error: 'refresh_token is required for grant_type=refresh_token' },
          { status: 400 }
        );
      }

      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refresh_token,
      });

      console.log('🔄 Refreshing access token...');

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        console.error('Token refresh failed:', data);
        return NextResponse.json(
          { error: data.error || 'Failed to refresh token', details: data },
          { status: response.status || 400 }
        );
      }

      console.log('✅ Access token refreshed successfully');

      return NextResponse.json({
        access_token: data.access_token,
        expires_in: data.expires_in,
        token_type: data.token_type || 'Bearer',
        // Zoho does NOT return a new refresh_token on refresh — the original stays valid
      });
    }

    // Handle authorization_code grant
    if (grant_type === 'authorization_code') {
      if (!code) {
        return NextResponse.json(
          { error: 'Authorization code is required for grant_type=authorization_code' },
          { status: 400 }
        );
      }

      const redirectUri = redirect_uri || process.env.ZOHO_REDIRECT_URI || 'http://localhost:3000';

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
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        console.error('Token exchange failed:', data);
        return NextResponse.json(
          { error: data.error || 'Failed to exchange authorization code', details: data },
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
    }

    return NextResponse.json(
      { error: 'Invalid grant_type. Use "authorization_code" or "refresh_token".' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error in token endpoint:', error);
    return NextResponse.json(
      { error: 'Token request failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


