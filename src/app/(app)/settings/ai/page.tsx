"use client";

import { useState } from "react";
import { Check, Download, ShieldAlert, Wifi } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { FormField } from "@/components/form-field";
import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/panel";
import { QueryBoundary } from "@/components/query-boundary";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useLlmModels,
  useLlmProvider,
  useMe,
  useResetLlmProvider,
  useTestLlmProvider,
  useUpdateLlmProvider,
  type LlmProvider,
  type LlmProviderUpdate,
} from "@/lib/api/hooks";
import { toastError } from "@/lib/toast";

/** Row skeleton in the final geometry (DESIGN.md §4 truthfulness law). */
function FormSkeleton() {
  return (
    <Panel density="list">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="catet-shimmer m-2 h-9 rounded-md" />
      ))}
    </Panel>
  );
}

export default function AiProviderPage() {
  const me = useMe();

  return (
    <>
      <PageHeader title="Penyedia AI" />

      <div className="flex flex-col gap-2.5 py-2.5">
        <QueryBoundary
          query={me}
          errorMessage="Akun gagal dimuat."
          skeleton={<FormSkeleton />}
          empty={null}
        >
          {(account) =>
            account.is_admin ? (
              <ProviderPanel />
            ) : (
              <EmptyState
                icon={ShieldAlert}
                heading="Khusus admin"
                caption="Halaman ini hanya untuk admin."
              />
            )
          }
        </QueryBoundary>
      </div>
    </>
  );
}

/** "Tidak diisi" is the empty vision model: the main model reads photos. */
const SAME_AS_MODEL = "__same__";

function ProviderPanel() {
  const provider = useLlmProvider();

  return (
    <QueryBoundary
      query={provider}
      errorMessage="Konfigurasi AI gagal dimuat."
      skeleton={<FormSkeleton />}
      empty={null}
    >
      {(data) => <ProviderForm provider={data} />}
    </QueryBoundary>
  );
}

