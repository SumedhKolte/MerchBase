"use client";

import { useCallback, useMemo, useState } from "react";

interface SelectionState {
  scope: string;
  ids: Set<number>;
}

/**
 * Tracks selected row ids for the current view. Selection is tied to a `scope`
 * (the serialized table state), so changing page, filter, or sort starts fresh
 * without a reset effect. Ids that disappear (e.g. deleted rows) drop out too.
 */
export function useRowSelection(scope: string, visibleIds: number[]) {
  const [state, setState] = useState<SelectionState>({ scope, ids: new Set() });

  const selectedIds = useMemo(() => {
    if (state.scope !== scope) return new Set<number>();
    return new Set(visibleIds.filter((id) => state.ids.has(id)));
  }, [state, scope, visibleIds]);

  const toggle = useCallback(
    (id: number) => {
      const next = new Set(selectedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setState({ scope, ids: next });
    },
    [selectedIds, scope],
  );

  const toggleAll = useCallback(() => {
    const allSelected = visibleIds.length > 0 && selectedIds.size === visibleIds.length;
    setState({ scope, ids: allSelected ? new Set() : new Set(visibleIds) });
  }, [selectedIds, visibleIds, scope]);

  const clear = useCallback(() => setState({ scope, ids: new Set() }), [scope]);

  return { selectedIds, toggle, toggleAll, clear };
}
