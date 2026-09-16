import { toast } from "sonner";

/**
 * Failure toasts never auto-dismiss (DESIGN.md §8): a write that did
 * not happen must not disappear on its own. `retry` adds the one-tap
 * recovery when the caller can offer one.
 *
 * Offline this stays silent: the mutation cache already reported "Tidak ada
 * koneksi. Perubahan belum tersimpan." and "Request failed: network error"
 * on top of it would be two toasts for one cause.
 */
export function toastError(message: string, retry?: () => void): void {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return;
  }

  toast.error(
    message,
    retry === undefined
      ? { duration: Infinity }
      : { duration: Infinity, action: { label: "Coba lagi", onClick: retry } },
  );
}
