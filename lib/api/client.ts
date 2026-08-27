const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Hardcode your backend URL as a failsafe so it never drops to undefined
const BASE_URL = 'https://astro-project-1213.onrender.com';

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
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