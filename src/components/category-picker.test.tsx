// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { CategoryPicker } from "./category-picker";
import type { Category } from "@/lib/api/hooks";

function category(id: string, name: string, parent_id?: string | null): Category {
  return {
    id,
    name,
    parent_id: parent_id ?? null,
    icon: null,
    essential: false,
    archived_at: null,
    created_at: "2026-09-09T00:00:00Z",
  };
}

// Makanan → Jajan → Permen, plus a sibling root Kopi: three levels deep
// is where indentation and the ancestor-keeping search both matter.
const makanan = category("makanan", "Makanan");
const jajan = category("jajan", "Jajan", makanan.id);
const permen = category("permen", "Permen", jajan.id);
const kopi = category("kopi", "Kopi");
const categories = [makanan, jajan, permen, kopi];

function trigger() {
  return screen.getByRole("combobox", { name: "Kategori" });
}

function open(onChange = vi.fn(), value = "") {
  render(
    <CategoryPicker
      value={value}
      onChange={onChange}
      categories={categories}
      ariaLabel="Kategori"
    />,
  );
  fireEvent.keyDown(trigger(), { key: "Enter" });
  return onChange;
}

function option(name: string) {
  return screen.getByRole("option", { name });
}

function paddingOf(name: string) {
  return Number.parseInt(option(name).style.paddingLeft, 10);
}

describe("CategoryPicker", () => {
  test("opens on the keyboard and lists every category", () => {
    open();

    for (const cat of categories) {
      expect(option(cat.name)).toBeDefined();
    }
    expect(trigger().getAttribute("aria-expanded")).toBe("true");
  });

  test("indents a child deeper than its parent", () => {
    open();

    expect(paddingOf(jajan.name)).toBeGreaterThan(paddingOf(makanan.name));
    expect(paddingOf(permen.name)).toBeGreaterThan(paddingOf(jajan.name));
    expect(paddingOf(kopi.name)).toBe(paddingOf(makanan.name));
  });

  test("keeps a match's ancestors visible while filtering", () => {
    open();

    fireEvent.change(screen.getByLabelText("Cari kategori"), {
      target: { value: "per" },
    });

    // Permen matched; Makanan and Jajan are kept as its path.
    expect(option(permen.name)).toBeDefined();
    expect(option(makanan.name)).toBeDefined();
    expect(option(jajan.name)).toBeDefined();
    expect(screen.queryByRole("option", { name: kopi.name })).toBeNull();
  });

  test("selects the matched child by id and closes", () => {
    const onChange = open();

    fireEvent.change(screen.getByLabelText("Cari kategori"), {
      target: { value: "per" },
    });
    fireEvent.click(option(permen.name));

    expect(onChange).toHaveBeenCalledWith(permen.id);
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
  });

  test("says so when nothing matches", () => {
    open();

    fireEvent.change(screen.getByLabelText("Cari kategori"), {
      target: { value: "zzz" },
    });

    expect(screen.getByText("Tidak ada kategori cocok.")).toBeDefined();
  });

  test("clears the search when the popover closes", () => {
    open();

    fireEvent.change(screen.getByLabelText("Cari kategori"), {
      target: { value: "per" },
    });
    fireEvent.keyDown(screen.getByLabelText("Cari kategori"), { key: "Escape" });
    fireEvent.keyDown(trigger(), { key: "Enter" });

    // Reopened with the full list, not the stale filter.
    expect(option(kopi.name)).toBeDefined();
    expect((screen.getByLabelText("Cari kategori") as HTMLInputElement).value).toBe("");
  });

  test("renders a clear row only while the query is empty", () => {
    const onChange = vi.fn();
    render(
      <CategoryPicker
        value={kopi.id}
        onChange={onChange}
        categories={categories}
        clearLabel="Semua kategori"
        ariaLabel="Kategori"
      />,
    );
    fireEvent.keyDown(trigger(), { key: "Enter" });

    fireEvent.click(option("Semua kategori"));
    expect(onChange).toHaveBeenCalledWith("");

    fireEvent.keyDown(trigger(), { key: "Enter" });
    fireEvent.change(screen.getByLabelText("Cari kategori"), {
      target: { value: "ma" },
    });
    expect(screen.queryByRole("option", { name: "Semua kategori" })).toBeNull();
  });

  test("distinguishes two categories that share a name", () => {
    const first = category("dup-1", "Kopi");
    const second = category("dup-2", "Kopi");
    const onChange = vi.fn();
    render(
      <CategoryPicker
        value=""
        onChange={onChange}
        categories={[first, second]}
        ariaLabel="Kategori"
      />,
    );
    fireEvent.keyDown(trigger(), { key: "Enter" });

    const options = screen.getAllByRole("option", { name: "Kopi" });
    expect(options).toHaveLength(2);

    fireEvent.click(options[1]);
    expect(onChange).toHaveBeenCalledWith(second.id);
  });

  test("marks the trigger invalid for the form field", () => {
    render(
      <CategoryPicker
        value=""
        onChange={vi.fn()}
        categories={categories}
        ariaLabel="Kategori"
        invalid
      />,
    );

    expect(trigger().getAttribute("aria-invalid")).toBe("true");
  });

  test("shows an archived selection as archived on the trigger", () => {
    const arsip = { ...category("arsip", "Langganan"), archived_at: "2026-09-01T00:00:00Z" };
    render(
      <CategoryPicker
        value={arsip.id}
        onChange={vi.fn()}
        categories={[arsip]}
        ariaLabel="Kategori"
      />,
    );

    expect(trigger().textContent).toContain("Langganan (arsip)");
  });
});
