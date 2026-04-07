import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it } from 'vitest';

describe('superadmin unlock route', () => {
  const originalPin = process.env.SUPERADMIN_PIN;

  afterEach(() => {
    process.env.SUPERADMIN_PIN = originalPin;
  });

  it('returns 500 when SUPERADMIN_PIN is not configured', async () => {
    const { POST } = await import('./route');
    process.env.SUPERADMIN_PIN = '';

    const request = new NextRequest('http://localhost:9002/api/superadmin/unlock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: '123' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(500);
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it('returns 401 when PIN is invalid', async () => {
    const { POST } = await import('./route');
    process.env.SUPERADMIN_PIN = '123';

    const request = new NextRequest('http://localhost:9002/api/superadmin/unlock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: '999' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it('sets unlock cookie when PIN is valid', async () => {
    const { POST } = await import('./route');
    process.env.SUPERADMIN_PIN = '123';

    const request = new NextRequest('http://localhost:9002/api/superadmin/unlock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: '123' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(response.cookies.get('nq-superadmin-unlocked')?.value).toBe('1');
    expect(response.headers.get('cache-control')).toBe('no-store');
  });
});
