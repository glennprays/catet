"use client";

import { Inbox } from "lucide-react";
import { toast } from "sonner";

import { EmptyState, QueryErrorState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useHoldQueue, useResolveHold, type PendingAction } from "@/lib/api/hooks";

/** Hold Queue: parked tool calls awaiting named confirmation (ADR-0003). */
export default function HoldQueuePage() {
  const queue = useHoldQueue();
  const resolve = useResolveHold();

  const items = queue.data?.items ?? [];

  function resolveItem(item: PendingAction, action: "confirm" | "discard") {
    resolve.mutate(
      { id: item.id, action },
      {
        onSuccess: () =>
          toast.success(action === "confirm" ? "Dikonfirmasi" : "Dibuang"),
        onError: (error) => toast.error(error.message),
      },
    );
  }

  return (
    <>
      <PageHeader title="Hold Queue" />
      <div className="py-4">
        {queue.isPending ? (
          <div className="grid gap-2">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-24 w-full rounded-md" />
            ))}
          </div>
        ) : queue.isError ? (
          <QueryErrorState message="Hold queue gagal dimuat." onRetry={() => queue.refetch()} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Inbox}
            heading="Hold queue kosong"
            caption="Aksi bot yang menunggu konfirmasi muncul di sini."
          />
        ) : (
          <ul className="grid gap-2">
            {items.map((item) => (
              <li key={item.id} className="rounded-md border border-border bg-surface p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[15px] font-medium text-ink">{item.summary}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.kind} ·{" "}
                      {new Intl.DateTimeFormat("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(item.created_at))}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <Button
                      variant="ghost"
                      className="text-over-text hover:bg-over-wash"
                      disabled={resolve.isPending}
                      onClick={() => resolveItem(item, "discard")}
                    >
                      Buang
                    </Button>
                    <Button
                      disabled={resolve.isPending}
                      onClick={() => resolveItem(item, "confirm")}
                    >
                      Konfirmasi
                    </Button>
                  </div>
                </div>
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-muted-foreground hover:text-ink">
                    Parameter
                  </summary>
                  <pre className="mt-1 overflow-x-auto rounded-sm bg-surface-100 p-2 text-[11px] leading-relaxed text-ink-soft">
                    {JSON.stringify(item.params, null, 2)}
                  </pre>
                </details>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
