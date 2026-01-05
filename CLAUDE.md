# Claude Code Guidelines

## Project Context

This is a financial training project for software technology leaders within a Management of Technology (MOT) context.

**Target Audience**: Software engineers, CTOs, technical leaders transitioning to business roles

**Language**: All content should be written in Japanese (日本語) to serve the Japanese tech community

**Key Principle**: Always use examples and scenarios that software engineers are familiar with:

- Game development projects
- SaaS businesses
- Software development lifecycle decisions
- Tech company operations
- Product development tradeoffs
- Technical infrastructure investments

Avoid traditional finance examples (manufacturing, retail, etc.) in favor of technology-focused scenarios that resonate with the audience's daily experience.

### Real-World Examples from Japanese Tech Companies

When discussing accounting and financial statements, use publicly traded Japanese tech companies as case studies:

**Recommended Companies**:

- **Money Forward** (マネーフォワード) - Fintech, SaaS
- **freee** (フリー) - Cloud accounting SaaS
- **DeNA** - Gaming, e-commerce
- **GREE** (グリー) - Gaming, social media
- **Mercari** (メルカリ) - C2C marketplace
- **CyberAgent** (サイバーエージェント) - Digital advertising, gaming
- **LINE** - Messaging platform, services
- **Rakuten** (楽天) - E-commerce, fintech
- **Sansan** - B2B SaaS, business card management
- **SmartHR** - HR SaaS

These companies' financial statements are publicly available (EDINET, company IR pages) and provide relatable examples for the target audience.

## Mathematical Formulas

**Always use LaTeX syntax for all mathematical formulas.**

### Display Equations (Block Format)

Use double dollar signs for standalone equations:

```markdown
$$
FV_t = PV(1 + r)^t
$$
```

### Inline Math

Use single dollar signs for inline mathematical expressions:

```markdown
The variable $r$ represents the discount rate, and $t$ is the time period.
```

### Examples

- Subscripts: `$x_i$` renders as $x_i$
- Superscripts: `$x^2$` renders as $x^2$
- Fractions: `$\frac{a}{b}$` renders as $\frac{a}{b}$
- Greek letters: `$\alpha$, `$\beta$`, `$\Delta$`
- Sum notation: `$\sum_{i=1}^{n} x_i$`

## Why LaTeX?

- Provides proper mathematical typography
- Renders correctly in most markdown viewers
- Standard for academic and technical documentation
- Supports complex mathematical notation

## Japanese Text Formatting

### Bold Text in Japanese

**IMPORTANT**: When using bold formatting (`**text**`) with Japanese text, you MUST add spaces on both sides of the bold markers for proper rendering.

**Incorrect** (will display literal `**` characters):

```markdown
これは**重要**です。
```

**Correct** (will render as bold):

```markdown
これは **重要** です。
```

This applies to all emphasis formatting in Japanese text:

- Bold: `**text**` → `**テキスト**` (needs spaces)
- Italic: `*text*` → `*テキスト*` (needs spaces)

**Examples:**

```markdown
❌ **WACC**は、プロジェクトが超えるべきハードルレートです。
✅ **WACC** は、プロジェクトが超えるべきハードルレートです。

❌ これが**最も重要**な原則です。
✅ これが **最も重要** な原則です。

❌ 投資家は**年 11% のリターン**を要求します。
✅ 投資家は **年 11% のリターン** を要求します。
```

### Inline Math in Japanese Text

**IMPORTANT**: When using inline math (`$...$`) within Japanese text, you MUST add spaces on both sides of the dollar signs for proper rendering.

**Incorrect** (will display literal `$` characters):

```markdown
負債の利息は税控除できるため、$(1 - T)$ を掛けます。
```

**Correct** (will render as math):

```markdown
負債の利息は税控除できるため、 $(1 - T)$ を掛けます。
```

This rule applies whenever inline math appears adjacent to Japanese characters (hiragana, katakana, kanji) or Japanese punctuation (、。).

## Project Structure and File Organization

### Directory Structure

```
finance/
├── src/               # All chapter content files
│   ├── chapter-0.md   # Introduction
│   ├── chapter-1.md   # Time Value of Money
│   ├── chapter-2.md   # Interest Rates & Risk
│   ├── chapter-3.md   # Investment Decisions
│   └── ...
├── tmp/               # Temporary files (gitignored)
├── .gitignore
├── .prettierrc        # Prettier configuration
├── .prettierignore
├── CLAUDE.md          # This file - project guidelines
├── README.md
├── package.json       # NPM scripts and dependencies
└── package-lock.json
```

**Important**: All chapter markdown files are located in the `src/` directory to keep the project root clean.

## Formatting and Style Guide

### Chapter Structure

Each chapter must follow this structure:

```markdown
# [Number]. [Title in Japanese] | [Title in English]

