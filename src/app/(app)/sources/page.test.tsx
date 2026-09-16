// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import type { Source } from "@/lib/api/hooks";

const bca: Source = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "BCA",
  type: "bank",
  is_debt: false,
  currency: "IDR",
  archived_at: null,
  balance_minor: 250_000,
  has_transactions: true,
};

const archiveMutate = vi.fn();
const adjustMutate = vi.fn();
const restoreMutate = vi.fn();
const removeMutate = vi.fn();

function stubMutation(mutate: ReturnType<typeof vi.fn>) {
  return { mutate, mutateAsync: vi.fn(async () => undefined), isPending: false };
}

vi.mock("@/lib/api/hooks", () => ({
  useSources: () => ({
    data: { sources: [bca], total_available_minor: 250_000, total_debt_minor: 0 },
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useArchiveSource: () => stubMutation(archiveMutate),
  useAdjustSource: () => stubMutation(adjustMutate),
  useRestoreSource: () => stubMutation(restoreMutate),
  useDeleteSource: () => stubMutation(removeMutate),
  useCreateSource: () => stubMutation(vi.fn()),
  useUpdateSource: () => stubMutation(vi.fn()),
}));

vi.mock("@/components/capture-sheet-provider", () => ({
  useCaptureSheet: () => ({ openCreate: vi.fn() }),
}));

const { default: SourcesPage } = await import("./page");

beforeEach(() => {
  archiveMutate.mockClear();
  adjustMutate.mockClear();
});
// Radix opens the dropdown on pointerdown, which jsdom does not
// synthesise; the keyboard path is equivalent and real.
function openMenu() {
  fireEvent.keyDown(screen.getByRole("button", { name: "Aksi BCA" }), { key: "Enter" });
}

function debtSwitch() {
  return screen.getByRole("switch", { name: /Sumber utang/ });
}

describe("Sources lifecycle actions", () => {
  test("Tambah starts clean after a source was edited", () => {
    render(<SourcesPage />);

    // Edit BCA, flip the debt switch, close without saving.
    openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: "Ubah" }));
    fireEvent.click(debtSwitch());
    expect(debtSwitch().getAttribute("aria-checked")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Batal" }));

    // A fresh Tambah must not inherit it.
    fireEvent.click(screen.getByRole("button", { name: "Tambah" }));
    expect(debtSwitch().getAttribute("aria-checked")).toBe("false");
    expect((screen.getByLabelText("Nama") as HTMLInputElement).value).toBe("");
  });

  test("editing exposes the type select", () => {
    render(<SourcesPage />);

    openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: "Ubah" }));

    const jenis = screen.getByLabelText("Jenis");
    expect(jenis.textContent).toContain("Bank");
  });

  test("Arsipkan on a funded source routes to Koreksi saldo instead of archiving", () => {
    render(<SourcesPage />);

    openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: "Arsipkan" }));

    expect(archiveMutate).not.toHaveBeenCalled();
    expect(screen.queryByText(/Koreksi saldo — BCA/)).not.toBeNull();
  });

  test("a source with history offers no permanent delete", () => {
    render(<SourcesPage />);

    openMenu();
    expect(screen.queryByRole("menuitem", { name: "Hapus" })).toBeNull();
  });
});
