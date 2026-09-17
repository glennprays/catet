"use client";

import { useState } from "react";
import Link from "next/link";
import { KeyRound, LogOut, Sparkles, Store, Users } from "lucide-react";
import { toast } from "sonner";

import { FormField } from "@/components/form-field";
import { InstallAppRow } from "@/components/install-app-row";
import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/panel";
import { clearShellCache } from "@/components/pwa-bridge";
import { QueryBoundary } from "@/components/query-boundary";
import { ResponsiveSheet } from "@/components/responsive-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiFetch, ApiError } from "@/lib/api/client";
import {
  useChangePassword,
  useLogoutAll,
  useMe,
  useSettings,
  useSources,
  useUpdateSettings,
} from "@/lib/api/hooks";
import { toastError } from "@/lib/toast";

/**
 * Radix Select has no value for "nothing selected", so the absence of a
 * receipt fallback Source travels as this sentinel and is mapped back to
 * null on save.
 */
const ASK_EVERY_TIME = "ask";

export default function SettingsPage() {
  const settings = useSettings();
  const sources = useSources();
  const update = useUpdateSettings();
  const me = useMe();
  const logoutAll = useLogoutAll();

  // Draft values: null means "still mirroring the server value".
  const [draftDays, setDraftDays] = useState<string | null>(null);
  const [draftPhotoSource, setDraftPhotoSource] = useState<string | null>(null);
  const [draftReminderHour, setDraftReminderHour] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const serverDays = settings.data === undefined ? "" : String(settings.data.income_horizon_days);
  const days = draftDays ?? serverDays;
  // "ask" is the absence of a default: the bot asks which Source paid.
  const serverPhotoSource = settings.data?.photo_default_source_id ?? ASK_EVERY_TIME;
  const photoSource = draftPhotoSource ?? serverPhotoSource;
  const serverReminderHour = settings.data === undefined ? "" : String(settings.data.reminder_hour);
  const reminderHour = draftReminderHour ?? serverReminderHour;
  const dirty =
    (draftDays !== null && draftDays !== serverDays) ||
    (draftPhotoSource !== null && draftPhotoSource !== serverPhotoSource) ||
    (draftReminderHour !== null && draftReminderHour !== serverReminderHour);

  function save() {
    const horizon = Number.parseInt(days, 10);
    if (Number.isNaN(horizon) || horizon < 1 || horizon > 90) {
      toastError("Income horizon harus 1–90 hari");
      return;
    }
    update.mutate(
      {
        income_horizon_days: horizon,
        photo_default_source_id: photoSource === ASK_EVERY_TIME ? null : photoSource,
        // Always sent: the PUT is a whole-form write, so omitting it
        // would leave the hour behind whenever another field changes.
        reminder_hour: reminderHour === "" ? undefined : Number.parseInt(reminderHour, 10),
      },
      {
        onSuccess: () => {
          toast.success("Pengaturan disimpan");
          setDraftDays(null);
          setDraftPhotoSource(null);
          setDraftReminderHour(null);
        },
        onError: (error) => toastError(error.message),
      },
    );
  }

  /**
   * Sign-out navigates with a full document load and drops the cached
   * shell: a soft push would leave the signed-in router cache (and the
   * worker's shell) alive behind the login screen.
   */
  function leaveForLogin() {
    clearShellCache();
    window.location.assign(new URL("/login", window.location.origin));
  }

  async function logout() {
    setLoggingOut(true);
    try {
      await apiFetch("/auth/logout", { method: "POST" });
      leaveForLogin();
    } catch (error) {
      setLoggingOut(false);
      toastError(error instanceof ApiError ? error.message : "Gagal logout");
    }
  }

  function logoutEverywhere() {
    logoutAll.mutate(undefined, {
      onSuccess: () => {
        toast.success("Semua sesi dicabut");
        leaveForLogin();
      },
      onError: (error) => toastError(error.message),
    });
  }

  return (
    <>
      <PageHeader title="Settings" />
      <div className="py-2.5">
        <Panel density="list" title="Settings">
          <div className="divide-y divide-border">
            <QueryBoundary
              query={settings}
              errorMessage="Pengaturan gagal dimuat."
              skeleton={<div className="catet-shimmer m-3 h-24 rounded-md" />}
              empty={null}
            >
              {() => (
                <>
                  <div className="grid gap-2 p-4 sm:grid-cols-[220px_minmax(0,1fr)]">
                    <div>
                      <h3 className="text-body font-medium text-ink">Income horizon</h3>
                      <p className="text-meta text-ash">
                        Perkiraan jeda gaji berikutnya. Dipakai untuk jatah harian dan cakupan
                        reservasi (1–90).
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        id="horizon"
                        inputMode="numeric"
                        aria-label="Income horizon (hari)"
                        value={days}
                        onChange={(event) => setDraftDays(event.target.value.replace(/\D/g, ""))}
                        className="w-24 tabular-nums"
                      />
                      <Button onClick={save} disabled={update.isPending || !dirty}>
                        Simpan
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-2 p-4 sm:grid-cols-[220px_minmax(0,1fr)]">
                    <div>
                      <h3 className="text-body font-medium text-ink">Sumber default struk</h3>
                      <p className="text-meta text-ash">
                        Dipakai kalau struk tidak menyebut cara bayar dan merchantnya belum pernah
                        kamu catat.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={photoSource}
                        disabled={update.isPending}
                        onValueChange={setDraftPhotoSource}
                      >
                        <SelectTrigger className="w-full sm:w-56" aria-label="Sumber default struk">
                          <SelectValue placeholder="Tanya setiap kali" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ASK_EVERY_TIME}>Tanya setiap kali</SelectItem>
                          {(sources.data?.sources ?? []).map((source) => (
                            <SelectItem key={source.id} value={source.id}>
                              {source.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-2 p-4 sm:grid-cols-[220px_minmax(0,1fr)]">
                    <div>
                      <h3 className="text-body font-medium text-ink">Jam pengingat WhatsApp</h3>
                      <p className="text-meta text-ash">
                        Satu pesan per hari untuk tagihan yang kamu centang pengingatnya. Isinya
                        cuma nama tagihan, tidak pernah nominal.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={reminderHour}
                        disabled={update.isPending}
                        onValueChange={setDraftReminderHour}
                      >
                        <SelectTrigger
                          className="w-full sm:w-32 tabular-nums"
                          aria-label="Jam pengingat WhatsApp"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, hour) => (
                            <SelectItem key={hour} value={String(hour)}>
                              {String(hour).padStart(2, "0")}:00
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button onClick={save} disabled={update.isPending || !dirty}>
                        Simpan
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </QueryBoundary>

            <QueryBoundary
              query={me}
              errorMessage="Akun gagal dimuat."
              skeleton={<div className="catet-shimmer m-3 h-20 rounded-md" />}
              empty={null}
            >
              {(account) => (
                <>
                  <div className="grid gap-2 p-4 sm:grid-cols-[220px_minmax(0,1fr)]">
                    <div>
                      <h3 className="text-body font-medium text-ink">Akun</h3>
                      <p className="text-meta text-ash">
                        Nomor ini yang dipakai buat masuk dan buat catat lewat WhatsApp.
                      </p>
                    </div>
                    <div>
                      <p className="text-body font-medium text-ink">{account.display_name}</p>
                      <p className="text-meta tabular-nums text-ash">{account.phone}</p>
                    </div>
                  </div>

                  <div className="grid gap-2 p-4 sm:grid-cols-[220px_minmax(0,1fr)]">
                    <div>
                      <h3 className="text-body font-medium text-ink">Kata sandi</h3>
                      <p className="text-meta text-ash">
                        Dipakai buat masuk ke dashboard. Minimal 10 karakter.
                      </p>
                    </div>
                    <div>
                      <Button variant="secondary" onClick={() => setPasswordOpen(true)}>
                        <KeyRound className="size-4" strokeWidth={1.75} /> Ubah kata sandi
                      </Button>
                    </div>
                  </div>

                  {account.is_admin ? (
                    <div className="grid gap-2 p-4 sm:grid-cols-[220px_minmax(0,1fr)]">
                      <div>
                        <h3 className="text-body font-medium text-ink">Pengguna</h3>
                        <p className="text-meta text-ash">Undang dan kelola akun</p>
                      </div>
                      <div>
                        <Button variant="secondary" asChild>
                          <Link href="/settings/users">
                            <Users className="size-4" strokeWidth={1.75} /> Kelola pengguna
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ) : null}

                  {account.is_admin ? (
                    <div className="grid gap-2 p-4 sm:grid-cols-[220px_minmax(0,1fr)]">
                      <div>
                        <h3 className="text-body font-medium text-ink">Penyedia AI</h3>
                        <p className="text-meta text-ash">Model, kunci API, dan alamat penyedia</p>
                      </div>
                      <div>
                        <Button variant="secondary" asChild>
                          <Link href="/settings/ai">
                            <Sparkles className="size-4" strokeWidth={1.75} /> Atur penyedia
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ) : null}

                  <div className="grid gap-2 p-4 sm:grid-cols-[220px_minmax(0,1fr)]">
                    <div>
                      <h3 className="text-body font-medium text-ink">Merchant</h3>
                      <p className="text-meta text-ash">
                        Nama kanonis yang dipakai bot dan dashboard — ubah nama atau gabungkan yang
                        kembar
                      </p>
                    </div>
                    <div>
                      <Button variant="secondary" asChild>
                        <Link href="/settings/merchants">
                          <Store className="size-4" strokeWidth={1.75} /> Kelola merchant
                        </Link>
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </QueryBoundary>

            <InstallAppRow />

            <div className="grid gap-2 p-4 sm:grid-cols-[220px_minmax(0,1fr)]">
              <div>
                <h3 className="text-body font-medium text-ink">Sesi</h3>
                <p className="text-meta text-ash">
                  Logout cuma menutup sesi di perangkat ini. Keluar dari semua perangkat mencabut
                  sesi di semua browser dan HP, termasuk yang ini.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="secondary" onClick={logout} disabled={loggingOut}>
                  <LogOut className="size-4" strokeWidth={1.75} />{" "}
                  {loggingOut ? "Keluar…" : "Logout"}
                </Button>
                <Button
                  variant="dangerGhost"
                  onClick={logoutEverywhere}
                  disabled={logoutAll.isPending}
                >
                  {logoutAll.isPending ? "Mencabut…" : "Keluar dari semua perangkat"}
                </Button>
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <ChangePasswordSheet open={passwordOpen} onOpenChange={setPasswordOpen} />
    </>
  );
}

function ChangePasswordSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const change = useChangePassword();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [repeat, setRepeat] = useState("");
  const [currentError, setCurrentError] = useState<string | undefined>(undefined);
  const [nextError, setNextError] = useState<string | undefined>(undefined);
  const [initializedFor, setInitializedFor] = useState("closed");

  const sessionKey = open ? "open" : "closed";
  if (initializedFor !== sessionKey) {
    setInitializedFor(sessionKey);
    setCurrent("");
    setNext("");
    setRepeat("");
    setCurrentError(undefined);
    setNextError(undefined);
  }

  function submit() {
    setCurrentError(undefined);
    setNextError(undefined);
    if (next !== repeat) {
      setNextError("Kata sandi baru tidak sama");
      return;
    }
    change.mutate(
      { current_password: current, new_password: next },
      {
        onSuccess: () => {
          // The epoch bump already killed this browser's cookie, so
          // staying here would only earn a 401 on the next request.
          toast.success("Kata sandi diubah, masuk lagi ya");
          clearShellCache();
          window.location.assign(new URL("/login", window.location.origin));
        },
        onError: (error) => {
          if (error instanceof ApiError) {
            const detail = error.details?.find((item) => item.field === "password");
            if (detail !== undefined) {
              setNextError(detail.message);
              return;
            }
            // No field detail: the backend rejected the current password.
            setCurrentError(error.message);
            return;
          }
          toastError(error.message);
        },
      },
    );
  }

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Ubah kata sandi"
      description="Setelah diubah, semua perangkat termasuk yang ini harus masuk lagi."
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            onClick={submit}
            disabled={change.isPending || current === "" || next === "" || repeat === ""}
          >
            Simpan
          </Button>
        </>
      }
    >
      <FormField label="Kata sandi saat ini" htmlFor="password-current" error={currentError}>
        <Input
          id="password-current"
          type="password"
          autoComplete="current-password"
          value={current}
          onChange={(event) => setCurrent(event.target.value)}
        />
      </FormField>

      <FormField
        label="Kata sandi baru"
        htmlFor="password-new"
        hint="Minimal 10 karakter"
        error={nextError}
      >
        <Input
          id="password-new"
          type="password"
          autoComplete="new-password"
          value={next}
          onChange={(event) => setNext(event.target.value)}
        />
      </FormField>

      <FormField label="Ulangi kata sandi baru" htmlFor="password-repeat">
        <Input
          id="password-repeat"
          type="password"
          autoComplete="new-password"
          value={repeat}
          onChange={(event) => setRepeat(event.target.value)}
        />
      </FormField>
    </ResponsiveSheet>
  );
}
