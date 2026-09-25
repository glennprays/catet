import { describe, expect, test } from "vitest";

import { buildTree, descendantIds } from "@/lib/category-tree";
import type { Category } from "@/lib/api/hooks";

function category(id: string, parent_id?: string | null): Category {
  return {
    id,
    name: id,
    parent_id,
    icon: null,
    essential: false,
    archived_at: null,
    created_at: "2026-09-09T00:00:00Z",
  };
}

describe("buildTree", () => {
  test("attaches children to their parent node", () => {
    const tree = buildTree([category("parent"), category("child", "parent")]);

    expect(tree).toHaveLength(1);
    expect(tree[0]?.children.map((node) => node.category.id)).toEqual(["child"]);
  });

  test("keeps a child whose parent is missing as a root", () => {
    const tree = buildTree([category("child", "gone")]);

    expect(tree).toHaveLength(1);
    expect(tree[0]?.category.id).toBe("child");
  });
});

describe("descendantIds", () => {
  test("walks every level", () => {
    const list = [category("a"), category("b", "a"), category("c", "b"), category("d")];

    expect(descendantIds(list, "a")).toEqual(new Set(["b", "c"]));
  });

  test("is empty for a leaf", () => {
    const list = [category("a"), category("b", "a")];

    expect(descendantIds(list, "b")).toEqual(new Set<string>());
  });
});
