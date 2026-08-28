const API_URL = "https://astro-project-1213.onrender.com";

export async function fetchApi(endpoint: string, options?: RequestInit) {
  // Ensure endpoint starts with /api if it doesn't already
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullPath = cleanEndpoint.startsWith('/api') ? cleanEndpoint : `/api${cleanEndpoint}`;

  // On the client, you can use relative paths to leverage Vercel rewrites.
  // On the server, use the absolute Render URL with /api.
  const url = typeof window === 'undefined' 
    ? `${API_URL}${fullPath}` 
    : fullPath;

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}