"use client";

/**
 * The admin site has no live connection to /hubs/live (no SignalR client here): the chat refreshes on a timer instead.
 * Same signature as the student site's useLiveChannel, so the shared chat components work unchanged.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useLiveChannel(_handlers: Record<string, (payload: never) => void>, _enabled = true): boolean {
  return false;
}