function ProviderForm({ provider }: { provider: LlmProvider }) {
  const update = useUpdateLlmProvider();
  const reset = useResetLlmProvider();
  const models = useLlmModels();
  const test = useTestLlmProvider();

  // Draft convention: null means "still mirroring the server value".
  const [draftBase, setDraftBase] = useState<string | null>(null);
  const [draftKey, setDraftKey] = useState("");
  const [clearKey, setClearKey] = useState(false);
  const [draftModel, setDraftModel] = useState<string | null>(null);
  const [draftVision, setDraftVision] = useState<string | null>(null);
  const [draftTimeout, setDraftTimeout] = useState<string | null>(null);
  const [draftVisionTimeout, setDraftVisionTimeout] = useState<string | null>(null);
  const [catalogue, setCatalogue] = useState<string[]>([]);
  const [manual, setManual] = useState(false);
  const [outcome, setOutcome] = useState<{ ok: boolean; text: string } | null>(null);
  const [resetOpen, setResetOpen] = useState(false);

  const base = draftBase ?? provider.base_url;
  const model = draftModel ?? provider.model;
  const vision = draftVision ?? provider.vision_model;
  const timeout = draftTimeout ?? String(provider.timeout_seconds);
  const visionTimeout = draftVisionTimeout ?? String(provider.vision_timeout_seconds);

  const dirty =
    (draftBase !== null && draftBase !== provider.base_url) ||
    (draftModel !== null && draftModel !== provider.model) ||
    (draftVision !== null && draftVision !== provider.vision_model) ||
    (draftTimeout !== null && draftTimeout !== String(provider.timeout_seconds)) ||
    (draftVisionTimeout !== null &&
      draftVisionTimeout !== String(provider.vision_timeout_seconds)) ||
    draftKey !== "" ||
    clearKey;

  /**
   * The key is tri-state on the wire: absent keeps the stored one, ""
   * clears it, anything else replaces it. An untouched field must
   * therefore send nothing at all.
   */
  function body(): LlmProviderUpdate | null {
    const seconds = Number.parseInt(timeout, 10);
    const visionSeconds = Number.parseInt(visionTimeout, 10);
    if (Number.isNaN(seconds) || seconds < 1 || seconds > 60) {
      toastError("Batas waktu harus 1–60 detik");
      return null;
    }
    if (Number.isNaN(visionSeconds) || visionSeconds < 1 || visionSeconds > 120) {
      toastError("Batas waktu foto harus 1–120 detik");
      return null;
    }
    if (base.trim() === "" || model.trim() === "") {
      toastError("Alamat API dan model wajib diisi");
      return null;
    }
    const payload: LlmProviderUpdate = {
      base_url: base.trim(),
      model: model.trim(),
      vision_model: vision.trim(),
      timeout_seconds: seconds,
      vision_timeout_seconds: visionSeconds,
    };
    if (clearKey) {
      payload.api_key = "";
    } else if (draftKey !== "") {
      payload.api_key = draftKey;
    }
    return payload;
  }

  function save() {
    const payload = body();
    if (payload === null) {
      return;
    }
    update.mutate(payload, {
      onSuccess: () => {
        toast.success("Penyedia AI disimpan");
        setDraftBase(null);
        setDraftKey("");
        setClearKey(false);
        setDraftModel(null);
        setDraftVision(null);
        setDraftTimeout(null);
        setDraftVisionTimeout(null);
      },
      onError: (error) => toastError(error.message),
    });
  }

  function loadModels() {
    setOutcome(null);
    models.mutate(
      { base_url: base.trim(), api_key: clearKey ? "" : draftKey === "" ? undefined : draftKey },
      {
        onSuccess: (data) => {
          setCatalogue(data.models);
          setManual(data.models.length === 0);
          if (data.models.length === 0) {
            toastError("Penyedia tidak mengembalikan model apa pun");
          }
        },
        onError: (error) => {
          setManual(true);
          toastError(error.message);
        },
      },
    );
  }

  function runTest() {
    const payload = body();
    if (payload === null) {
      return;
    }
    setOutcome(null);
    test.mutate(payload, {
      onSuccess: (data) => setOutcome({ ok: true, text: `${data.latency_ms} ms · ${data.model}` }),
      onError: (error) => setOutcome({ ok: false, text: error.message }),
    });
  }

  const known = catalogue.length > 0;
  const keyPlaceholder = provider.api_key_set ? `••••••••${provider.api_key_last4}` : "sk-…";

  return (
    <>
      <Panel density="list" title="Penyedia" caption={`Sumber: ${provider.source === "dashboard" ? "Dashboard" : "Env"}`}>
        <div className="grid gap-3 p-4">
          <div className="flex items-center gap-2">
            <StatusBadge tone={provider.enabled ? "safe" : "neutral"}>
              {provider.enabled ? "Aktif" : "Nonaktif"}
            </StatusBadge>
            <p className="text-meta text-ash">
              {provider.enabled
                ? "Bot memakai AI untuk kategori, sumber, dan foto struk."
                : "Tanpa kunci API, bot jalan dengan aturan saja."}
            </p>
          </div>

          <FormField label="Alamat API" htmlFor="llm-base">
            <Input
              id="llm-base"
              value={base}
              inputMode="url"
              onChange={(event) => setDraftBase(event.target.value)}
              placeholder="https://api.openai.com/v1"
            />
          </FormField>

          <FormField
            label="Kunci API"
            htmlFor="llm-key"
            hint={clearKey ? "akan dihapus" : "kosong = tidak diubah"}
          >
            <div className="flex gap-2">
              <Input
                id="llm-key"
                type="password"
                autoComplete="off"
                value={draftKey}
                disabled={clearKey}
                onChange={(event) => setDraftKey(event.target.value)}
                placeholder={keyPlaceholder}
              />
              <Button
                variant="ghost"
                onClick={() => {
                  setClearKey((on) => !on);
                  setDraftKey("");
                }}
              >
                {clearKey ? "Batal hapus" : "Hapus kunci"}
              </Button>
            </div>
          </FormField>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={loadModels} disabled={models.isPending}>
              <Download className="size-4" strokeWidth={1.75} />
              {models.isPending ? "Memuat…" : "Muat daftar model"}
            </Button>
            {known ? (
              <Button variant="ghost" size="sm" onClick={() => setManual((on) => !on)}>
                {manual ? "Pilih dari daftar" : "Ketik manual"}
              </Button>
            ) : null}
          </div>

          <FormField label="Model" htmlFor="llm-model">
            {known && !manual ? (
              <Select value={model} onValueChange={(next) => setDraftModel(next)}>
                <SelectTrigger id="llm-model" className="w-full">
                  <SelectValue placeholder="Pilih model" />
                </SelectTrigger>
                <SelectContent>
                  {catalogue.map((id) => (
                    <SelectItem key={id} value={id}>
                      {id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="llm-model"
                value={model}
                onChange={(event) => setDraftModel(event.target.value)}
                placeholder="gpt-4o-mini"
              />
            )}
          </FormField>

          <FormField label="Model foto struk" htmlFor="llm-vision" hint="opsional">
            {known && !manual ? (
              <Select
                value={vision === "" ? SAME_AS_MODEL : vision}
                onValueChange={(next) => setDraftVision(next === SAME_AS_MODEL ? "" : next)}
              >
                <SelectTrigger id="llm-vision" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SAME_AS_MODEL}>Sama dengan model utama</SelectItem>
                  {catalogue.map((id) => (
                    <SelectItem key={id} value={id}>
                      {id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="llm-vision"
                value={vision}
                onChange={(event) => setDraftVision(event.target.value)}
                placeholder="Sama dengan model utama"
              />
            )}
          </FormField>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Batas waktu (detik)" htmlFor="llm-timeout">
              <Input
                id="llm-timeout"
                inputMode="numeric"
                min={1}
                max={60}
                value={timeout}
                onChange={(event) => setDraftTimeout(event.target.value)}
              />
            </FormField>
            <FormField label="Batas waktu foto (detik)" htmlFor="llm-vision-timeout">
              <Input
                id="llm-vision-timeout"
                inputMode="numeric"
                min={1}
                max={120}
                value={visionTimeout}
                onChange={(event) => setDraftVisionTimeout(event.target.value)}
              />
            </FormField>
          </div>

          {outcome === null ? null : (
            <p className={outcome.ok ? "text-meta text-safe-text" : "text-meta text-over-text"}>
              {outcome.ok ? (
                <>
                  <Check className="mr-1 inline size-4 align-text-bottom" strokeWidth={1.75} />
                  {outcome.text}
                </>
              ) : (
                outcome.text
              )}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button variant="ghost" onClick={runTest} disabled={test.isPending}>
              <Wifi className="size-4" strokeWidth={1.75} />
              {test.isPending ? "Menguji…" : "Tes koneksi"}
            </Button>
            <Button onClick={save} disabled={update.isPending || !dirty}>
              Simpan
            </Button>
          </div>
        </div>
      </Panel>

      {provider.source === "dashboard" ? (
        <Panel density="list" title="Kembalikan ke default">
          <div className="grid gap-2 p-4 sm:grid-cols-[220px_minmax(0,1fr)]">
            <p className="text-meta text-ash">
              Hapus konfigurasi dashboard dan pakai nilai dari environment server.
            </p>
            <div>
              <Button variant="secondary" onClick={() => setResetOpen(true)}>
                Kembalikan ke default
              </Button>
            </div>
          </div>
        </Panel>
      ) : null}

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Kembalikan ke default?"
        description="Konfigurasi dashboard dihapus; bot memakai nilai dari environment server."
        confirmLabel="Kembalikan"
        tone="danger"
        pending={reset.isPending}
        onConfirm={() =>
          reset.mutate(undefined, {
            onSuccess: () => {
              toast.success("Kembali ke default");
              setResetOpen(false);
              setDraftBase(null);
              setDraftKey("");
              setClearKey(false);
              setDraftModel(null);
              setDraftVision(null);
              setDraftTimeout(null);
              setDraftVisionTimeout(null);
            },
            onError: (error) => toastError(error.message),
          })
        }
      />
    </>
  );
}
