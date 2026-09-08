export default function Home() {
  return (
    <div className="min-h-full flex flex-col bg-canvas text-ink font-sans">
      <main className="flex flex-1 items-start justify-center p-6">
        <div className="w-full max-w-md bg-surface rounded-md border border-border p-4">
          <h1 className="text-[26px] font-medium leading-[1.15] tracking-[-0.015em]">
            catet
          </h1>
          <p className="text-[13px] text-muted-foreground">Safe-to-Spend</p>
          <p className="text-[40px] font-medium leading-[1.05] tracking-[-0.01em] tabular-nums text-safe-text">
            Rp8.003.500
          </p>
          <p className="tabular-nums text-[12px] text-warn-text">
            Jatah harian Rp266.800/hari
          </p>
          <p className="tabular-nums text-[12px] text-over-text">
            Utang −Rp1.925.000
          </p>
        </div>
      </main>
    </div>
  );
}
