const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL && process.env.NODE_ENV === 'production') {
  console.error("⚠️ NEXT_PUBLIC_API_URL is not defined in production environment variables!");
}

const BASE_URL = API_URL;

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    cache: 'no-store', // Forces a fresh fetch, avoiding 304 cache conflicts and empty bodies
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`API Error: ${res.statusText}`);
  }

  return res.json();
}