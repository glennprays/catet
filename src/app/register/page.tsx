"use client";

import { Suspense, useEffect, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Brand } from "@/components/brand";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch, ApiError } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

type InviteInfo = components["schemas"]["InviteInfoEnvelope"]["data"];

const RESEND_SECONDS = 60;

/** `useSearchParams` needs a suspense boundary to stay prerenderable. */
export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const inviteToken = useSearchParams().get("invite") ?? "";
  const [invitePhone, setInvitePhone] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (inviteToken === "") {
      return;
    }
    const controller = new AbortController();
    apiFetch<InviteInfo>(`/auth/invites/${encodeURIComponent(inviteToken)}`, {
      signal: controller.signal,
    })
      .then((invite) => setInvitePhone(invite.phone))
      .catch(() => {
        if (!controller.signal.aborted) {
          setInviteError("Undangan tidak ditemukan atau sudah kedaluwarsa.");
        }
      });
    return () => controller.abort();
  }, [inviteToken]);

  useEffect(() => {
    if (cooldown === 0) {
      return;
    }
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const sendLabel = !codeSent
    ? "Kirim kode"
    : cooldown > 0
      ? `Kirim ulang (${cooldown})`
      : "Kirim ulang";

  async function sendCode() {
    setPending(true);
    setError(null);
    try {
      await apiFetch("/auth/otp/request", { method: "POST", body: { phone: invitePhone } });
      setCodeSent(true);
      setCooldown(RESEND_SECONDS);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Gagal mengirim kode");
    } finally {
      setPending(false);
    }
  }

  async function register(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: {
          invite_token: inviteToken,
          code,
          display_name: displayName.trim(),
          password,
        },
      });
      router.replace("/");
    } catch (caught) {
      setPending(false);
      setError(caught instanceof ApiError ? caught.message : "Gagal mendaftar");
    }
  }

  if (inviteToken === "") {
    return (
      <AuthCard>
        <p className="mt-1 text-body text-muted-foreground">
          Link undangan tidak lengkap. Minta undangan baru lewat WhatsApp.
        </p>
      </AuthCard>
    );
  }

  if (inviteError !== null) {
    return (
      <AuthCard>
        <p className="mt-1 text-body text-muted-foreground">{inviteError}</p>
      </AuthCard>
    );
  }

  if (invitePhone === null) {
    return (
      <AuthCard>
        <p className="mt-1 text-body text-muted-foreground">Memuat undangan…</p>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <p className="mt-1 text-body text-muted-foreground">
        Buat akun catet untuk nomor yang diundang.
      </p>

      <form onSubmit={register} className="mt-4 grid gap-3">
        <div className="grid gap-1.5">
          <p className="text-body leading-none font-medium">Nomor WhatsApp</p>
          <p className="text-body tabular-nums">{invitePhone}</p>
        </div>

        <Button
          type="button"
          variant={codeSent ? "ghost" : "default"}
          size={codeSent ? "sm" : "default"}
          disabled={pending || cooldown > 0}
          onClick={sendCode}
          className={codeSent ? "justify-self-start" : undefined}
        >
          {pending && !codeSent ? <Loader2 className="size-4 animate-spin" /> : sendLabel}
        </Button>

        {codeSent ? null : (
          <p className="text-meta text-muted-foreground">
            Kode verifikasi dikirim lewat WhatsApp ke nomor ini.
          </p>
        )}

        {!codeSent && error !== null ? (
          <p role="alert" className="text-meta text-over-text">
            {error}
          </p>
        ) : null}

        {codeSent ? (
          <>
            <FormField label="Kode 6 digit" htmlFor="code">
              <Input
                id="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
                className="text-center text-lg tabular-nums tracking-[0.3em]"
                placeholder="••••••"
                autoFocus
                required
              />
            </FormField>
            <FormField label="Nama" htmlFor="display-name">
              <Input
                id="display-name"
                autoComplete="name"
                maxLength={60}
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                required
              />
            </FormField>
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
                required
              />
            </FormField>
            <Button
              type="submit"
              disabled={
                pending ||
                code.length !== 6 ||
                displayName.trim().length === 0 ||
                password.length < 10
              }
            >
              {pending ? <Loader2 className="size-4 animate-spin" /> : "Daftar"}
            </Button>
          </>
        ) : null}
      </form>
    </AuthCard>
  );
}

function AuthCard({ children }: { children: ReactNode }) {
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
        {children}
      </div>
    </main>
  );
}
