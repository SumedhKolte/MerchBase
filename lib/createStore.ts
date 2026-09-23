/**
 * A minimal external store for `useSyncExternalStore`.
 *
 * State is loaded lazily from browser storage on first read and written back on
 * every update. Keeping browser-only state outside React lets components read it
 * without hydration mismatches (the server renders `getServerSnapshot`).
 */
export interface Store<T> {
  getSnapshot: () => T;
  subscribe: (listener: () => void) => () => void;
  setState: (next: T | ((prev: T) => T)) => void;
}

interface StoreOptions<T> {
  load: () => T;
  save: (state: T) => void;
}

export function createStore<T>({ load, save }: StoreOptions<T>): Store<T> {
  let state: T;
  let isLoaded = false;
  const listeners = new Set<() => void>();

  const getSnapshot = () => {
    if (!isLoaded) {
      state = load();
      isLoaded = true;
    }
    return state;
  };

  return {
    getSnapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setState(next) {
      state = next instanceof Function ? next(getSnapshot()) : next;
      save(state);
      listeners.forEach((listener) => listener());
    },
  };
}
