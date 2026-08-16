import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import puppeteer from "puppeteer";
import { buildMarkdown, css, escapeHtml, KATEX_CSS_URL } from "./md-to-html.js";

const SRC_DIR = "src";
const HTML_OUT = "tmp/financial-training.html";
const PDF_OUT = "dist/financial-training.pdf";
const MERMAID_VERSION = "10";

interface Doc {
  file: string;
  id: string;
  title: string;
  markdown: string;
  supplementary: boolean;
}

function extractTitle(markdown: string, fallback: string): string {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : fallback;
}

function isMainChapter(filename: string): boolean {
  return /^chapter-\d+\.md$/.test(filename);
}

function chapterNumber(filename: string): number {
  const match = filename.match(/^chapter-(\d+)/);
  return match ? parseInt(match[1], 10) : Infinity;
}

function titleSortKey(title: string): number {
  const match = title.match(/^(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : Infinity;
}

/** Same reading order as build-all.ts: each main chapter followed by its supplements. */
function collectDocs(): Doc[] {
  const files = readdirSync(SRC_DIR).filter((f) => f.endsWith(".md"));

  function toDoc(file: string): Doc {
    const markdown = readFileSync(join(SRC_DIR, file), "utf8");
    return {
      file,
      id: file.replace(/\.md$/, ""),
      title: extractTitle(markdown, file.replace(/\.md$/, "")),
      markdown,
      supplementary: !isMainChapter(file),
    };
  }

  const mains = files
    .filter(isMainChapter)
    .sort((a, b) => chapterNumber(a) - chapterNumber(b))
    .map(toDoc);

  const supplementsByChapter = new Map<number, Doc[]>();
  for (const f of files.filter((f) => !isMainChapter(f))) {
    const num = chapterNumber(f);
    if (!supplementsByChapter.has(num)) supplementsByChapter.set(num, []);
    supplementsByChapter.get(num)!.push(toDoc(f));
  }
  for (const docs of supplementsByChapter.values()) {
    docs.sort((a, b) => titleSortKey(a.title) - titleSortKey(b.title));
  }

  const ordered: Doc[] = [];
  for (const main of mains) {
    ordered.push(main);
    ordered.push(...(supplementsByChapter.get(chapterNumber(main.file)) ?? []));
  }
  return ordered;
}

const printCss = `
@page { size: A4; }

body { background: #fff; }

.pdf-page { max-width: 720px; margin: 0 auto; }

.pdf-cover {
  break-after: page;
  page-break-after: always;
  text-align: center;
  padding-top: 90mm;
}
.pdf-cover h1 {
  border-bottom: none;
  font-size: 2.6rem;
  margin-bottom: 0.4em;
}
.pdf-cover .pdf-subtitle { font-size: 1.05rem; color: var(--fg-muted); }
.pdf-cover .pdf-meta { margin-top: 6em; font-size: 0.85rem; color: var(--fg-muted); }

.pdf-toc {
  break-after: page;
  page-break-after: always;
}
.pdf-toc ol { list-style: none; padding-left: 0; }
.pdf-toc li { margin: 0.5em 0; font-size: 1.02rem; }
.pdf-toc li.indented { padding-left: 1.5em; font-size: 0.9rem; opacity: 0.85; }
.pdf-toc a { text-decoration: none; color: var(--fg); }

section.chapter {
  break-before: page;
  page-break-before: always;
}
section.chapter:first-of-type { break-before: auto; page-break-before: auto; }

blockquote, code, pre, thead th {
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
`;

function buildCombinedHtml(docs: Doc[]): string {
  const renderer = buildMarkdown();
  const buildDate = new Date().toISOString().slice(0, 10);
  const commit = (process.env.GITHUB_SHA ?? "").slice(0, 7);
  const hasMermaid = docs.some((d) => d.markdown.includes("```mermaid"));

  const tocItems = docs
    .map((d) => `      <li${d.supplementary ? ' class="indented"' : ""}><a href="#${escapeHtml(d.id)}">${escapeHtml(d.title)}</a></li>`)
    .join("\n");

  const sections = docs
    .map((d) => `<section class="chapter" id="${escapeHtml(d.id)}">\n${renderer.render(d.markdown)}</section>`)
    .join("\n");

  const mermaidScript = hasMermaid
    ? `<script type="module">
  import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@${MERMAID_VERSION}/dist/mermaid.esm.min.mjs";
  mermaid.initialize({ startOnLoad: true, theme: "default", securityLevel: "loose" });
</script>`
    : "";

  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8" />
<title>財務研修 | Financial Training</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;500;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400..700;1,8..60,400..700&display=swap" />
<link rel="stylesheet" href="${KATEX_CSS_URL}" />
<style>
${css}
${printCss}
</style>
</head>
<body>
<div class="pdf-page">
  <div class="pdf-cover">
    <h1>財務研修<br />Financial Training</h1>
    <p class="pdf-subtitle">ソフトウェアエンジニア・技術リーダーのための<br />財務・会計・経営入門コース</p>
    <p class="pdf-meta">${buildDate}${commit ? ` · ${commit}` : ""}</p>
  </div>
  <nav class="pdf-toc">
    <h2>目次 | Table of Contents</h2>
    <ol>
${tocItems}
    </ol>
  </nav>
  <main>
${sections}
  </main>
</div>
${mermaidScript}
</body>
</html>
`;
}

async function renderPdf(htmlPath: string, pdfPath: string): Promise<void> {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--force-color-profile=srgb"],
  });
  try {
    const page = await browser.newPage();
    await page.goto(`file://${resolve(htmlPath)}`, { waitUntil: "networkidle0", timeout: 180_000 });
    await page.evaluate(() => (document as any).fonts.ready);
    // Wait until every mermaid block has been rendered into an SVG.
    await page.waitForFunction(
      () => Array.from(document.querySelectorAll(".mermaid")).every((el) => el.querySelector("svg")),
      { timeout: 60_000 },
    );
    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: "<div></div>",
      footerTemplate:
        '<div style="width:100%; font-size:8px; color:#888; text-align:center;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
      margin: { top: "16mm", bottom: "18mm", left: "13mm", right: "13mm" },
      timeout: 180_000,
    });
  } finally {
    await browser.close();
  }
}

async function main() {
  const docs = collectDocs();
  if (docs.length === 0) {
    console.error(`No .md files found in ${SRC_DIR}/`);
    process.exit(1);
  }
  console.log(`Combining ${docs.length} documents:`);
  for (const d of docs) console.log(`  ${d.supplementary ? "  ↳ " : ""}${d.file} — ${d.title}`);

  const html = buildCombinedHtml(docs);
  mkdirSync("tmp", { recursive: true });
  mkdirSync("dist", { recursive: true });
  writeFileSync(HTML_OUT, html, "utf8");
  console.log(`Wrote ${HTML_OUT} (${html.length.toLocaleString()} bytes)`);

  await renderPdf(HTML_OUT, PDF_OUT);
  console.log(`Wrote ${PDF_OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
