"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import { Check, ChevronDown } from "lucide-react";

import { CategoryTile } from "@/components/category-tile";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { buildTree, type CategoryNode } from "@/lib/category-tree";
import type { Category } from "@/lib/api/hooks";
import { cn } from "@/lib/utils";

/** One row of the flattened tree: the category plus how deep it sits. */
type FlatRow = { category: Category; depth: number };

/** Pre-order walk of the tree, so a parent always precedes its children. */
function flattenTree(tree: CategoryNode[]): FlatRow[] {
  const rows: FlatRow[] = [];
  const walk = (nodes: CategoryNode[], depth: number) => {
    for (const node of nodes) {
      rows.push({ category: node.category, depth });
      walk(node.children, depth + 1);
    }
  };
  walk(tree, 0);
  return rows;
}

/**
 * A category's indentation, capped at three levels so a deep tree still
 * fits the popover while showing that depth exists.
 */
function indentOf(depth: number): number {
  return 8 + Math.min(depth, 3) * 16;
}

/**
 * Searchable, hierarchy-aware category picker (DESIGN.md §4): one
 * control for every surface that asks for a category, so a child reads
 * as a child and a parent can be found by typing either its own name or
 * one of its descendants'. Children are indented, and every match keeps
 * its ancestors visible — the ancestors are real, selectable categories.
 */
