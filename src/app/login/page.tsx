"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Brand } from "@/components/brand";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch, ApiError } from "@/lib/api/client";
import { useIsStandalone } from "@/lib/use-media-query";

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
  const standalone = useIsStandalone();
  const [phone, setPhone] = useState("+62");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await apiFetch("/auth/login", { method: "POST", body: { phone, password } });
      router.replace("/");
    } catch (caught) {
      setPending(false);
      setError(caught instanceof ApiError ? caught.message : "Gagal masuk");
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
          Masuk dengan nomor WhatsApp dan kata sandi kamu.
        </p>

        {standalone ? (
          <p className="mt-1 text-meta text-ash">
            Masuk sekali lagi di aplikasi — sesi browser tidak dibagikan ke aplikasi terpasang.
          </p>
        ) : null}

        {expired ? (
          <p role="status" className="mt-2 text-meta text-warn-text">
            Sesi kamu berakhir. Masuk lagi untuk melanjutkan.
          </p>
        ) : null}

        <form onSubmit={login} className="mt-4 grid gap-3">
          <FormField label="Nomor WhatsApp" htmlFor="phone">
            <Input
              id="phone"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+6281234567890"
              required
            />
          </FormField>
          <FormField label="Kata sandi" htmlFor="password" error={error ?? undefined}>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-describedby={error === null ? undefined : "password-error"}
              required
            />
          </FormField>
          <Button
            type="submit"
            disabled={pending || phone.trim().length < 8 || password.length === 0}
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : "Masuk"}
          </Button>
        </form>

        <p className="mt-3">
          <Link
            href="/reset"
            className="inline-flex min-h-11 items-center text-body font-medium text-primary hover:underline sm:min-h-0 focus-visible:ring-[4px] focus-visible:ring-primary/10 focus-visible:outline-none"
          >
            Lupa kata sandi?
          </Link>
        </p>
      </div>
    </main>
  );
}
