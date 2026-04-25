import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { buildMarkdown, wrapHtml } from "./md-to-html.js";

const SRC_DIR = "src";
const OUT_PATH = "dist/book.html";
const BOOK_TITLE = "Finance Training";

type ChapterEntry = { num: number; suffix: string; filename: string };

function parseFilename(f: string): ChapterEntry | null {
  const m = f.match(/^chapter-(\d+)(?:-(.+))?\.md$/);
  if (!m) return null;
  return { num: parseInt(m[1], 10), suffix: m[2] ?? "", filename: f };
}

function compareChapters(a: ChapterEntry, b: ChapterEntry): number {
  if (a.num !== b.num) return a.num - b.num;
  return a.suffix.localeCompare(b.suffix);
}

function main() {
  const entries = readdirSync(SRC_DIR)
    .map(parseFilename)
    .filter((x): x is ChapterEntry => x !== null)
    .sort(compareChapters);

  if (entries.length === 0) {
    console.error(`No chapter files found in ${SRC_DIR}/`);
    process.exit(1);
  }

  const renderer = buildMarkdown();
  const sections: string[] = [];
  for (const e of entries) {
    const md = readFileSync(join(SRC_DIR, e.filename), "utf8");
    const body = renderer.render(md);
    sections.push(`<section class="chapter" data-source="${e.filename}">\n${body}</section>`);
    console.log(`  + ${e.filename}`);
  }

  const combinedBody = sections.join("\n");
  const html = wrapHtml(BOOK_TITLE, combinedBody);

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, html, "utf8");
  console.log(
    `Wrote ${OUT_PATH} (${html.length.toLocaleString()} bytes, ${entries.length} chapter${entries.length === 1 ? "" : "s"})`,
  );
}

main();
