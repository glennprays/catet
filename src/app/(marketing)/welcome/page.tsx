import Link from "next/link";
import {
  CalendarClock,
  CalendarDays,
  CreditCard,
  EyeOff,
  ListChecks,
  MessageSquareText,
  PiggyBank,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { Brand } from "@/components/brand";
import { BudgetProgressRow } from "@/components/budget-progress-row";
import { IconTile, type IconTone } from "@/components/icon-tile";
import { Metric } from "@/components/metric";
import { MoneyText } from "@/components/money-text";
import { Panel } from "@/components/panel";
import { SourceCard } from "@/components/source-card";
import { ChatMock } from "@/components/landing/chat-mock";
import {
  DEMO_ASSET_TOTAL,
  DEMO_BUDGETS,
  DEMO_DEBT_TOTAL,
  DEMO_SOURCES,
} from "@/components/landing/demo-data";
import { DemoHero } from "@/components/landing/demo-hero";
import { Button } from "@/components/ui/button";

const CONTAINER = "mx-auto max-w-[1120px] px-4 sm:px-6";

const STEPS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: MessageSquareText,
    title: "Kirim chat",
    body: "Tulis apa adanya: gojek 18rb, gaji masuk 8jt.",
  },
  {
    icon: ListChecks,
    title: "Tercatat otomatis",
    body: "Jumlah, kategori, dan sumber terisi; yang ragu masuk antrean review.",
  },
  {
    icon: Wallet,
    title: "Lihat Safe-to-Spend",
    body: "Satu angka: sisa yang aman dipakai setelah tagihan dan tabungan.",
  },
];

const FEATURES: { icon: LucideIcon; tone: IconTone; title: string; body: string }[] = [
  {
    icon: Wallet,
    tone: "blue",
    title: "Safe-to-Spend",
    body: "Saldo dikurangi tagihan yang sudah dekat dan porsi tabungan — angka yang benar-benar boleh dipakai.",
  },
  {
    icon: CalendarDays,
    tone: "teal",
    title: "Runway & jatah harian",
    body: "Berapa hari uangmu bertahan pada laju sekarang, dan berapa yang aman per hari.",
  },
  {
    icon: CalendarClock,
    tone: "amber",
    title: "Tagihan & kalender",
    body: "Semua tagihan berulang dalam satu kalender, dengan peringatan sebelum jatuh tempo.",
  },
  {
    icon: PiggyBank,
    tone: "violet",
    title: "Anggaran per kategori",
    body: "Batas bulanan per kategori dengan bar yang berubah warna sebelum kebablasan.",
  },
  {
    icon: CreditCard,
    tone: "ink",
    title: "Utang paylater terkumpul",
    body: "SPayLater, Akulaku, kartu kredit — semua sisa cicilan berkumpul di satu tempat.",
  },
  {
    icon: EyeOff,
    tone: "sky",
    title: "Mode privasi",
    body: "Dashboard terbuka dalam keadaan tersembunyi; tekan satu tombol saat aman melihat.",
  },
];

/**
 * Public product page, served at `/` for visitors by a middleware rewrite.
 * It composes the real app components against fixture data (never a
 * screenshot), so the page cannot drift from the product.
 */
