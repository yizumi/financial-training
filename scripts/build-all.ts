import { readdirSync } from "node:fs";
import { join } from "node:path";
import { buildMarkdown, convert } from "./md-to-html.js";

const SRC_DIR = "src";
const DEST_DIR = "dist";

function main() {
  const files = readdirSync(SRC_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort();

  if (files.length === 0) {
    console.error(`No .md files found in ${SRC_DIR}/`);
    process.exit(1);
  }

  const renderer = buildMarkdown();
  for (const f of files) {
    const input = join(SRC_DIR, f);
    const output = join(DEST_DIR, f.replace(/\.md$/, ".html"));
    convert(input, output, renderer);
  }

  console.log(`Built ${files.length} chapter${files.length === 1 ? "" : "s"} into ${DEST_DIR}/`);
}

main();
