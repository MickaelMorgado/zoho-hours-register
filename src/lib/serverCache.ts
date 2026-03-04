type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

interface CacheOptions {
  ttlMs?: number;
  forceRefresh?: boolean;
}

interface CacheResult<T> {
  value: T;
  fromCache: boolean;
}

const cache = new Map<string, CacheEntry<any>>();
const pendingFetches = new Map<string, Promise<CacheResult<any>>>();

const DEFAULT_TTL_SECONDS = Number(process.env.ZOHO_CACHE_TTL_SECONDS ?? process.env.ZOHO_CACHE_TTL ?? 300);
const DEFAULT_TTL_MS = Number.isFinite(DEFAULT_TTL_SECONDS) && DEFAULT_TTL_SECONDS > 0
  ? DEFAULT_TTL_SECONDS * 1000
  : 300_000;

export async function fetchWithCache<T>(
  key: string,
  producer: () => Promise<T>,
  options: CacheOptions = {}
): Promise<CacheResult<T>> {
  const now = Date.now();
  const ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;

  if (!options.forceRefresh) {
    const hit = cache.get(key);
    if (hit && hit.expiresAt > now) {
      return { value: hit.value, fromCache: true };
    }
  }

  const pending = pendingFetches.get(key);
  if (pending) {
    return pending;
  }

  const promise = (async (): Promise<CacheResult<T>> => {
    const value = await producer();
    cache.set(key, { value, expiresAt: Date.now() + ttlMs });
    return { value, fromCache: false };
  })();

  pendingFetches.set(key, promise);
  try {
    return await promise;
  } finally {
    pendingFetches.delete(key);
  }
}

export function invalidateCache(key: string): void {
  cache.delete(key);
}

export const CACHE_TTL_MS = DEFAULT_TTL_MS;
