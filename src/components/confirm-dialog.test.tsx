// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { ConfirmDialog } from "./confirm-dialog";

describe("ConfirmDialog", () => {
  test("typed phrase gates the confirm button until it matches", () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        open
        onOpenChange={() => undefined}
        title="Void transaksi ini?"
        description="hilang dari semua hitungan"
        confirmLabel="Void"
        tone="danger"
        typedPhrase="HAPUS"
        pending={false}
        onConfirm={onConfirm}
      />,
    );

    const confirm = screen.getByRole("button", { name: "Void" });
    expect((confirm as HTMLButtonElement).disabled).toBe(true);

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "hapus" } });

    expect((confirm as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(confirm);
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  test("reversible actions confirm without a typed gate", () => {
    render(
      <ConfirmDialog
        open
        onOpenChange={() => undefined}
        title="Arsipkan Cash?"
        description="bisa dibuka lagi"
        confirmLabel="Arsipkan"
        pending={false}
        onConfirm={() => undefined}
      />,
    );

    expect(screen.queryByRole("textbox")).toBeNull();
    expect((screen.getByRole("button", { name: "Arsipkan" }) as HTMLButtonElement).disabled).toBe(
      false,
    );
  });
});
