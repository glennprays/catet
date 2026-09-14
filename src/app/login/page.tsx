"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch, ApiError } from "@/lib/api/client";

type Step = "phone" | "code";

export default function LoginPage() {
  const router = useRouter();
  const expired = useSearchParams().get("expired") === "1";
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("+62");
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);

  async function requestOtp(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    try {
      await apiFetch("/auth/otp/request", { method: "POST", body: { phone } });
      setStep("code");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Gagal mengirim kode");
    } finally {
      setPending(false);
    }
  }

  async function verifyOtp(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    try {
      await apiFetch("/auth/otp/verify", { method: "POST", body: { phone, code } });
      router.replace("/");
    } catch (error) {
      setPending(false);
      toast.error(error instanceof ApiError ? error.message : "Kode salah atau kedaluwarsa");
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
            <div className="grid gap-1.5">
              <Label htmlFor="phone">Nomor WhatsApp</Label>
              <Input
                id="phone"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+6281234567890"
                required
              />
              <p className="text-xs text-muted-foreground">
                Kode login dikirim lewat WhatsApp ke nomor ini.
              </p>
            </div>
            <Button type="submit" disabled={pending || phone.trim().length < 8}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : "Kirim kode"}
            </Button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="mt-4 grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="code">Kode 6 digit</Label>
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
              <p className="text-xs text-muted-foreground">
                Cek log WhatsApp Anda. Kode berlaku 5 menit.
              </p>
            </div>
            <Button type="submit" disabled={pending || code.length !== 6}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : "Masuk"}
            </Button>
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-ink"
              onClick={() => {
                setCode("");
                setStep("phone");
              }}
            >
              Ganti nomor
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
