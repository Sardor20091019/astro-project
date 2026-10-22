const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const clientCache = new Map<string, CacheEntry<any>>();
const inFlightRequests = new Map<string, Promise<any>>();
const DEFAULT_TTL_MS = 30_000;

export interface FetchApiOptions extends RequestInit {
  ttlMs?: number;
  skipCache?: boolean;
}

export async function fetchApi<T = any>(
  endpoint: string,
  options?: FetchApiOptions
): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullPath = cleanEndpoint.startsWith('/api') ? cleanEndpoint : `/api${cleanEndpoint}`;

  const baseUrl = typeof window === 'undefined'
    ? (API_URL || 'http://localhost:4000')
    : (API_URL || '');
  const url = `${baseUrl}${fullPath}`;

  const method = (options?.method || 'GET').toUpperCase();
  const isGet = method === 'GET';
  const skipCache = options?.skipCache || options?.cache === 'no-store' || !isGet;
  const ttl = options?.ttlMs ?? DEFAULT_TTL_MS;

  if (typeof window !== 'undefined' && isGet && !skipCache) {
    const cached = clientCache.get(url);
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data as T;
    }

    if (inFlightRequests.has(url)) {
      return inFlightRequests.get(url) as Promise<T>;
    }
  }

  const executeFetch = async (): Promise<T> => {
    try {
      const fetchInit: RequestInit = {
        ...options,
        credentials: options?.credentials ?? 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      };

      if (typeof window === 'undefined' && isGet && !options?.next && !options?.cache) {
        (fetchInit as any).next = { revalidate: 60 };
      }

      const res = await fetch(url, fetchInit);

      if (!res.ok) {
        throw new Error(`API error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();

      if (typeof window !== 'undefined' && isGet && !skipCache) {
        clientCache.set(url, { data, timestamp: Date.now() });
      }

      return data;
    } finally {
      if (typeof window !== 'undefined') {
        inFlightRequests.delete(url);
      }
    }
  };

  if (typeof window !== 'undefined' && isGet && !skipCache) {
    const promise = executeFetch();
    inFlightRequests.set(url, promise);
    return promise;
  }

  return executeFetch();
}

export function clearApiCache(endpointPattern?: string) {
  if (typeof window === 'undefined') return;
  if (!endpointPattern) {
    clientCache.clear();
    return;
  }
  for (const key of clientCache.keys()) {
    if (key.includes(endpointPattern)) {
      clientCache.delete(key);
    }
  }
}