// One-off PWA icon generator. Rasterises src/app/icon.svg into the committed
// PNGs referenced by src/app/manifest.ts and Next's apple-icon convention.
//
//   node scripts/icons.mjs
//
// Vector-in, bitmap-out: the 24x24 viewBox is scaled with CSS before paint, so
// every size is rendered at full fidelity instead of being upscaled. Output is
// committed to git; the app has no runtime image dependency.
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const BRAND = "#f2f4f7";
// Maskable icons are cropped to an arbitrary shape; the spec's safe zone is the
// centre 80% circle, so the glyph is inset to 60% of the canvas.
const MASKABLE_GLYPH_RATIO = 0.6;

/** @type {Array<{ out: string, size: number, background: string | null }>} */
const TARGETS = [
  { out: "public/icons/icon-192.png", size: 192, background: null },
  { out: "public/icons/icon-512.png", size: 512, background: null },
  { out: "src/app/apple-icon.png", size: 180, background: null },
  { out: "public/icons/icon-512-maskable.png", size: 512, background: BRAND },
];

function page(svg, size, background, glyph) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;padding:0;background:transparent}
body{width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;${
    background === null ? "" : `background:${background};`
  }}
svg{display:block;width:${glyph}px;height:${glyph}px;shape-rendering:geometricPrecision}
</style></head><body>${svg}</body></html>`;
}

const svg = await readFile(join(root, "src/app/icon.svg"), "utf8");
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM ?? "/usr/bin/chromium-browser",
  args: ["--no-sandbox"],
});

try {
  const tab = await browser.newPage({ viewport: { width: 512, height: 512 }, deviceScaleFactor: 1 });
  for (const { out, size, background } of TARGETS) {
    const glyph = background === null ? size : Math.round(size * MASKABLE_GLYPH_RATIO);
    await tab.setViewportSize({ width: size, height: size });
    await tab.setContent(page(svg, size, background, glyph));
    const png = await tab.screenshot({ type: "png", omitBackground: background === null });
    const file = join(root, out);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, png);
    const { size: bytes } = await stat(file);
    console.log(
      `${relative(root, file)}  ${size}x${size}  glyph ${glyph}px  ${background ?? "transparent"}  ${bytes} B`,
    );
  }
} finally {
  await browser.close();
}
