"use client";

import { useState } from "react";
import { Tags } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";


import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { EmptyState, QueryErrorState } from "@/components/empty-state";

import { PageHeader } from "@/components/page-header";
import {
  useArchiveCategory,
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  type Category,
} from "@/lib/api/hooks";

type CategoryNode = {
  category: Category;
  children: CategoryNode[];
};

export function buildTree(categories: Category[]): CategoryNode[] {
  const nodes = new Map<string, CategoryNode>();
  const roots: CategoryNode[] = [];

  for (const category of categories) {
    nodes.set(category.id, { category, children: [] });
  }
  for (const category of categories) {
    const node = nodes.get(category.id);
    if (node === undefined) {
      continue;
    }
    if (category.parent_id === null || category.parent_id === undefined) {
      roots.push(node);
      continue;
    }
    nodes.get(category.parent_id)?.children.push(node);
  }
  return roots;
}

export default function CategoriesPage() {
  const categories = useCategories();
  const archive = useArchiveCategory();
  const list = categories.data?.categories ?? [];
  const tree = buildTree(list);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [parentTarget, setParentTarget] = useState<Category | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Category | null>(null);

  function openCreate(parent: Category | null) {
    setEditing(null);
    setParentTarget(parent);
    setFormOpen(true);
  }

  function openAddChild(parent: Category) {
    setEditing(null);
    setParentTarget(parent);
    setFormOpen(true);
  }

  function openEdit(category: Category) {
    setParentTarget(null);
    setEditing(category);
    setFormOpen(true);
  }

  return (
    <>
      <PageHeader
        title="Categories"
        actions={
          <Button onClick={() => openCreate(null)}>
            <Tags className="size-4" /> Tambah kategori
          </Button>
        }
      />

      <div className="py-4">
        {categories.isPending ? (
          <div className="grid gap-2">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-9 w-full rounded-sm" />
            ))}
          </div>
        ) : categories.isError ? (
          <QueryErrorState message="Kategori gagal dimuat." onRetry={() => categories.refetch()} />
        ) : list.length === 0 ? (
          <EmptyState
            icon={Tags}
            heading="Belum ada kategori"
            caption="Kelompokkan pengeluaran: makan, transport, tagihan."
            action={
              <Button variant="secondary" onClick={() => openCreate(null)}>
                Buat kategori
              </Button>
            }
          />
        ) : (
          <div className="rounded-md border border-border bg-surface">
            {tree.map((node) => (
              <CategoryBranch
                key={node.category.id}
                node={node}
                depth={0}
                onAddChild={openAddChild}
                onEdit={openEdit}
                onArchive={setArchiveTarget}
              />
            ))}
          </div>
        )}
      </div>

      <CategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        parent={parentTarget}
        categories={list}
      />

      <ConfirmDialog
        open={archiveTarget !== null}
        onOpenChange={(open) => !open && setArchiveTarget(null)}
        title={`Arsipkan ${archiveTarget?.name ?? "kategori"}?`}
        description="Kategori diarsipkan; transaksi lama tetap memakainya."
        confirmLabel="Arsipkan"
        tone="danger"
        pending={archive.isPending}
        onConfirm={() => {
          if (archiveTarget === null) {
            return;
          }
          archive.mutate(archiveTarget.id, {
            onSuccess: () => {
              toast.success("Kategori diarsipkan");
              setArchiveTarget(null);
            },
            onError: (error) => toast.error(error.message, { duration: Infinity }),
          });
        }}
      />
    </>
  );
}

