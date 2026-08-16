import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildMarkdown, convert, escapeHtml, css, KATEX_CSS_URL, NavItem } from "./md-to-html.js";

const SRC_DIR = "src";
const DEST_DIR = "dist";

function extractTitle(mdPath: string, fallback: string): string {
  const content = readFileSync(mdPath, "utf8");
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : fallback;
}

function isMainChapter(filename: string): boolean {
  return /^chapter-\d+\.md$/.test(filename);
}

function buildIndex(files: string[], nav: NavItem[]): void {
  function toEntry(f: string): { href: string; title: string } {
    const href = f.replace(/\.md$/, ".html");
    const title = extractTitle(join(SRC_DIR, f), f.replace(/\.md$/, ""));
    return { href, title };
  }

  function titleSortKey(title: string): number {
    const match = title.match(/^(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : Infinity;
  }

  const supplementary = files
    .filter((f) => !isMainChapter(f))
    .map(toEntry)
    .sort((a, b) => titleSortKey(a.title) - titleSortKey(b.title));

  function renderList(entries: { href: string; title: string }[]): string {
    const items = entries
      .map(({ href, title }) => `    <li><a href="${escapeHtml(href)}">${escapeHtml(title)}</a></li>`)
      .join("\n");
    return `<ul class="chapter-list">\n${items}\n</ul>`;
  }

  const body = `
<h1>財務研修 | Financial Training</h1>
<p>ソフトウェアエンジニア・技術リーダーのための財務・会計・経営入門コース</p>

<h2>目次 | Chapters</h2>
${renderList(nav)}

<h2>演習・解答 | Exercises &amp; Answers</h2>
${renderList(supplementary)}
`.trim();

  const html = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>財務研修 | Financial Training</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;500;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400..700;1,8..60,400..700&display=swap" />
<link rel="stylesheet" href="${KATEX_CSS_URL}" />
<style>
${css}

.page-layout { max-width: 760px; }

.chapter-list {
  list-style: none;
  padding-left: 0;
  margin: 0 0 2em;
}
.chapter-list li {
  margin: 0.55em 0;
  font-size: 1.05rem;
}
.chapter-list a { text-decoration: none; }
.chapter-list a:hover { text-decoration: underline; }
</style>
</head>
<body>
<div class="page-layout">
  <main>
${body}
  </main>
</div>
</body>
</html>
`;

  const outPath = join(DEST_DIR, "index.html");
  writeFileSync(outPath, html, "utf8");
  console.log(`Wrote ${outPath} (${html.length.toLocaleString()} bytes)`);
}

function main() {
  function chapterSortKey(filename: string): [number, string] {
    const match = filename.match(/^chapter-(\d+)/);
    return match ? [parseInt(match[1], 10), filename] : [Infinity, filename];
  }

  const files = readdirSync(SRC_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort((a, b) => {
      const [na, sa] = chapterSortKey(a);
      const [nb, sb] = chapterSortKey(b);
      return na !== nb ? na - nb : sa.localeCompare(sb);
    });

  if (files.length === 0) {
    console.error(`No .md files found in ${SRC_DIR}/`);
    process.exit(1);
  }

  function chapterNumber(filename: string): number {
    const match = filename.match(/^chapter-(\d+)/);
    return match ? parseInt(match[1], 10) : -1;
  }

  function titleSortKey(title: string): number {
    const match = title.match(/^(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : Infinity;
  }

  const supplementaryByChapter = new Map<number, NavItem[]>();
  for (const f of files.filter((f) => !isMainChapter(f))) {
    const num = chapterNumber(f);
    const entry: NavItem = {
      href: f.replace(/\.md$/, ".html"),
      title: extractTitle(join(SRC_DIR, f), f.replace(/\.md$/, "")),
      indented: true,
    };
    if (!supplementaryByChapter.has(num)) supplementaryByChapter.set(num, []);
    supplementaryByChapter.get(num)!.push(entry);
  }
  for (const entries of supplementaryByChapter.values()) {
    entries.sort((a, b) => titleSortKey(a.title) - titleSortKey(b.title));
  }

  const nav: NavItem[] = [];
  for (const f of files.filter(isMainChapter)) {
    const num = chapterNumber(f);
    nav.push({
      href: f.replace(/\.md$/, ".html"),
      title: extractTitle(join(SRC_DIR, f), f.replace(/\.md$/, "")),
    });
    for (const child of supplementaryByChapter.get(num) ?? []) {
      nav.push(child);
    }
  }

  const renderer = buildMarkdown();
  for (const f of files) {
    const input = join(SRC_DIR, f);
    const output = join(DEST_DIR, f.replace(/\.md$/, ".html"));
    convert(input, output, renderer, nav);
  }

  buildIndex(files, nav);

  console.log(`Built ${files.length} chapter${files.length === 1 ? "" : "s"} into ${DEST_DIR}/`);
}

main();
