"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";

/**
 * Returns a stable, debounced version of `callback` plus a `cancel` escape hatch.
 * The latest `callback` is always the one invoked, so callers needn't memoize it.
 */
export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delayMs: number,
) {
  const callbackRef = useRef(callback);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return useMemo(
    () => ({
      run(...args: Args) {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => callbackRef.current(...args), delayMs);
      },
      cancel() {
        clearTimeout(timerRef.current);
      },
    }),
    [delayMs],
  );
}