<div align="right">Yusuke Izumi, CFA 著</div>

> **Opening quote or key principle**

## はじめに | Introduction

[Content...]

## [Section Number]. [Section Title]

[Content with examples...]

## まとめ | Summary

**重要なポイント：**

1. [Key learning point 1]
2. [Key learning point 2]
   ...

## 演習問題 | Practice Problems

[Practice problems without section number]

## 解答と解説 | Answers and Explanations

[Detailed solutions]
```

### Author Attribution

**Always right-align** the author name using HTML:

```markdown
<div align="right">Yusuke Izumi, CFA 著</div>
```

### Tables

**Right-align numeric columns** for better readability:

```markdown
| 項目 |  金額 | 割合 |
| :--- | ----: | ---: |
| 売上 | 1,000 | 100% |
| 費用 |   800 |  80% |
```

The `:---:` or `---:` syntax right-aligns the column.

### Section Headers

- **Main sections**: Use numbers (e.g., `## 2.1. 無リスク金利の概念`)
- **Summary section**: Always unnumbered `## まとめ | Summary`
- **Practice problems**: Always unnumbered `## 演習問題 | Practice Problems`
- **Answers**: Always unnumbered `## 解答と解説 | Answers and Explanations`

### Examples Format

Use blockquotes with 📖 emoji for examples:

```markdown
> **📖 Example: [Example Title]**
>
> [Example content...]
>
> **結論：**
>
> [Conclusion...]
```

### Practice Problems Format

```markdown
### 問題 1：[Title]

[Question text]

- A. [Option A]
- B. [Option B]
- C. [Option C]

---
```

**Important**: Use `- A. ` format (not `**A.**` or other formats) for consistency.

### Answer Format

```markdown
### 問題 1：正解 A

**計算：**

$$
[Mathematical calculation if applicable]
$$

**解説：**

[Detailed explanation...]

---
```

## Code Formatting

### Prettier Configuration

The project uses Prettier for consistent markdown formatting.

**Configuration** (`.prettierrc`):

```json
{
  "proseWrap": "preserve",
  "printWidth": 80,
  "overrides": [
    {
      "files": "*.md",
      "options": {
        "proseWrap": "preserve",
        "printWidth": 10000
      }
    }
  ]
}
```

**Key settings**:

- `proseWrap: "preserve"` - Preserves line breaks in Japanese text
- `printWidth: 10000` for markdown - Prevents unwanted line wrapping in Japanese prose

### Running Prettier

```bash
# Format all markdown files
npm run format

# Check formatting without making changes
npm run format:check
```

**What gets formatted**:

- All markdown files in `src/**/*.md`
- Root-level markdown files (`*.md`)

## Git Conventions

### Branch Workflow

**CRITICAL: Never commit directly to the main branch.**

**Always follow this workflow:**

1. **Before starting work**, create a feature branch:

   ```bash
   git checkout -b feature/descriptive-name
   # or
   git checkout -b fix/descriptive-name
   ```

2. **Make your changes** and commit to the feature branch

3. **Push the feature branch** to remote:

   ```bash
   git push -u origin feature/descriptive-name
   ```

4. **Create a Pull Request** from the feature branch to main

**Branch naming conventions:**

- `feature/*` - New content or features (e.g., `feature/chapter-4-financial-statements`)
- `fix/*` - Bug fixes or corrections (e.g., `fix/chapter-2-typos`)
- `docs/*` - Documentation updates (e.g., `docs/update-readme`)

**Why this matters:**

- Keeps main branch stable and reviewable
- Allows for proper code review through PRs
- Maintains clean git history
- Enables easy rollback if needed

### Gitignore

The following are gitignored:

```
node_modules/
tmp/
.DS_Store
*.swp, *.swo, *~
.vscode/, .idea/
npm-debug.log*
```

**Never commit**:

- `node_modules/` - Use `npm install` to restore dependencies
- Temporary files
- Editor-specific files

### Commit Messages

Follow conventional commit style with Claude Code attribution:

```
[Type]: [Description]

[Detailed explanation if needed]

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```