export default function WelcomePage() {
  return (
    <main className="pb-16">
      <header className={`${CONTAINER} flex h-14 items-center justify-between`}>
        <Link
          href="/"
          aria-label="catet"
          className="rounded-md focus-visible:ring-[4px] focus-visible:ring-primary/10 focus-visible:outline-none"
        >
          <Brand />
        </Link>
        <Button variant="secondary" asChild>
          <Link href="/login">Masuk</Link>
        </Button>
      </header>

      <section
        className={`${CONTAINER} grid gap-8 py-12 lg:grid-cols-[minmax(0,1fr)_520px] lg:items-center lg:py-20`}
      >
        <div className="min-w-0">
          <span className="block text-label font-medium uppercase text-ash">
            Pencatat keuangan lewat WhatsApp
          </span>
          <h1 className="mt-2 text-[36px] font-semibold leading-[1.1] tracking-[-0.02em] text-ink lg:text-[44px]">
            Catat pengeluaran secepat kirim chat.
          </h1>
          <p className="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-muted-foreground">
            Ketik <span className="font-medium text-ink">kopi 25rb</span> ke catet di WhatsApp. Ia
            mencatat, memilih kategori, dan langsung memberi tahu berapa yang masih aman dipakai
            hari ini.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Button asChild>
              <Link href="/login">Masuk</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="#cara-kerja">Lihat cara kerja</Link>
            </Button>
          </div>
        </div>

        {/* The phone is the capture surface; the real hero card overlaps its
            bottom-right corner, so "chat in, answer out" is one picture. */}
        <div className="relative flex min-w-0 flex-col items-center lg:items-start">
          <div className="lg:pl-8">
            <ChatMock />
          </div>
          <div className="-mt-10 w-[400px] max-w-full sm:w-[440px] lg:-mt-16 lg:ml-auto lg:-mr-4">
            <DemoHero />
          </div>
        </div>
      </section>

      <section id="cara-kerja" className={`${CONTAINER} py-12`}>
        <h2 className="text-body font-semibold uppercase tracking-[0.06em] text-ash">
          Cara kerja
        </h2>
        <ol className="mt-4 grid gap-6 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="min-w-0">
              <IconTile size="md" tone="primary" icon={step.icon} />
              <h3 className="mt-2 text-figure-md font-semibold text-ink">
                {index + 1}. {step.title}
              </h3>
              <p className="mt-1 text-body leading-relaxed text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={`${CONTAINER} py-12`}>
        <h2 className="text-body font-semibold uppercase tracking-[0.06em] text-ash">Fitur</h2>
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Panel key={feature.title} density="comfortable">
              <IconTile size="md" tone={feature.tone} icon={feature.icon} />
              <h3 className="mt-2 text-figure-md font-semibold text-ink">{feature.title}</h3>
              <p className="mt-1 text-body leading-relaxed text-muted-foreground">
                {feature.body}
              </p>
            </Panel>
          ))}
        </div>
      </section>

      <section className={`${CONTAINER} py-12`}>
        <h2 className="text-body font-semibold uppercase tracking-[0.06em] text-ash">
          Pratinjau
        </h2>
        <div className="mt-4 grid gap-2.5 lg:grid-cols-3">
          <Panel title="Akun" density="list">
            <div className="grid gap-2 px-3 pt-0 pb-3">
              {DEMO_SOURCES.map((source) => (
                <SourceCard
                  key={source.id}
                  source={source}
                  share={
                    source.is_debt
                      ? DEMO_DEBT_TOTAL === 0
                        ? 0
                        : Math.abs(source.balance_minor) / DEMO_DEBT_TOTAL
                      : DEMO_ASSET_TOTAL === 0
                        ? 0
                        : source.balance_minor / DEMO_ASSET_TOTAL
                  }
                />
              ))}
            </div>
          </Panel>

          <Panel title="Anggaran" caption="September" density="list">
            {DEMO_BUDGETS.map((row) => (
              <BudgetProgressRow key={row.category_id} row={row} />
            ))}
          </Panel>

          <Panel title="Arus kas" caption="30 hari terakhir" density="list">
            <div className="grid grid-cols-3 gap-3 px-4 py-3">
              <Metric
                label="Masuk"
                value={
                  <MoneyText minor={8_000_000} signed size="md" tone="safe" className="font-semibold" />
                }
              />
              <Metric
                label="Keluar"
                value={
                  <MoneyText minor={-3_470_000} size="md" tone="neutral" className="font-semibold" />
                }
              />
              <Metric
                label="Bersih"
                value={
                  <MoneyText minor={4_530_000} signed size="md" tone="safe" className="font-semibold" />
                }
              />
            </div>
          </Panel>
        </div>
      </section>

      <footer className={`${CONTAINER} flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6`}>
        <Brand />
        <p className="text-body text-muted-foreground">
          Dibuat untuk satu orang, dipakai setiap hari.
        </p>
        <Link
          href="/login"
          className="text-body font-medium text-primary hover:underline focus-visible:ring-[4px] focus-visible:ring-primary/10 focus-visible:outline-none"
        >
          Masuk
        </Link>
      </footer>
    </main>
  );
}
