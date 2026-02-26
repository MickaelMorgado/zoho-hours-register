'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const statusConfig = {
  loading: {
    dotColor: 'bg-gray-400 dark:bg-gray-500',
    borderColor: 'border-gray-300 dark:border-gray-600',
    bgColor: 'bg-gray-50 dark:bg-gray-800/50',
    textColor: 'text-gray-600 dark:text-gray-400',
    label: 'Checking...',
    pulse: true,
  },
  connected: {
    dotColor: 'bg-green-500 dark:bg-green-400',
    borderColor: 'border-green-300 dark:border-green-700',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    textColor: 'text-green-700 dark:text-green-300',
    label: 'Connected',
    pulse: false,
  },
  disconnected: {
    dotColor: 'bg-red-500 dark:bg-red-400',
    borderColor: 'border-red-300 dark:border-red-700',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    textColor: 'text-red-700 dark:text-red-300',
    label: 'Not Connected',
    pulse: false,
  },
  expired: {
    dotColor: 'bg-amber-500 dark:bg-amber-400',
    borderColor: 'border-amber-300 dark:border-amber-700',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    textColor: 'text-amber-700 dark:text-amber-300',
    label: 'Token Expired',
    pulse: false,
  },
} as const;

export function ConnectionStatus() {
  const { status, checking, recheck } = useAuth();

  const isLoading = status === 'loading' || checking;
  const configKey = isLoading ? 'loading' : status;
  const config = statusConfig[configKey];

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 ${config.bgColor} ${config.borderColor}`}
    >
      {/* Status dot */}
      <span className="relative flex h-2 w-2">
        {(config.pulse || isLoading) && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${config.dotColor}`}
          />
        )}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${config.dotColor}`}
        />
      </span>

      {/* Status text */}
      <span className={`text-xs font-medium ${config.textColor}`}>
        {isLoading ? 'Checking...' : config.label}
      </span>

      {/* Action button — only show when not loading */}
      {!isLoading && status === 'connected' && (
        <button
          type="button"
          onClick={() => recheck()}
          className="text-xs font-medium text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200 underline underline-offset-2"
        >
          Test
        </button>
      )}

      {!isLoading && status === 'disconnected' && (
        <Link
          href="/profile"
          className="text-xs font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 underline underline-offset-2"
        >
          Setup
        </Link>
      )}

      {!isLoading && status === 'expired' && (
        <button
          type="button"
          onClick={() => recheck()}
          className="text-xs font-medium text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200 underline underline-offset-2"
        >
          Refresh
        </button>
      )}
    </div>
  );
}
