export async function queueOfflineAction(_action: unknown) {
  // TODO(offline): persist queue local y reintentar sync cuando haya red.
  return { queued: true };
}

export async function flushOfflineQueue() {
  // TODO(offline): sincronizar cola pendiente con backend /api/*.
  return { flushed: 0 };
}
