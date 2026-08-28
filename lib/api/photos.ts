// lib/api/photos.ts
import { fetchApi } from './client';

export async function getApprovedPhotos(page = 1, limit = 24) {
  return fetchApi<any[]>(`/photos?page=${page}&limit=${limit}`);
}

export async function getPhotoById(id: number, userId?: string, anonymousToken?: string) {
  const params = new URLSearchParams();
  if (userId) params.append('userId', userId);
  if (anonymousToken) params.append('anonymousToken', anonymousToken);

  const query = params.toString() ? `?${params.toString()}` : '';
  return fetchApi<any>(`/photos/${id}${query}`);
}