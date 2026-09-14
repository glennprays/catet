import { describe, expect, test } from "vitest";

import { buildTree } from "./page";
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
});
