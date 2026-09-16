import { IconTile } from "@/components/icon-tile";
import { categoryGlyph } from "@/lib/category-glyph";
import { hueFor } from "@/lib/hue";

/**
 * The leading glyph of a category row (DESIGN.md §4). The hue is the
 * category's identity (stable per id), the glyph is read from its name — so a
 * list of categories is scannable by colour before it is read.
 */
export function CategoryTile({
  category,
  size = "sm",
}: {
  category: { id: string; name: string };
  size?: "sm" | "md";
}) {
  return (
    <IconTile size={size} tone={hueFor(category.id)} icon={categoryGlyph(category.name)} />
  );
}
