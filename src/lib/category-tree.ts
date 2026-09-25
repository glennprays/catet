import type { Category } from "@/lib/api/hooks";

export type CategoryNode = {
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
    const parent = nodes.get(category.parent_id);
    if (parent === undefined) {
      // The parent is not in this list (archived, or filtered out): keep
      // the row visible as a root instead of dropping it silently — the
      // counter above the list counts every row the server sent.
      roots.push(node);
      continue;
    }
    parent.children.push(node);
  }
  return roots;
}

/** Ids of every category below `id` in `categories` (not `id` itself). */
export function descendantIds(categories: Category[], id: string): Set<string> {
  const childrenOf = new Map<string, string[]>();
  for (const category of categories) {
    const parentId = category.parent_id;
    if (parentId === null || parentId === undefined) {
      continue;
    }
    const siblings = childrenOf.get(parentId);
    if (siblings === undefined) {
      childrenOf.set(parentId, [category.id]);
    } else {
      siblings.push(category.id);
    }
  }

  const out = new Set<string>();
  const queue = [id];
  while (queue.length > 0) {
    const current = queue.pop() as string;
    for (const child of childrenOf.get(current) ?? []) {
      if (out.has(child)) {
        continue;
      }
      out.add(child);
      queue.push(child);
    }
  }
  return out;
}