export function CategoryPicker({
  value,
  onChange,
  categories,
  id,
  placeholder = "Pilih kategori",
  clearLabel,
  size = "default",
  disabled = false,
  invalid = false,
  ariaLabel,
  className,
}: {
  /** Selected category id, or "" for none. */
  value: string;
  onChange: (categoryId: string) => void;
  /** The caller decides which categories are offerable, archived ones included. */
  categories: Category[];
  /** The trigger's id, so a `FormField` label can point at it. */
  id?: string;
  placeholder?: string;
  /** When set, a row that yields "" is offered first (e.g. "Tanpa induk"). */
  clearLabel?: string;
  /** Matches `ui/select`'s trigger sizes: 44px phone / 32px desktop, "sm" one step down. */
  size?: "sm" | "default";
  disabled?: boolean;
  invalid?: boolean;
  /** The accessible name when no visible label points at the trigger. */
  ariaLabel?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const listId = `${id ?? "category-picker"}-list`;

  const rows = useMemo(() => flattenTree(buildTree(categories)), [categories]);

  const rowById = useMemo(() => {
    const map = new Map<string, FlatRow>();
    for (const row of rows) {
      map.set(row.category.id, row);
    }
    return map;
  }, [rows]);

  const q = query.trim().toLowerCase();

  // A match keeps its ancestors: the path to "Permen" is "Makanan ›
  // Jajan › Permen", and hiding the middle would orphan the row.
  const visible = useMemo(() => {
    if (q === "") {
      return rows;
    }
    const keep = new Set<string>();
    for (const row of rows) {
      if (!row.category.name.toLowerCase().includes(q)) {
        continue;
      }
      keep.add(row.category.id);
      let parentId = row.category.parent_id;
      while (parentId !== null && parentId !== undefined && !keep.has(parentId)) {
        keep.add(parentId);
        parentId = rowById.get(parentId)?.category.parent_id;
      }
    }
    return rows.filter((row) => keep.has(row.category.id));
  }, [rows, rowById, q]);

  const selected = rows.find((row) => row.category.id === value);

  function close() {
    setOpen(false);
    setQuery("");
  }

  function select(categoryId: string) {
    onChange(categoryId);
    close();
  }

  // Rows are real buttons, so focus movement is the browser's job and
  // there is no `aria-activedescendant` bookkeeping to keep in sync.
  function moveFocus(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
      return;
    }
    event.preventDefault();
    const buttons = Array.from(
      event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
        "[role=option]",
      ) ?? [],
    );
    const index = buttons.indexOf(event.currentTarget);
    const next = buttons[index + (event.key === "ArrowDown" ? 1 : -1)];
    next?.focus();
  }

  const triggerLabel = (() => {
    if (value === "") {
      return { text: clearLabel ?? placeholder, muted: true, depth: 0 };
    }
    if (selected === undefined) {
      // The value is a category this list cannot resolve; the row still
      // has a category, so never show it as blank or as a placeholder.
      return { text: "Kategori", muted: false, depth: 0 };
    }
    const archived = selected.category.archived_at !== null && selected.category.archived_at !== undefined;
    return {
      text: archived ? `${selected.category.name} (arsip)` : selected.category.name,
      muted: false,
      depth: selected.depth,
    };
  })();

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setQuery("");
        }
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          id={id}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={listId}
          aria-label={ariaLabel}
          aria-invalid={invalid || undefined}
          disabled={disabled}
          onKeyDown={(event) => {
            // A native button would fire click on Enter/Space in a real
            // browser; preventDefault keeps that from double-toggling
            // what this handler already opened.
            if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
            }
          }}
          className={cn(
            "flex w-fit items-center justify-between gap-2 rounded-md border border-border-strong bg-surface px-2.5 py-1 text-control whitespace-nowrap outline-none focus-visible:border-primary focus-visible:ring-[4px] focus-visible:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
            size === "default" ? "h-11 sm:h-8" : "h-9 sm:h-7",
            className,
          )}
        >
          <span
            className={cn("truncate", triggerLabel.muted && "text-muted-foreground")}
            style={{ paddingLeft: indentOf(triggerLabel.depth) }}
          >
            {triggerLabel.text}
          </span>
          <ChevronDown className="size-4 shrink-0 text-ink-soft" strokeWidth={1.75} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[min(22rem,calc(100vw-2rem))] p-0"
        onOpenAutoFocus={(event) => {
          // The search box takes focus, not the content wrapper.
          event.preventDefault();
        }}
      >
        <div className="border-b border-border p-2">
          <Input
            aria-label="Cari kategori"
            placeholder="Cari kategori"
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div
          role="listbox"
          id={listId}
          aria-label="Kategori"
          className="max-h-72 overflow-y-auto py-1"
        >
          {categories.length === 0 ? (
            <p className="px-3 py-2 text-meta text-ash">Belum ada kategori.</p>
          ) : (
            <>
              {clearLabel !== undefined && q === "" ? (
                <button
                  type="button"
                  role="option"
                  aria-selected={value === ""}
                  onClick={() => select("")}
                  onKeyDown={moveFocus}
                  className="flex min-h-11 w-full items-center gap-2 border-b border-border px-3 text-left text-body outline-none last:border-b-0 hover:bg-accent focus-visible:bg-accent lg:min-h-9"
                >
                  <span className="truncate text-muted-foreground">{clearLabel}</span>
                  {value === "" ? (
                    <Check aria-hidden className="ml-auto size-3.5 text-primary" strokeWidth={3} />
                  ) : null}
                </button>
              ) : null}
              {visible.map((row) => {
                const isSelected = row.category.id === value;
                return (
                  <button
                    key={row.category.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => select(row.category.id)}
                    onKeyDown={moveFocus}
                    className="flex min-h-11 w-full items-center gap-2 border-b border-border pr-3 text-left text-body outline-none last:border-b-0 hover:bg-accent focus-visible:bg-accent lg:min-h-9"
                    style={{ paddingLeft: indentOf(row.depth) }}
                  >
                    <span aria-hidden className="shrink-0">
                      <CategoryTile category={row.category} size="sm" />
                    </span>
                    <span className="truncate">{row.category.name}</span>
                    {isSelected ? (
                      <Check
                        aria-hidden
                        className="ml-auto size-3.5 shrink-0 text-primary"
                        strokeWidth={3}
                      />
                    ) : null}
                  </button>
                );
              })}
              {q !== "" && visible.length === 0 ? (
                <p className="px-3 py-2 text-meta text-ash">Tidak ada kategori cocok.</p>
              ) : null}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
