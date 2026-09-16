"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Brand } from "@/components/brand";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch, ApiError } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

type ResetToken = components["schemas"]["ResetTokenEnvelope"]["data"];

type Step = "phone" | "code" | "password";

const RESEND_SECONDS = 60;

/** `useSearchParams` needs a suspense boundary to stay prerenderable. */
export default function ResetPage() {
  return (
    <Suspense fallback={null}>
      <ResetForm />
    </Suspense>
  );
}

function ResetForm() {
  const router = useRouter();
  /** The operator CLI prints `/reset?token=…` when the WhatsApp gateway is down. */
  const linkToken = useSearchParams().get("token") ?? "";
  const [step, setStep] = useState<Step>(linkToken === "" ? "phone" : "password");
  const [resetToken, setResetToken] = useState(linkToken);
  const [phone, setPhone] = useState("+62");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
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

  async function requestCode(event: FormEvent) {
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

  async function verifyCode(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const verified = await apiFetch<ResetToken>("/auth/password/reset/verify", {
        method: "POST",
        body: { phone, code },
      });
      setResetToken(verified.reset_token);
      setStep("password");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Kode salah atau kedaluwarsa");
    } finally {
      setPending(false);
    }
  }

  async function savePassword(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await apiFetch("/auth/password/reset/complete", {
        method: "POST",
        body: { reset_token: resetToken, password },
      });
      router.replace("/");
    } catch (caught) {
      setPending(false);
      setError(caught instanceof ApiError ? caught.message : "Gagal menyimpan kata sandi");
    }
  }

  return (
    <main className="flex min-h-full flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-lg bg-surface p-5 shadow-card">
        <h1>
          <Link
            href="/"
            className="inline-flex rounded-md focus-visible:ring-[4px] focus-visible:ring-primary/10 focus-visible:outline-none"
          >
            <Brand size="login" />
          </Link>
        </h1>
        <p className="mt-1 text-body text-muted-foreground">
          {step === "password"
            ? "Buat kata sandi baru untuk akun kamu."
            : "Atur ulang kata sandi lewat kode WhatsApp."}
        </p>

        {step === "phone" ? (
          <form onSubmit={requestCode} className="mt-4 grid gap-3">
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
            <p className="text-meta text-muted-foreground">
              Kode dikirim lewat WhatsApp kalau nomor ini terdaftar.
            </p>
            <Button type="submit" disabled={pending || phone.trim().length < 8}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : "Kirim kode"}
            </Button>
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center justify-self-start text-body font-medium text-primary hover:underline sm:min-h-0 focus-visible:ring-[4px] focus-visible:ring-primary/10 focus-visible:outline-none"
            >
              Kembali ke halaman masuk
            </Link>
          </form>
        ) : null}

        {step === "code" ? (
          <form onSubmit={verifyCode} className="mt-4 grid gap-3">
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
            <p className="text-meta text-muted-foreground">Kode berlaku 5 menit.</p>
            <Button type="submit" disabled={pending || code.length !== 6}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : "Lanjut"}
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
        ) : null}

        {step === "password" ? (
          <form onSubmit={savePassword} className="mt-4 grid gap-3">
            <FormField
              label="Kata sandi baru"
              htmlFor="password"
              hint="Minimal 10 karakter"
              error={error ?? undefined}
            >
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-describedby={error === null ? undefined : "password-error"}
                autoFocus
                required
              />
            </FormField>
            <Button type="submit" disabled={pending || password.length < 10}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : "Simpan"}
            </Button>
          </form>
        ) : null}
      </div>
    </main>
  );
}
