"use client";

import { useState } from "react";
import { Tags } from "lucide-react";
import { toast } from "sonner";

import { toastError } from "@/lib/toast";
import { CategoryTile } from "@/components/category-tile";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { FormField } from "@/components/form-field";
import { ListRow } from "@/components/list-row";
import { Panel } from "@/components/panel";
import { ResponsiveSheet } from "@/components/responsive-sheet";
import { RowMenu } from "@/components/row-menu";
import { SwitchRow } from "@/components/switch-row";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
            <Tags className="size-4" strokeWidth={1.75} /> Tambah kategori
          </Button>
        }
      />

      <div className="py-2.5">
        {categories.isPending ? (
          <Panel density="list">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="catet-shimmer m-2 h-9 rounded-md" />
            ))}
          </Panel>
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
          <Panel density="list" title="Kategori" caption={`${list.length} aktif`}>
            <div className="hidden h-8 grid-cols-[minmax(0,1fr)_96px_40px] items-center border-b border-border px-4 text-label font-medium uppercase text-ash md:grid">
              <span>Nama</span>
              <span>Kebutuhan</span>
              <span />
            </div>
            <ul aria-label="Kategori">
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
            </ul>
          </Panel>
        )}
      </div>

      <CategoryFormSheet
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
            onError: (error) => toastError(error.message),
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
  const switchId = `category-essential-${node.category.id}`;

  return (
    <li>
      <ListRow
        indent={depth}
        leading={<CategoryTile category={node.category} />}
        title={node.category.name}
        trailing={
          <div className="grid grid-cols-[96px_40px] items-center">
            <Switch
              id={switchId}
              aria-label={`Kebutuhan: ${node.category.name}`}
              checked={node.category.essential}
              disabled={update.isPending}
              onCheckedChange={(essential) =>
                update.mutate(
                  { id: node.category.id, essential },
                  {
                    onSuccess: () =>
                      toast.success(essential ? "Ditandai Kebutuhan" : "Ditandai Gaya hidup"),
                    onError: (error) => toastError(error.message),
                  },
                )
              }
            />
            <RowMenu
              label={`Aksi ${node.category.name}`}
              actions={[
                { label: "Sub", onClick: () => onAddChild(node.category) },
                { label: "Ubah", onClick: () => onEdit(node.category) },
                { label: "Arsipkan", tone: "danger", onClick: () => onArchive(node.category) },
              ]}
            />
          </div>
        }
      />

      {node.children.length > 0 ? (
        <ul>
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
        </ul>
      ) : null}
    </li>
  );
}

function CategoryFormSheet({
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
          onError: (error) => toastError(error.message),
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
        onError: (error) => toastError(error.message),
      },
    );
  }

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      title={editing === null ? "Tambah kategori" : "Ubah kategori"}
      description={
        parent !== null && editing === null
          ? `Sub-kategori dari ${parent.name}.`
          : "Kategori pengeluaran, bisa bertingkat."
      }
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={submit} disabled={pending || name.trim() === ""}>
            Simpan
          </Button>
        </>
      }
    >
      <FormField label="Nama" htmlFor="category-name">
        <Input
          id="category-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="mis. Makanan"
        />
      </FormField>

      <FormField label="Induk" htmlFor="category-parent">
        <Select value={parentId} onValueChange={(value) => setParentId(value === "root" ? "" : value)}>
          <SelectTrigger id="category-parent" className="w-full">
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
      </FormField>

      <SwitchRow
        id="category-essential"
        label="Kebutuhan"
        caption="Kebutuhan pokok, bukan gaya hidup"
        checked={essential}
        onCheckedChange={setEssential}
      />
    </ResponsiveSheet>
  );
}
