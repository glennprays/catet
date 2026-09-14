"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

import { FormField } from "@/components/form-field";
import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/panel";
import { QueryBoundary } from "@/components/query-boundary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch, ApiError } from "@/lib/api/client";
import { useSettings, useUpdateSettings } from "@/lib/api/hooks";
import { toastError } from "@/lib/toast";

export default function SettingsPage() {
  const settings = useSettings();
  const update = useUpdateSettings();
  const router = useRouter();

  // Draft value: null means "still mirroring the server value".
  const [draftDays, setDraftDays] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const serverDays = settings.data === undefined ? "" : String(settings.data.income_horizon_days);
  const days = draftDays ?? serverDays;
  const dirty = draftDays !== null && draftDays !== serverDays;

  function save() {
    const horizon = Number.parseInt(days, 10);
    if (Number.isNaN(horizon) || horizon < 1 || horizon > 90) {
      toastError("Income horizon harus 1–90 hari");
      return;
    }
    update.mutate(
      { income_horizon_days: horizon },
      {
        onSuccess: () => {
          toast.success("Pengaturan disimpan");
          setDraftDays(null);
        },
        onError: (error) => toastError(error.message),
      },
    );
  }

  async function logout() {
    setLoggingOut(true);
    try {
      await apiFetch("/auth/logout", { method: "POST" });
      router.replace("/login");
    } catch (error) {
      setLoggingOut(false);
      toastError(error instanceof ApiError ? error.message : "Gagal logout");
    }
  }

  return (
    <>
      <PageHeader title="Settings" />
      <div className="grid gap-4 py-4 lg:grid-cols-2">
        <QueryBoundary
          query={settings}
          errorMessage="Pengaturan gagal dimuat."
          skeleton={
            <>
              <Skeleton className="h-40 w-full rounded-md" />
              <Skeleton className="h-40 w-full rounded-md" />
            </>
          }
          empty={null}
        >
          {(data) => (
            <>
              <Panel density="comfortable" title="Income horizon">
                <FormField label="Hari" htmlFor="horizon">
                  <Input
                    id="horizon"
                    inputMode="numeric"
                    value={days}
                    onChange={(event) => setDraftDays(event.target.value.replace(/\D/g, ""))}
                    className="w-28 tabular-nums"
                  />
                </FormField>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Perkiraan jeda gaji berikutnya. Dipakai untuk jatah harian dan cakupan
                  reservasi (1–90).
                </p>
                <Button className="mt-3" onClick={save} disabled={update.isPending || !dirty}>
                  Simpan
                </Button>
              </Panel>

              <Panel density="comfortable" title="Nomor WhatsApp">
                <p className="text-[15px] tabular-nums text-ink-soft">{data.phone}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Diatur lewat environment server, tidak bisa diubah di sini.
                </p>
              </Panel>
            </>
          )}
        </QueryBoundary>

        <Panel density="comfortable" title="Sesi" className="lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Keluar dari dashboard di perangkat ini.
            </p>
            <Button variant="secondary" onClick={logout} disabled={loggingOut}>
              <LogOut className="size-4" strokeWidth={1.75} /> {loggingOut ? "Keluar…" : "Logout"}
            </Button>
          </div>
        </Panel>
      </div>
    </>
  );
}
