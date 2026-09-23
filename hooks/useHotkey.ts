"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

/** True when a keystroke belongs to a text field or an open dialog, not the page. */
export function isEditableTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) ||
      target.closest("dialog") !== null)
  );
}

/**
 * Binds a single-key, page-level shortcut (e.g. "/", "n", "?"). Ignored while
 * typing, with modifier keys held, or while a modal is open.
 */
export function useHotkey(key: string, handler: () => void) {
  const handlerRef = useRef(handler);

  useLayoutEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== key || event.metaKey || event.ctrlKey || event.altKey) return;
      if (isEditableTarget(event.target) || document.querySelector("dialog[open]")) return;
      event.preventDefault();
      handlerRef.current();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [key]);
}
