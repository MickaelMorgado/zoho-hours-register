'use client';

import Link from "next/link";
import { useEffect, useState } from "react";

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

interface Credentials {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  portalId: string;
}

export default function Settings() {
  const [credentials, setCredentials] = useState<Credentials>({ clientId: '', clientSecret: '', redirectUri: 'http://localhost:8080/callback', portalId: '632970450' });
  const [authCode, setAuthCode] = useState('');
  const [tokens, setTokens] = useState<TokenResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [portalIdSuccess, setPortalIdSuccess] = useState('');

  // Load saved data on component mount
  useEffect(() => {
    const savedTokens = localStorage.getItem('zoho_tokens');
    if (savedTokens) {
      try {
        setTokens(JSON.parse(savedTokens));
      } catch (e) {
        console.error('Error parsing saved tokens:', e);
      }
    }

    const savedCredentials = localStorage.getItem('zoho_credentials');
    if (savedCredentials) {
      try {
        const creds = JSON.parse(savedCredentials);
        setCredentials(prev => ({ ...prev, ...creds }));
      } catch (e) {
        console.error('Error parsing saved credentials:', e);
      }
    }
  }, []);

  // Save credentials to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('zoho_credentials', JSON.stringify(credentials));
  }, [credentials]);

  const handleExchangeTokens = async () => {
    if (!credentials.clientId.trim() || !credentials.clientSecret.trim()) {
      setError('Please enter both Client ID and Client Secret');
      return;
    }

    if (!authCode.trim()) {
      setError('Please enter an authorization code');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/zoho/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: authCode.trim(),
          grant_type: 'authorization_code',
          client_id: credentials.clientId.trim(),
          client_secret: credentials.clientSecret.trim(),
          redirect_uri: credentials.redirectUri.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to exchange tokens');
      }

      // Save tokens to localStorage
      localStorage.setItem('zoho_tokens', JSON.stringify(data));
      setTokens(data);
      setSuccess('Tokens exchanged successfully!');

      // Clear the auth code
      setAuthCode('');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClearTokens = () => {
    localStorage.removeItem('zoho_tokens');
    setTokens(null);
    setSuccess('Tokens cleared successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handlePortalIdChange = (value: string) => {
    setCredentials(prev => ({ ...prev, portalId: value }));
    setPortalIdSuccess('Portal ID updated successfully!');
    setTimeout(() => setPortalIdSuccess(''), 3000);
  };

  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="flex items-center justify-between mb-5 lg:mb-7">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Settings
          </h3>
          <Link
            href="/"
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        <div className="space-y-6">
          {/* Zoho OAuth Configuration */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
            <h4 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
              Zoho OAuth Configuration
            </h4>

            {success && (
              <div className="mb-4 rounded-md bg-green-50 p-4 dark:bg-green-900/20">
                <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
              </div>
            )}

            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {/* Client ID Input */}
            <div className="mb-4">
              <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Client ID
              </label>
              <input
                type="text"
                id="clientId"
                value={credentials.clientId}
                onChange={(e) => setCredentials(prev => ({ ...prev, clientId: e.target.value }))}
                placeholder="Your Zoho OAuth Client ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                From your Zoho OAuth application settings
              </p>
            </div>

            {/* Client Secret Input */}
            <div className="mb-4">
              <label htmlFor="clientSecret" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Client Secret
              </label>
              <input
                type="password"
                id="clientSecret"
                value={credentials.clientSecret}
                onChange={(e) => setCredentials(prev => ({ ...prev, clientSecret: e.target.value }))}
                placeholder="Your Zoho OAuth Client Secret"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Keep this secret and secure
              </p>
            </div>

            {/* Redirect URI Input */}
            <div className="mb-4">
              <label htmlFor="redirectUri" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Redirect URI
              </label>
              <input
                type="text"
                id="redirectUri"
                value={credentials.redirectUri}
                onChange={(e) => setCredentials(prev => ({ ...prev, redirectUri: e.target.value }))}
                placeholder="http://localhost:8080/callback"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Must match the redirect URI configured in your Zoho OAuth app
              </p>
            </div>

            {/* Authorization Code Input */}
            <div className="mb-4">
              <label htmlFor="authCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Authorization Code
              </label>
              <input
                type="text"
                id="authCode"
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                placeholder="Paste your Zoho authorization code here"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Get this code from Zoho OAuth authorization flow
              </p>
            </div>

            <div className="flex gap-3 mb-6">
              <button
                onClick={handleExchangeTokens}
                disabled={loading || !credentials.clientId.trim() || !credentials.clientSecret.trim() || !authCode.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Exchanging...' : 'Exchange for Tokens'}
              </button>

              {tokens && (
                <button
                  onClick={handleClearTokens}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Clear Tokens
                </button>
              )}
            </div>

            {/* Token Display */}
            {tokens && (
              <div className="space-y-4">
                <h5 className="text-md font-medium text-gray-900 dark:text-white">Your Tokens</h5>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Access Token
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={tokens.access_token}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-100 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(tokens.access_token)}
                      className="px-3 py-2 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-300 dark:bg-gray-500 dark:border-gray-400 dark:hover:bg-gray-400"
                      title="Copy to clipboard"
                    >
                      📋
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Refresh Token
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={tokens.refresh_token}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-100 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(tokens.refresh_token)}
                      className="px-3 py-2 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-300 dark:bg-gray-500 dark:border-gray-400 dark:hover:bg-gray-400"
                      title="Copy to clipboard"
                    >
                      📋
                    </button>
                  </div>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <p>Token Type: {tokens.token_type}</p>
                  <p>Expires In: {tokens.expires_in} seconds</p>
                  <p>Tokens are stored locally in your browser.</p>
                </div>
              </div>
            )}
          </div>

          {/* Zoho Portal Configuration */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
            <h4 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
              Zoho Portal Configuration
            </h4>

            {/* Portal ID Input */}
            <div className="mb-4">
              <label htmlFor="portalId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Portal ID
              </label>
              <input
                type="text"
                id="portalId"
                value={credentials.portalId}
                onChange={(e) => handlePortalIdChange(e.target.value)}
                placeholder="632970450"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Your Zoho Projects portal ID (only one portal supported for now)
              </p>

              {portalIdSuccess && (
                <div className="mt-2 rounded-md bg-green-50 p-2 dark:bg-green-900/20">
                  <p className="text-sm text-green-800 dark:text-green-200">{portalIdSuccess}</p>
                </div>
              )}
            </div>
          </div>

          {/* Required Scopes Information */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/20">
            <h4 className="mb-2 text-md font-medium text-blue-900 dark:text-blue-100">
              Required OAuth Scopes
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
              Make sure your Zoho OAuth app has these scopes enabled:
            </p>
            <code className="block text-xs bg-blue-100 dark:bg-blue-800 p-2 rounded font-mono">
              ZohoProjects.portals.READ,ZohoProjects.tasks.ALL,ZohoProjects.bugs.READ
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
