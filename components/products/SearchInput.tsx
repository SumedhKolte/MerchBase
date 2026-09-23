"use client";

import { useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { inputClasses } from "@/components/ui/Field";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { useHotkey } from "@/hooks/useHotkey";
import { cn } from "@/lib/cn";

const DEBOUNCE_MS = 400;

interface SearchInputProps {
  /** The committed search term from the URL. */
  value: string;
  onSearch: (term: string) => void;
}

export function SearchInput({ value, onSearch }: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(value);
  // What we last sent to the URL, and the URL value we last saw. Together they
  // tell an external URL change (back button, category pick) apart from our own
  // debounced write landing — so in-progress typing is never overwritten.
  const [submitted, setSubmitted] = useState(value);
  const [seenValue, setSeenValue] = useState(value);

  if (value !== seenValue) {
    setSeenValue(value);
    if (value !== submitted) {
      setDraft(value);
      setSubmitted(value);
    }
  }

  const submit = (term: string) => {
    setSubmitted(term.trim());
    onSearch(term);
  };
  const debouncedSubmit = useDebouncedCallback(submit, DEBOUNCE_MS);

  const clear = () => {
    debouncedSubmit.cancel();
    setDraft("");
    submit("");
  };

  // "/" focuses search from anywhere on the page, like GitHub or Linear.
  useHotkey("/", () => inputRef.current?.focus());

  return (
    <div className="relative min-w-0 flex-1">
      <label htmlFor="product-search" className="sr-only">
        Search products
      </label>
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-subtle"
        aria-hidden
      />
      <input
        ref={inputRef}
        id="product-search"
        type="search"
        placeholder="Search products…"
        autoComplete="off"
        maxLength={100}
        value={draft}
        onChange={(event) => {
          setDraft(event.target.value);
          debouncedSubmit.run(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key !== "Escape") return;
          event.preventDefault();
          if (draft) clear();
          else inputRef.current?.blur();
        }}
        aria-keyshortcuts="/"
        className={cn(inputClasses(), "h-10 pr-10 pl-9 [&::-webkit-search-cancel-button]:hidden")}
      />
      {draft ? (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded text-fg-subtle hover:bg-surface-muted hover:text-fg focus-visible:outline-2 focus-visible:outline-accent"
        >
          <X className="size-4" aria-hidden />
        </button>
      ) : (
        <kbd className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded border border-line bg-surface-muted px-1.5 font-mono text-xs text-fg-subtle sm:block">
          /
        </kbd>
      )}
    </div>
  );
}
