'use client';

import { track } from '@vercel/analytics';

type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;

export function trackClientEvent(eventName: string, properties?: AnalyticsProperties) {
  if (typeof window === 'undefined') return;

  track(eventName, properties);
}
