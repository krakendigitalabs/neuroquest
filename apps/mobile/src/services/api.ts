import type { AccessMeResponse } from '../types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:9002';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH';
  token?: string | null;
  body?: unknown;
};

async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
    headers['x-nq-id-token'] = options.token;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'request-failed');
    throw new Error(`${response.status}:${errorText}`);
  }

  return response.json() as Promise<T>;
}

export function createServerSession(token: string) {
  return apiRequest<{ ok: boolean }>('/api/auth/session', {
    method: 'POST',
    token,
    body: { token },
  });
}

export function clearServerSession(token?: string | null) {
  return apiRequest<{ ok: boolean }>('/api/auth/session', {
    method: 'DELETE',
    token: token ?? null,
  });
}

export function fetchAccessMe(token: string) {
  return apiRequest<AccessMeResponse>('/api/access/me', {
    method: 'GET',
    token,
  });
}
