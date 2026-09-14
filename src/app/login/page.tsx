"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch, ApiError } from "@/lib/api/client";

type Step = "phone" | "code";

const RESEND_SECONDS = 60;

/** `useSearchParams` needs a suspense boundary to stay prerenderable. */
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const expired = useSearchParams().get("expired") === "1";
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("+62");
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown === 0) {
      return;
    }
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function requestOtp(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await apiFetch("/auth/otp/request", { method: "POST", body: { phone } });
      setStep("code");
      setCooldown(RESEND_SECONDS);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Gagal mengirim kode");
    } finally {
      setPending(false);
    }
  }

  async function verifyOtp(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await apiFetch("/auth/otp/verify", { method: "POST", body: { phone, code } });
      router.replace("/");
    } catch (caught) {
      setPending(false);
      setError(caught instanceof ApiError ? caught.message : "Kode salah atau kedaluwarsa");
    }
  }

  async function resend() {
    setPending(true);
    setError(null);
    try {
      await apiFetch("/auth/otp/request", { method: "POST", body: { phone } });
      setCooldown(RESEND_SECONDS);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Gagal mengirim ulang kode");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="flex min-h-full flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-md border border-border bg-surface p-4">
        <h1 className="text-[26px] font-medium leading-[1.15] tracking-[-0.015em]">catet</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Masuk dengan nomor WhatsApp terdaftar.
        </p>

        {expired ? (
          <p role="status" className="mt-2 text-xs text-warn-text">
            Sesi kamu berakhir. Masuk lagi untuk melanjutkan.
          </p>
        ) : null}

        {step === "phone" ? (
          <form onSubmit={requestOtp} className="mt-4 grid gap-3">
            <FormField label="Nomor WhatsApp" htmlFor="phone" error={error ?? undefined}>
              <Input
                id="phone"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+6281234567890"
                aria-describedby={error === null ? undefined : "phone-error"}
                required
              />
            </FormField>
            <p className="text-xs text-muted-foreground">
              Kode login dikirim lewat WhatsApp ke nomor ini.
            </p>
            <Button type="submit" disabled={pending || phone.trim().length < 8}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : "Kirim kode"}
            </Button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="mt-4 grid gap-3">
            <FormField label="Kode 6 digit" htmlFor="code" error={error ?? undefined}>
              <Input
                id="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
                className="text-center text-lg tabular-nums tracking-[0.3em]"
                placeholder="••••••"
                aria-describedby={error === null ? undefined : "code-error"}
                autoFocus
                required
              />
            </FormField>
            <p className="text-xs text-muted-foreground">Kode berlaku 5 menit.</p>
            <Button type="submit" disabled={pending || code.length !== 6}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : "Masuk"}
            </Button>
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={pending || cooldown > 0}
                onClick={resend}
              >
                {cooldown > 0 ? `Kirim ulang (${cooldown})` : "Kirim ulang"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCode("");
                  setError(null);
                  setStep("phone");
                }}
              >
                Ganti nomor
              </Button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
