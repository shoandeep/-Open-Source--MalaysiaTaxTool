import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

/**
 * Undo-after-delete: every ✕ in the app deletes immediately (data stays
 * consistent and persisted) but stages a 5-second "Undo" snackbar that can
 * put the item back. One mis-tap should never silently destroy data.
 */

type Staged = { label: string; undo: () => void };

const UndoCtx = createContext<(label: string, undo: () => void) => void>(() => {});

/** Returns `stage(label, undo)` — call it right after applying a delete. */
export function useUndo() {
  return useContext(UndoCtx);
}

export function UndoProvider({ children }: { children: ReactNode }) {
  const [staged, setStaged] = useState<Staged | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const stage = useCallback((label: string, undo: () => void) => {
    window.clearTimeout(timer.current);
    setStaged({ label, undo });
    timer.current = window.setTimeout(() => setStaged(null), 5000);
  }, []);

  const onUndo = () => {
    window.clearTimeout(timer.current);
    staged?.undo();
    setStaged(null);
  };

  return (
    <UndoCtx.Provider value={stage}>
      {children}
      {staged && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-x-0 bottom-[4.75rem] z-40 flex justify-center px-4 lg:bottom-6"
        >
          <div className="flex items-center gap-3 rounded-full bg-ink px-4 py-2 text-sm text-bg shadow-lg">
            <span>{staged.label} deleted</span>
            <button
              onClick={onUndo}
              className="font-semibold text-gold underline-offset-2 hover:underline"
            >
              Undo
            </button>
          </div>
        </div>
      )}
    </UndoCtx.Provider>
  );
}
