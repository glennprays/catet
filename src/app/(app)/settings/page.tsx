"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch, ApiError } from "@/lib/api/client";
import { useSettings, useUpdateSettings } from "@/lib/api/hooks";

export default function SettingsPage() {
  const settings = useSettings();
  const update = useUpdateSettings();
  const router = useRouter();

  // Draft value: null means "still mirroring the server value".
  const [draftDays, setDraftDays] = useState<string | null>(null);
  const days =
    draftDays ?? (settings.data !== undefined ? String(settings.data.income_horizon_days) : "");

  function save() {
    const horizon = Number.parseInt(days, 10);
    if (Number.isNaN(horizon) || horizon < 1 || horizon > 90) {
      toast.error("Income horizon harus 1–90 hari");
      return;
    }
    update.mutate(
      { income_horizon_days: horizon },
      {
        onSuccess: () => toast.success("Pengaturan disimpan"),
        onError: (error) => toast.error(error.message),
      },
    );
  }

  async function logout() {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
      router.replace("/login");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Gagal logout");
    }
  }

  return (
    <>
      <PageHeader title="Settings" />
      <div className="grid gap-6 py-4 lg:grid-cols-2">
        <section className="rounded-md border border-border bg-surface p-4">
          <div className="grid gap-1.5">
            <Label htmlFor="horizon">Income horizon (hari)</Label>
            <Input
              id="horizon"
              inputMode="numeric"
              value={days}
              onChange={(event) => setDraftDays(event.target.value.replace(/\D/g, ""))}
              className="w-28 tabular-nums"
            />
            <p className="text-xs text-muted-foreground">
              Perkiraan jeda gaji berikutnya. Dipakai untuk jatah harian dan cakupan
              reservasi (1–90).
            </p>
          </div>
          <Button
            className="mt-3"
            onClick={save}
            disabled={update.isPending || settings.isPending}
          >
            Simpan
          </Button>
        </section>

        <section className="rounded-md border border-border bg-surface p-4">
          <Label>Nomor WhatsApp</Label>
          {settings.isPending ? (
            <Skeleton className="mt-1.5 h-5 w-36" />
          ) : (
            <p className="mt-1 text-[15px] tabular-nums text-ink-soft">
              {settings.data?.phone ?? "—"}
            </p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            Diatur lewat environment server, tidak bisa diubah di sini.
          </p>
        </section>

        <section className="lg:col-span-2 rounded-md border border-border bg-surface p-4">
          <Label>Sesi</Label>
          <div className="mt-1 flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">Keluar dari dashboard di perangkat ini.</p>
            <Button variant="secondary" onClick={logout}>
              <LogOut className="size-4" /> Logout
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
