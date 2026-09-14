import { toast } from "sonner";

/**
 * Failure toasts never auto-dismiss (DESIGN.md §8): a write that did
 * not happen must not disappear on its own. `retry` adds the one-tap
 * recovery when the caller can offer one.
 */
export function toastError(message: string, retry?: () => void): void {
  toast.error(
    message,
    retry === undefined
      ? { duration: Infinity }
      : { duration: Infinity, action: { label: "Coba lagi", onClick: retry } },
  );
}
