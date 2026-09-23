import { Modal } from "@/components/ui/Modal";

const SHORTCUTS: Array<[keys: string, description: string]> = [
  ["/", "Focus search"],
  ["Esc", "Clear search · close dialogs"],
  ["N", "Add a new product"],
  ["?", "Show this help"],
];

export function ShortcutsDialog({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="Keyboard shortcuts" onClose={onClose}>
      <dl className="divide-y divide-line text-sm">
        {SHORTCUTS.map(([keys, description]) => (
          <div key={keys} className="flex items-center justify-between py-2.5">
            <dt className="text-fg-muted">{description}</dt>
            <dd>
              <kbd className="rounded-md border border-line-strong bg-surface-muted px-2 py-0.5 font-mono text-xs shadow-xs">
                {keys}
              </kbd>
            </dd>
          </div>
        ))}
      </dl>
    </Modal>
  );
}
