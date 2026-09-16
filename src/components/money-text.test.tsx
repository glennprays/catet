import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { MoneyText } from "./money-text";

describe("MoneyText tone auto", () => {
  test("money out renders in ink", () => {
    const markup = renderToStaticMarkup(<MoneyText minor={-25000} />);
    expect(markup).toContain("text-ink");
    expect(markup).not.toContain("text-safe-text");
  });

  test("money in renders in the safe tone", () => {
    expect(renderToStaticMarkup(<MoneyText minor={8000000} />)).toContain("text-safe-text");
  });

  test("zero is muted, never a colour claim", () => {
    expect(renderToStaticMarkup(<MoneyText minor={0} />)).toContain("text-muted-foreground");
  });

  test("inherit applies no colour, so a figure can ride a hue card", () => {
    const markup = renderToStaticMarkup(<MoneyText minor={-1289000} tone="inherit" />);
    expect(markup).not.toMatch(/class="[^"]*\btext-(ink|safe-text|warn-text|over-text|muted-foreground)\b/);
    expect(markup).toContain("tabular-nums");
  });
});

describe("MoneyText formatting", () => {
  test("signed renders a plus for income", () => {
    expect(renderToStaticMarkup(<MoneyText minor={8000000} signed />)).toContain("+Rp8.000.000");
  });

  test("negative uses a true minus sign", () => {
    expect(renderToStaticMarkup(<MoneyText minor={-685000} />)).toContain("\u2212Rp685.000");
  });

  test("every figure is tabular", () => {
    expect(renderToStaticMarkup(<MoneyText minor={1} />)).toContain("tabular-nums");
  });
});
