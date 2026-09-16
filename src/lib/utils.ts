import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/*
 * tailwind-merge has to be taught the type scale (DESIGN.md §3). Without this
 * it reads `text-body` / `text-label` / `text-figure-md` as *colour* classes
 * and silently drops them whenever a real colour follows in the same call —
 * `cn("text-label text-ash")` would ship with no font size at all.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "hero",
            "figure-lg",
            "title",
            "figure-md",
            "body",
            "meta",
            "label",
            "control",
            "amount",
            "amount-lg",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
