'use client';

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/context/ThemeContext";

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
  portalName: string;
  portalSlug: string;
  displayName: string;
}

export default function Settings() {
  const { theme, toggleTheme } = useTheme();

  // Lazy initializer — read credentials from localStorage synchronously on first render
  // so the save effect never fires with empty defaults.
  const [credentials, setCredentials] = useState<Credentials>(() => {
    const defaults: Credentials = {
      clientId: '',
      clientSecret: '',
      redirectUri: 'http://localhost:8080/callback',
      portalId: '632970450',
      portalName: 'dengun',
      portalSlug: 'dengun#zp',
      displayName: '',
    };

    if (typeof window === 'undefined') return defaults;

    try {
      const saved = localStorage.getItem('zoho_credentials');
      if (saved) {
        const creds = JSON.parse(saved);
        // Restore displayName from dedicated key if missing
        if (!creds.displayName) {
          const savedName = localStorage.getItem('zoho_display_name');
          if (savedName) creds.displayName = savedName;
        }
        return { ...defaults, ...creds };
      }
    } catch (e) {
      console.error('Error parsing saved credentials:', e);
    }

    // Even without saved credentials, restore displayName if available
    try {
      const savedName = localStorage.getItem('zoho_display_name');
      if (savedName) return { ...defaults, displayName: savedName };
    } catch { /* ignore */ }

    return defaults;
  });

  const [authCode, setAuthCode] = useState('');

  // Lazy initializer for tokens too
  const [tokens, setTokens] = useState<TokenResponse | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem('zoho_tokens');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing saved tokens:', e);
    }
    return null;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [portalIdSuccess, setPortalIdSuccess] = useState('');

  // Guard: skip the very first save-effect run (the lazy initializer already
  // wrote the correct state; we only want to persist subsequent user edits).
  const isInitializedRef = useRef(false);

  // Save credentials to localStorage whenever they change (after initialization)
  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      return;
    }
    localStorage.setItem('zoho_credentials', JSON.stringify(credentials));
    // Also persist displayName to dedicated key so it survives disconnect/credential resets
    if (credentials.displayName) {
      localStorage.setItem('zoho_display_name', credentials.displayName);
    }
  }, [credentials]);

  const handleExchangeTokens = async (codeOverride?: string) => {
    const code = codeOverride || authCode;

    if (!credentials.clientId.trim() || !credentials.clientSecret.trim()) {
      setError('Please enter both Client ID and Client Secret');
      return;
    }

    if (!code.trim()) {
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
          code: code.trim(),
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

  const handleRefreshToken = async () => {
    if (!tokens?.refresh_token) {
      setError('No refresh token available. Exchange an authorization code first.');
      return;
    }
    if (!credentials.clientId.trim() || !credentials.clientSecret.trim()) {
      setError('Client ID and Client Secret are required to refresh tokens.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/zoho/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          refresh_token: tokens.refresh_token,
          client_id: credentials.clientId.trim(),
          client_secret: credentials.clientSecret.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to refresh token');
      }

      // Update tokens — keep existing refresh_token, update access_token
      const updatedTokens = {
        ...tokens,
        access_token: data.access_token,
        expires_in: data.expires_in,
        token_type: data.token_type || tokens.token_type,
      };
      localStorage.setItem('zoho_tokens', JSON.stringify(updatedTokens));
      setTokens(updatedTokens);
      setSuccess('Access token refreshed successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh token');
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
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-900"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        <div className="space-y-6">
          {/* Appearance */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
            <h4 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
              Appearance
            </h4>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Switch between light and dark theme
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={theme === 'dark'}
                onClick={toggleTheme}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out ${
                    theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Zoho OAuth Configuration */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                Zoho OAuth Configuration
              </h4>
              <a
                href="https://api-console.zoho.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Zoho API Console
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>

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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
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
                onPaste={(e) => {
                  const pasted = e.clipboardData.getData('text').trim();
                  if (pasted) {
                    e.preventDefault();
                    setAuthCode(pasted);
                    if (credentials.clientId.trim() && credentials.clientSecret.trim()) {
                      handleExchangeTokens(pasted);
                    }
                  }
                }}
                placeholder="Paste your Zoho authorization code here"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Generate a code in the{' '}
                <a
                  href="https://api-console.zoho.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                >
                  Zoho API Console
                </a>
                {' '}using your Self Client
              </p>
            </div>

            <div className="flex gap-3 mb-6">
              <button
                onClick={() => handleExchangeTokens()}
                disabled={loading || !credentials.clientId.trim() || !credentials.clientSecret.trim() || !authCode.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Exchanging...' : 'Exchange for Tokens'}
              </button>

              {tokens && (
                <button
                  onClick={handleRefreshToken}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Refreshing...' : 'Refresh Access Token'}
                </button>
              )}

              {tokens && (
                <button
                  onClick={handleClearTokens}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
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
                  <p className="mt-1 text-green-600 dark:text-green-400 font-medium">
                    Auto-refresh is enabled — tokens will refresh automatically when they expire.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Zoho Portal Configuration */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
            <h4 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
              Zoho Portal Configuration
            </h4>

            {/* Display Name Input */}
            <div className="mb-4">
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Display Name
              </label>
              <input
                type="text"
                id="displayName"
                value={credentials.displayName}
                onChange={(e) => setCredentials(prev => ({ ...prev, displayName: e.target.value }))}
                placeholder="e.g. Mickael Bressane"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Your name as it appears in Zoho Projects (used to prioritize tasks assigned to you)
              </p>
            </div>

            {/* Portal Name Input */}
            <div className="mb-4">
              <label htmlFor="portalName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Portal Name
              </label>
              <input
                type="text"
                id="portalName"
                value={credentials.portalName}
                onChange={(e) => setCredentials(prev => ({ ...prev, portalName: e.target.value }))}
                placeholder="dengun"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Your Zoho Projects portal name
              </p>
            </div>

            {/* Portal URL Slug Input */}
            <div className="mb-4">
              <label htmlFor="portalSlug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Portal URL Slug
              </label>
              <input
                type="text"
                id="portalSlug"
                value={credentials.portalSlug}
                onChange={(e) => setCredentials(prev => ({ ...prev, portalSlug: e.target.value }))}
                placeholder="dengun#zp"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                The part after <code className="bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-1 rounded">projects.zoho.com/portal/</code> in your Zoho URLs (e.g. <code className="font-semibold dark:text-gray-300">dengun#zp</code>). Used to generate correct task links.
              </p>
            </div>

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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Your Zoho Projects portal ID (used for API calls)
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
            <div className="flex items-center gap-2">
              <code className="flex-1 block text-xs bg-blue-100 dark:bg-blue-800 dark:text-blue-200 p-2 rounded font-mono">
                ZohoProjects.portals.READ,ZohoProjects.tasks.ALL,ZohoProjects.bugs.READ
              </code>
              <button
                onClick={() => navigator.clipboard.writeText('ZohoProjects.portals.READ,ZohoProjects.tasks.ALL,ZohoProjects.bugs.READ')}
                className="shrink-0 p-2 text-blue-700 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-800 rounded transition-colors"
                title="Copy scopes to clipboard"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
