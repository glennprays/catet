// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { ApiError } from "@/lib/api/client";
import type { MerchantSummary } from "@/lib/api/hooks";

const merchants: MerchantSummary[] = [
  {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    name: "Kopi Kenangan",
    tx_count: 12,
    total_minor: 480_000,
    last_used_at: "2026-09-15T04:00:00Z",
  },
  {
    id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    name: "Traktir Teman",
    tx_count: 2,
    total_minor: 183_000,
    last_used_at: null,
  },
];

const renameMutate = vi.fn();
const mergeMutate = vi.fn();
const toastErrorMock = vi.fn();

vi.mock("@/lib/api/hooks", () => ({
  useMerchants: () => ({
    data: { merchants },
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useRenameMerchant: () => ({ mutate: renameMutate, isPending: false }),
  useMergeMerchant: () => ({ mutate: mergeMutate, isPending: false }),
}));

vi.mock("@/lib/toast", () => ({
  toastError: toastErrorMock,
  toast: { success: vi.fn() },
}));

vi.mock("@/components/live-region", () => ({
  useAnnounce: () => () => undefined,
}));

const { default: MerchantsPage } = await import("./page");

describe("Settings → Merchant", () => {
  test("lists merchants with counts and totals", async () => {
    render(<MerchantsPage />);
    expect(screen.getByText("Kopi Kenangan")).toBeDefined();
    expect(screen.getByText("12")).toBeDefined();
    expect(screen.getByText("Rp480.000")).toBeDefined();
    expect(screen.getByText("Belum dipakai")).toBeDefined();

    fireEvent.keyDown(screen.getByRole("button", { name: "Aksi Kopi Kenangan" }), {
      key: "Enter",
    });
    const link = await screen.findByRole("menuitem", { name: "Lihat transaksi" });
    expect(link.getAttribute("href")).toBe(
      `/transactions?period=all&merchant_id=${merchants[0].id}`,
    );
  });

  test("a duplicate name toasts the merge hint and keeps the sheet open", async () => {
    renameMutate.mockImplementation((_vars, handlers) => {
      handlers.onError(new ApiError({ code: "CONFLICT", message: "merchant name already exists" }));
    });
    render(<MerchantsPage />);

    fireEvent.keyDown(screen.getByRole("button", { name: "Aksi Kopi Kenangan" }), {
      key: "Enter",
    });
    fireEvent.click(await screen.findByRole("menuitem", { name: "Ubah nama" }));
    const input = (await screen.findByLabelText(/Nama/)) as HTMLInputElement;
    expect(input.value).toBe("Kopi Kenangan");
    fireEvent.change(input, { target: { value: "Traktir Teman" } });
    fireEvent.click(screen.getByRole("button", { name: "Simpan" }));

    await waitFor(() =>
      expect(toastErrorMock).toHaveBeenCalledWith("Nama itu sudah ada — gabungkan saja"),
    );
    expect(screen.getByText("Ubah nama merchant")).toBeDefined();
  });

  test("merge offers only other merchants and sends the chosen target", async () => {
    render(<MerchantsPage />);

    fireEvent.keyDown(screen.getByRole("button", { name: "Aksi Kopi Kenangan" }), {
      key: "Enter",
    });
    fireEvent.click(await screen.findByRole("menuitem", { name: "Gabungkan ke…" }));
    expect(screen.getByText("Gabungkan Kopi Kenangan")).toBeDefined();

    const confirm = screen.getByRole("button", { name: "Gabungkan" }) as HTMLButtonElement;
    expect(confirm.disabled).toBe(true);

    fireEvent.keyDown(screen.getByLabelText(/Gabungkan ke/), { key: "Enter" });
    fireEvent.click(await screen.findByRole("option", { name: "Traktir Teman" }));
    expect(screen.queryByRole("option", { name: "Kopi Kenangan" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Gabungkan" }));

    await waitFor(() => expect(mergeMutate).toHaveBeenCalled());
    expect(mergeMutate.mock.calls[0][0]).toEqual({
      id: merchants[0].id,
      intoMerchantId: merchants[1].id,
    });
  });
});