function CategoryBranch({
  node,
  depth,
  onAddChild,
  onEdit,
  onArchive,
}: {
  node: CategoryNode;
  depth: number;
  onAddChild: (parent: Category) => void;
  onEdit: (category: Category) => void;
  onArchive: (category: Category) => void;
}) {
  const update = useUpdateCategory();

  return (
    <div>
      <div
        className="group flex h-11 items-center gap-3 border-b border-border px-3 last:border-b-0"
        style={{ paddingLeft: `${12 + depth * 20}px` }}
      >
        <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{node.category.name}</span>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Essential</span>
          <label
            htmlFor={`category-essential-${node.category.id}`}
            className="flex size-11 shrink-0 items-center justify-center"
          >
            <Switch
              id={`category-essential-${node.category.id}`}
              checked={node.category.essential}
              disabled={update.isPending}
              onCheckedChange={(essential) =>
                update.mutate(
                  { id: node.category.id, essential },
                  {
                    onError: (error) => toast.error(error.message),
                  },
                )
              }
              aria-label={`Essential ${node.category.name}`}
            />
          </label>
        </div>

        <div className="flex gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddChild(node.category)}
          >
            Sub
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(node.category)}>
            Ubah
          </Button>
          <Button
            variant="dangerGhost"
            size="sm"
            onClick={() => onArchive(node.category)}
          >
            Arsipkan
          </Button>
        </div>
      </div>

      {node.children.map((child) => (
        <CategoryBranch
          key={child.category.id}
          node={child}
          depth={depth + 1}
          onAddChild={onAddChild}
          onEdit={onEdit}
          onArchive={onArchive}
        />
      ))}
    </div>
  );
}

function CategoryFormDialog({

  open,
  onOpenChange,
  editing,
  parent,
  categories,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Category | null;
  parent: Category | null;
  categories: Category[];
}) {
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const [name, setName] = useState("");
  const [essential, setEssential] = useState(false);
  const [parentId, setParentId] = useState("");
  const [initializedFor, setInitializedFor] = useState<string | null>(null);

  const sessionKey = `${open ? "open" : "closed"}-${editing?.id ?? "new"}-${parent?.id ?? "root"}`;
  if (open && initializedFor !== sessionKey) {
    setInitializedFor(sessionKey);
    setName(editing?.name ?? "");
    setEssential(editing?.essential ?? false);
    setParentId(editing?.parent_id ?? parent?.id ?? "");
  }

  const pending = create.isPending || update.isPending;

  function submit() {
    if (editing !== null) {
      const body: { name?: string; parent_id?: string | null; essential?: boolean } = {};
      if (name.trim() !== "" && name !== editing.name) {
        body.name = name.trim();
      }
      if (essential !== editing.essential) {
        body.essential = essential;
      }
      const nextParent = parentId === "" ? null : parentId;
      if (nextParent !== (editing.parent_id ?? null)) {
        body.parent_id = nextParent;
      }
      if (Object.keys(body).length === 0) {
        onOpenChange(false);
        return;
      }
      update.mutate(
        { id: editing.id, ...body },
        {
          onSuccess: () => {
            toast.success("Kategori diubah");
            onOpenChange(false);
          },
          onError: (error) => toast.error(error.message),
        },
      );
      return;
    }
    create.mutate(
      {
        name: name.trim(),
        essential,
        parent_id: parentId === "" ? undefined : parentId,
      },
      {
        onSuccess: () => {
          toast.success("Kategori dibuat");
          setName("");
          onOpenChange(false);
        },
        onError: (error) => toast.error(error.message),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing === null ? "Tambah kategori" : "Ubah kategori"}</DialogTitle>
          <DialogDescription>
            {parent !== null && editing === null
              ? `Sub-kategori dari ${parent.name}.`
              : "Kategori pengeluaran, bisa bertingkat."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="category-name">Nama</Label>
            <Input
              id="category-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="mis. Makanan"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Induk</Label>
            <Select value={parentId} onValueChange={(value) => setParentId(value === "root" ? "" : value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Tanpa induk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="root">Tanpa induk</SelectItem>
                {categories
                  .filter((category) => category.id !== editing?.id)
                  .map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-md bg-surface-100 px-3 py-2.5">
            <div>
              <Label htmlFor="category-essential">Essential</Label>
              <p className="text-xs text-muted-foreground">Kebutuhan pokok, bukan gaya hidup</p>
            </div>
            <label htmlFor="category-essential" className="flex size-11 shrink-0 items-center justify-center">
              <Switch id="category-essential" checked={essential} onCheckedChange={setEssential} />
            </label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={submit} disabled={pending || name.trim() === ""}>
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
