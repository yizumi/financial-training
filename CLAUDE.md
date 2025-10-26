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
