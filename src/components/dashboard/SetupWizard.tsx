'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

const ZOHO_SCOPES =
  'ZohoProjects.portals.READ,ZohoProjects.projects.READ,ZohoProjects.tasks.ALL,ZohoProjects.timesheets.ALL';

const TOTAL_STEPS = 4;

const inputClassName =
  'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white';

const labelClassName =
  'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {Array.from({ length: total }, (_, i) => {
        const stepNum = i + 1;
        const isCompleted = stepNum < current;
        const isActive = stepNum === current;

        return (
          <div key={stepNum} className="flex items-center">
            {/* Step circle */}
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors ${
                isCompleted
                  ? 'bg-blue-600 text-white'
                  : isActive
                    ? 'border-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                    : 'bg-gray-200 text-gray-500 dark:bg-gray-600 dark:text-gray-400'
              }`}
            >
              {isCompleted ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                stepNum
              )}
            </div>

            {/* Connector line */}
            {stepNum < total && (
              <div
                className={`w-12 h-0.5 transition-colors ${
                  stepNum < current
                    ? 'bg-blue-600'
                    : 'bg-gray-200 dark:bg-gray-600'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Spinner
// ---------------------------------------------------------------------------

function Spinner({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function SetupWizard() {
  const auth = useAuth();

  // Step state
  const [step, setStep] = useState(1);

  // Form state -- pre-populate from context when available
  const [portalId, setPortalId] = useState(auth.credentials?.portalId ?? '');
  const [portalName, setPortalName] = useState(
    auth.credentials?.portalName ?? '',
  );
  const [portalSlug, setPortalSlug] = useState(
    auth.credentials?.portalSlug ?? '',
  );
  const [displayName, setDisplayName] = useState(
    auth.credentials?.displayName || (typeof window !== 'undefined' ? localStorage.getItem('zoho_display_name') : null) || '',
  );
  const [clientId, setClientId] = useState(auth.credentials?.clientId ?? '');
  const [clientSecret, setClientSecret] = useState(
    auth.credentials?.clientSecret ?? '',
  );
  const [redirectUri, setRedirectUri] = useState(
    auth.credentials?.redirectUri ?? 'http://localhost:8080/callback',
  );

  // Token exchange state
  const [authCode, setAuthCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Step navigation helpers
  // ---------------------------------------------------------------------------

  const goNext = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const goBack = () => {
    setLocalError(null);
    setStep((s) => Math.max(s - 1, 1));
  };

  // Persist credentials when leaving step 2
  const handleStep2Next = () => {
    auth.setCredentials({
      clientId: clientId.trim(),
      clientSecret: clientSecret.trim(),
      redirectUri: redirectUri.trim(),
      portalId: portalId.trim(),
      portalName: portalName.trim(),
      portalSlug: portalSlug.trim(),
      displayName: displayName.trim(),
    });
    goNext();
  };

  // ---------------------------------------------------------------------------
  // Token exchange (step 3)
  // ---------------------------------------------------------------------------

  const exchangeToken = async () => {
    setLoading(true);
    setLocalError(null);

    try {
      const response = await fetch('/api/zoho/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          code: authCode.trim(),
          client_id: clientId.trim(),
          client_secret: clientSecret.trim(),
          redirect_uri: redirectUri.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        setLocalError(
          data.error || 'Failed to exchange authorization code for tokens.',
        );
        return;
      }

      // Persist tokens through context (which writes to localStorage)
      auth.setTokens(data);
      goNext();
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : 'Network error during token exchange.',
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Connection test (step 4 -- auto-runs on mount)
  // ---------------------------------------------------------------------------

  const runConnectionTest = useCallback(() => {
    auth.recheck();
  }, [auth]);

  useEffect(() => {
    if (step === 4) {
      runConnectionTest();
    }
    // Only run when we enter step 4
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Derive test result for step 4
  const testPassed = step === 4 && !auth.checking && auth.status === 'connected';
  const testFailed =
    step === 4 && !auth.checking && auth.status !== 'connected';

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  const renderStep1 = () => (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Configure your Zoho Portal
      </h2>

      <div>
        <label htmlFor="portalId" className={labelClassName}>
          Portal ID
        </label>
        <input
          id="portalId"
          type="text"
          value={portalId}
          onChange={(e) => setPortalId(e.target.value)}
          placeholder="632970450"
          className={inputClassName}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Used for API calls. Find it in Zoho Projects &gt; Setup &gt; Portal Configuration.
        </p>
      </div>

      <div>
        <label htmlFor="portalName" className={labelClassName}>
          Portal Name
        </label>
        <input
          id="portalName"
          type="text"
          value={portalName}
          onChange={(e) => setPortalName(e.target.value)}
          placeholder="dengun"
          className={inputClassName}
        />
      </div>

      <div>
        <label htmlFor="portalSlug" className={labelClassName}>
          Portal URL Slug
        </label>
        <input
          id="portalSlug"
          type="text"
          value={portalSlug}
          onChange={(e) => setPortalSlug(e.target.value)}
          placeholder="dengun#zp"
          className={inputClassName}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          This is the part after <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">projects.zoho.com/portal/</code> in your Zoho Projects URL.
          Open any task in Zoho Projects and copy this value from the browser address bar.
        </p>
        <div className="mt-2 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <span className="font-medium">Example:</span> In the URL{' '}
            <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded break-all">
              https://projects.zoho.com/portal/<strong>dengun#zp</strong>/projects/...
            </code>
            {' '}the slug is <code className="font-semibold">dengun#zp</code>
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="displayName" className={labelClassName}>
          Your Display Name
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="e.g. Mickael Bressane"
          className={inputClassName}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Your name as it appears in Zoho Projects. Used to prioritize tasks assigned to you in matching.
        </p>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={!portalId.trim()}
          onClick={goNext}
          className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Enter your OAuth credentials
      </h2>

      <div>
        <label htmlFor="clientId" className={labelClassName}>
          Client ID
        </label>
        <input
          id="clientId"
          type="text"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className={inputClassName}
        />
      </div>

      <div>
        <label htmlFor="clientSecret" className={labelClassName}>
          Client Secret
        </label>
        <input
          id="clientSecret"
          type="password"
          value={clientSecret}
          onChange={(e) => setClientSecret(e.target.value)}
          className={inputClassName}
        />
      </div>

      <div>
        <label htmlFor="redirectUri" className={labelClassName}>
          Redirect URI
        </label>
        <input
          id="redirectUri"
          type="text"
          value={redirectUri}
          onChange={(e) => setRedirectUri(e.target.value)}
          className={inputClassName}
        />
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        Go to{' '}
        <a
          href="https://api-console.zoho.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
        >
          https://api-console.zoho.com/
        </a>{' '}
        to create a Self Client application.
      </p>

      <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4">
        <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
          Required scopes
        </p>
        <code className="block text-xs text-blue-700 dark:text-blue-400 break-all select-all">
          {ZOHO_SCOPES}
        </code>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={goBack}
          className="px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          disabled={!clientId.trim() || !clientSecret.trim()}
          onClick={handleStep2Next}
          className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Generate your authorization code
      </h2>

      <p className="text-sm text-gray-600 dark:text-gray-400">
        Open the{' '}
        <a
          href="https://api-console.zoho.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline inline-flex items-center gap-1"
        >
          Zoho API Console
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
        , use your Self Client to generate a code with the scopes below, then paste
        it here.
      </p>

      {/* Scopes read-only display */}
      <div>
        <label htmlFor="scopes" className={labelClassName}>
          Required Scopes (copy this)
        </label>
        <input
          id="scopes"
          type="text"
          readOnly
          value={ZOHO_SCOPES}
          onClick={(e) => (e.target as HTMLInputElement).select()}
          className={`${inputClassName} bg-gray-50 dark:bg-gray-800 cursor-text select-all`}
        />
      </div>

      {/* Authorization code */}
      <div>
        <label htmlFor="authCode" className={labelClassName}>
          Authorization Code
        </label>
        <input
          id="authCode"
          type="text"
          value={authCode}
          onChange={(e) => {
            setAuthCode(e.target.value);
            setLocalError(null);
          }}
          placeholder="1000.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy"
          className={`${inputClassName} text-base py-3`}
        />
      </div>

      {/* Error */}
      {localError && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
          <p className="text-sm text-red-700 dark:text-red-300">{localError}</p>
        </div>
      )}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={goBack}
          className="px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          disabled={!authCode.trim() || loading}
          onClick={exchangeToken}
          className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading && <Spinner className="w-4 h-4" />}
          {loading ? 'Exchanging...' : 'Exchange for Tokens'}
        </button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        {auth.checking
          ? 'Testing your connection...'
          : testPassed
            ? 'Connection successful'
            : 'Connection test failed'}
      </h2>

      {/* Loading state */}
      {auth.checking && (
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <Spinner className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Verifying your Zoho connection...
          </p>
        </div>
      )}

      {/* Success */}
      {testPassed && (
        <div className="rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-6 flex flex-col items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/40">
            <svg
              className="w-6 h-6 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="text-base font-medium text-green-800 dark:text-green-300">
            Connected successfully!
          </p>
          <button
            type="button"
            onClick={() => auth.recheck()}
            className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      )}

      {/* Failure */}
      {testFailed && (
        <>
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
            <p className="text-sm text-red-700 dark:text-red-300">
              {auth.error || 'Could not verify the connection. Please check your credentials and tokens.'}
            </p>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => auth.recheck()}
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </>
      )}
    </div>
  );

  // ---------------------------------------------------------------------------
  // Layout
  // ---------------------------------------------------------------------------

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
        <div className="p-8">
          <StepIndicator current={step} total={TOTAL_STEPS} />

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>
      </div>
    </div>
  );
}
