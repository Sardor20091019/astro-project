import { fetchApi } from './client';

export interface GetPhotosOptions {
  cursor?: string | null;
  seed?: number | null;
  limit?: number;
  category?: string;
  page?: number;
}

export interface PaginatedPhotosResponse {
  photos: any[];
  nextCursor: string | null;
  seed: number;
}

export async function getApprovedPhotos(
  options?: GetPhotosOptions | number,
  limit = 24,
): Promise<PaginatedPhotosResponse> {
  if (typeof options === 'number') {
    const res = await fetchApi<any>(`/photos?page=${options}&limit=${limit}`);
    if (Array.isArray(res)) {
      return { photos: res, nextCursor: null, seed: 0 };
    }
    return res;
  }

  const params = new URLSearchParams();
  if (options?.cursor) params.append('cursor', options.cursor);
  if (options?.seed !== undefined && options?.seed !== null) {
    params.append('seed', String(options.seed));
  }
  if (options?.limit) params.append('limit', String(options.limit));
  if (options?.category) params.append('category', options.category);
  if (options?.page) params.append('page', String(options.page));

  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetchApi<any>(`/photos${query}`);
  if (Array.isArray(res)) {
    return { photos: res, nextCursor: null, seed: options?.seed ?? 0 };
  }
  return res;
}

export async function getPhotoById(
  id: number,
  userId?: string,
  anonymousToken?: string,
) {
  const params = new URLSearchParams();
  if (userId) params.append('userId', userId);
  if (anonymousToken) params.append('anonymousToken', anonymousToken);

  const query = params.toString() ? `?${params.toString()}` : '';
  return fetchApi<any>(`/photos/${id}${query}`);
}