import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, basename } from "node:path";
import MarkdownIt from "markdown-it";
import anchor from "markdown-it-anchor";
import footnote from "markdown-it-footnote";
import texmath from "markdown-it-texmath";
import katex from "katex";

const KATEX_VERSION = "0.16.11";
const MERMAID_VERSION = "10";

function buildMarkdown(): MarkdownIt {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: false,
    breaks: false,
  });

  md.use(anchor, { permalink: false, slugify: (s: string) => s.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\p{L}\p{N}\-]/gu, "") });
  md.use(footnote);
  md.use(texmath, {
    engine: katex,
    delimiters: "dollars",
    katexOptions: { throwOnError: false, strict: "ignore", output: "html" },
  });

  const defaultFence = md.renderer.rules.fence!;
  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    if (token.info.trim() === "mermaid") {
      return `<div class="mermaid">${md.utils.escapeHtml(token.content)}</div>\n`;
    }
    return defaultFence(tokens, idx, options, env, self);
  };

  return md;
}

function extractTitle(markdown: string, fallback: string): string {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : fallback;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const css = `
:root {
  --fg: #1f1f1f;
  --fg-muted: #555;
  --bg: #fbfaf6;
  --rule: #d8d3c4;
  --accent: #5a3a1f;
  --quote-bg: #f3efe2;
  --code-bg: #efeadb;
  --table-head-bg: #ede7d4;
  --max-width: 760px;
}

@font-face { font-display: swap; }

* { box-sizing: border-box; }

html { -webkit-text-size-adjust: 100%; font-size: 14px; }

body {
  margin: 0;
  padding: 6rem 2.5rem 10rem;
  background: var(--bg);
  color: var(--fg);
  font-family: "Source Serif 4", "Noto Serif JP", "Hiragino Mincho ProN", "Yu Mincho", "MS PMincho", serif;
  font-size: 1rem;
  line-height: 1.5;
  font-feature-settings: "palt", "kern";
  text-rendering: optimizeLegibility;
}

main {
  max-width: var(--max-width);
  margin: 0 auto;
}

h1, h2, h3, h4, h5, h6 {
  font-family: "Source Serif 4", "Noto Serif JP", serif;
  font-weight: 600;
  line-height: 1.35;
  letter-spacing: -0.005em;
  color: var(--fg);
  margin-top: 2.4em;
  margin-bottom: 0.8em;
  break-after: avoid;
  break-inside: avoid;
  page-break-after: avoid;
  page-break-inside: avoid;
}

p, li { orphans: 3; widows: 3; }
table, blockquote, pre, .katex-display, .mermaid { break-inside: avoid; page-break-inside: avoid; }

h1 {
  font-size: 2.1rem;
  font-weight: 700;
  border-bottom: 1px solid var(--rule);
  padding-bottom: 0.4em;
  margin-top: 0;
  margin-bottom: 1.4em;
}

h2 {
  font-size: 1.55rem;
  border-bottom: 1px solid var(--rule);
  padding-bottom: 0.3em;
}

h3 { font-size: 1.25rem; }
h4 { font-size: 1.1rem; }
h5, h6 { font-size: 1rem; color: var(--fg-muted); }

p { margin: 0 0 0.6em; }

a {
  color: var(--accent);
  text-decoration-thickness: 1px;
  text-underline-offset: 2px;
}
a:hover { color: #884b1f; }

strong { font-weight: 600; }
em { font-style: italic; }

hr {
  border: 0;
  border-top: 1px solid var(--rule);
  margin: 2.4em 0;
}

blockquote {
  margin: 1.6em 0;
  padding: 0.9em 1.3em;
  background: var(--quote-bg);
  border-left: 3px solid var(--accent);
  border-radius: 2px;
}
blockquote > :first-child { margin-top: 0; }
blockquote > :last-child { margin-bottom: 0; }
blockquote p { margin-bottom: 0.6em; }

code {
  font-family: "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  font-size: 0.88em;
  background: var(--code-bg);
  padding: 0.12em 0.35em;
  border-radius: 3px;
}

pre {
  background: var(--code-bg);
  padding: 1em 1.2em;
  border-radius: 4px;
  overflow-x: auto;
  line-height: 1.55;
  font-size: 0.92em;
}
pre code { background: none; padding: 0; }

ul, ol { padding-left: 1.6em; margin: 0 0 1.1em; }
li { margin: 0.1em 0; }

table {
  border-collapse: collapse;
  width: 100%;
  margin: 1.4em 0;
  font-size: 0.96em;
}
th, td {
  border: 1px solid var(--rule);
  padding: 0.55em 0.85em;
  text-align: left;
}
thead th { background: var(--table-head-bg); font-weight: 600; }
tbody tr:nth-child(even) { background: rgba(0, 0, 0, 0.02); }

.katex { font-size: 1.05em; }
.katex-display {
  margin: 1.4em 0;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0.2em 0;
}

.footnotes {
  margin-top: 3em;
  padding-top: 1.2em;
  border-top: 1px solid var(--rule);
  font-size: 0.92em;
  color: var(--fg-muted);
}
.footnotes ol { padding-left: 1.4em; }

.mermaid {
  margin: 1.6em auto;
  text-align: center;
}

@media (max-width: 640px) {
  html { font-size: 13px; }
  body { padding: 3rem 2rem 6rem; }
  h1 { font-size: 1.7rem; }
  h2 { font-size: 1.35rem; }
}

@media print {
  body { background: #fff; padding: 0; }
  blockquote, code, pre, thead th { background: #f4f1e8 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
`.trim();

function wrapHtml(title: string, body: string): string {
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;500;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400..700;1,8..60,400..700&display=swap" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@${KATEX_VERSION}/dist/katex.min.css" />
<style>
${css}
</style>
</head>
<body>
<main>
${body}
</main>
<script type="module">
  import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@${MERMAID_VERSION}/dist/mermaid.esm.min.mjs";
  mermaid.initialize({ startOnLoad: true, theme: "default", securityLevel: "loose" });
</script>
</body>
</html>
`;
}

export function convert(inputPath: string, outputPath: string, md?: MarkdownIt): void {
  const markdown = readFileSync(inputPath, "utf8");
  const renderer = md ?? buildMarkdown();
  const body = renderer.render(markdown);
  const title = extractTitle(markdown, basename(inputPath, ".md"));
  const html = wrapHtml(title, body);

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, html, "utf8");
  console.log(`Wrote ${outputPath} (${html.length.toLocaleString()} bytes)`);
}

export { buildMarkdown };

function main() {
  const [, , inputPath, outputPath] = process.argv;
  if (!inputPath || !outputPath) {
    console.error("Usage: tsx scripts/md-to-html.ts <input.md> <output.html>");
    process.exit(1);
  }
  convert(inputPath, outputPath);
}

const isCli = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isCli) main();
