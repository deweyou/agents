# deweyou-design

> Dewey Ou 个人设计系统的完整品牌与组件规范，用于生成符合风格的界面、原型或生产代码。

## When it triggers

- "用 deweyou 风格做一个…", "按照我的设计系统实现…", "帮我设计一个页面"
- "create a mock / prototype / UI" in context of Dewey Ou's projects
- Any work on `deweyou/design`, `deweyou.me`, or sibling personal repos
- User invokes `/deweyou-design` or mentions "deweyou design system"

## Installation

```bash
npx skills add https://github.com/deweyou/skills --skill deweyou-design
```

## Version

`1.1.0` — see [SKILL.md](./SKILL.md) for the changelog.

---

# Deweyou Design System

A minimal, serif-first React component system authored by Dewey Ou. Built around
**Song/serif typography** (宋体) and a deliberately small three-color semantic
palette: neutral (stone), primary (emerald), danger (red).

> "Simple, clean, and with clean lines. Less is more."

Preview site: [design.deweyou.me](https://design.deweyou.me)

---

## Sources

Everything in this system was reconstructed from the Deweyou repos. The user has
access; readers may not — full paths preserved for handoff.

- **Primary design repo:** `github.com/deweyou/design` (branch `main`)
  - Design philosophy + rules: `knowledge/design-style.md`
  - Tokens (CSS vars, palette, themes): `packages/styles/src/css/*`
  - React components: `packages/react/src/*`
  - Icon set (Tabler Icons wrapper): `packages/react-icons/`
  - Live preview app: `apps/website/` — homepage at `src/pages/home.tsx`
  - Harness notes: `CLAUDE.md`, `knowledge/constitution.md`
- **Uploaded brand marks:** `uploads/logo-static.svg`, `uploads/logo-animated.svg` — a
  mint-gradient handwritten "Dewey Ou" wordmark with two dots (ÖÜ-style diaeresis).
- **Personal sites / apps in scope:** blog + small apps (user-stated).

---

## Product Context

Deweyou Design (`@deweyou-design/*`) is Dewey Ou's personal design system. It
ships as npm packages consumed by his blog and other small apps:

| Package | Purpose |
| --- | --- |
| `@deweyou-design/styles` | Design tokens (CSS custom properties), fonts, base reset. |
| `@deweyou-design/react` | 27 React components built on Ark UI primitives + CSS Modules + Less. |
| `@deweyou-design/react-icons` | Tabler Icons wrappers with unified square-cap / miter-join stroke. |
| `@deweyou-design/react-hooks`, `-utils` | Runtime helpers. |

Two apps in the monorepo consume it:
- `apps/website` — component preview site (design.deweyou.me).
- `apps/storybook` — component stories.

The real deployed surfaces (blog, utilities) live in sibling repos such as
`deweyou/deweyou.me`, `deweyou/anniversary`, `deweyou/scrambler`, etc.

---

## CONTENT FUNDAMENTALS

**Language.** Primary copy is **Simplified Chinese**, often with English technical
terms inline (e.g. "Popover 内容", "Component Library · v1.0"). Do not insert
spaces between CJK and Latin — Song handles the optical balance. No space:
`组件库 · 深浅双主题` ✓ — not `组件库 · 深浅 双主题`.

**Tone.** Matter-of-fact, technical, modest. No marketing voice, no exclamation
marks, no hype. Sentences are compact, often sub-clauses joined by `，` or `·`.

Real examples from the site:
- Eyebrow: `Component Library · v1.0`
- Tagline: `基于宋体字形节奏与温暖色系构建，27 个组件覆盖完整 UI 场景。深浅双主题，开箱即用。`
- Section labels: `Design & Components`, `Icons · Tabler Icons`
- Labels: `打开 Popover`, `已勾选`, `触发 Toast`, `查看全部图标 →`

**Casing.** Uppercase + letter-spacing (`0.14em`) for eyebrows and section labels
in Latin. Sentence case for everything else.

**Pronouns.** Avoided. Imperative mood for actions ("打开菜单", "编辑", "复制",
"删除"). Commits use imperative too: `feat(scope): add X`.

**Punctuation.** CJK middle dot `·` is the signature separator. Em-dash and
en-dash used sparingly. Chinese full-width punctuation `，。：` inside prose.

**Emoji.** None. No emoji in UI, docs, or commit messages. Replace with the `·`
bullet or a Tabler icon.

**Numbers.** ASCII digits, no thousands separators in short form: `27 个组件`,
`v1.0`, `2026-04-20`.

---

## VISUAL FOUNDATIONS

### Typography — the brand identity

Song/serif everywhere. The full stack is
`'Source Han Serif CN Web', 'Songti SC', 'STSong', 'SimSun', serif`. Latin digits
and letters render in the serif fallback **by design** — don't swap to a
sans-serif inside components. Four weights only: 400 / 500 / 600 / 700.

Scale: `h1` clamp(2.8rem, 5vw, 4.6rem) · `h2` 2.3rem · `h3` 1.85rem · `h4`
1.45rem · `h5` 1.15rem · `body` 1rem · `caption` 0.875rem. Line-height tight on
display (1.02–1.32), 1.6 on body.

Eyebrows and micro-labels use **system-ui** at 9–10px with letter-spacing — the
one place the brand breaks from serif, kept intentionally small.

### Color

- **Canvas is warm off-white** (`#fefcf8`), not pure white. Surface and raised
  surface step up to `#fffefb` and `#ffffff`.
- **Three semantic roles only:** neutral (stone), primary (emerald), danger
  (red). Every component accepts `color: neutral | primary | danger`. Warning
  (amber) exists but is reserved for toasts.
- **Brand color is deep emerald** (`emerald-900` in light mode) — not the bright
  mint in the logo. The logo gradient is for the wordmark only; the UI stays
  deep and grounded.
- **Dark mode flips intensity:** `emerald-600` becomes the brand, stone-950 the
  canvas. Muted text is `stone-400/500`.
- No blue, no purple, no gradients anywhere in components. The logo gradient
  (mint) is the only gradient in the entire system.

### Spacing

4px grid. `xs 4 · sm 8 · md 16 · lg 24 · xl 40`. Sizes for interactive elements
scale `xs 24 · sm 32 · md 40 · lg 48 · xl 56` (px heights).

### Corner radii — four tiers, no in-between

`rect 0` for inputs · `float 4px` for ghost/link/tooltips · `auto 8px` for
buttons/cards/dialogs · `pill 999px` for badges/switches. **Do not invent values
between tiers** — if none fit, revisit the classification.

### Backgrounds

Flat warm off-white. No images, no hand-drawn illustrations, no repeating
patterns, no full-bleed photography, no gradients on surfaces. The logo wordmark
is the only ornament.

### Shadow — three soft, warm-tinted tiers

- `sm`: `0 2px 8px rgba(24, 33, 29, 0.06)`
- `md`: `0 8px 24px rgba(24, 33, 29, 0.10)`
- `lg`: `0 18px 40px rgba(24, 33, 29, 0.12)`

Shadows read as lift, never as drama. No inset shadows. No hard shadows.

### Borders

1px, `--ui-color-border` (stone-200) for dividers and cards; `-border-strong`
(stone-300) for inputs. Borders are the default container affordance — prefer
a border to a shadow for most surfaces.

### Hover / press / focus

- **Hover:** background darkens ~8% via `color-mix(in srgb, base 8%, transparent)`.
  Never hardcode `rgba()`.
- **Press (active):** darkens ~14% **and** `translateY(1px)`. Tiny, tactile.
- **Disabled:** `opacity: 0.56`, `cursor: not-allowed`. Applied via
  `[data-disabled="true"]`, never inline style.
- **Focus:** keyboard only (`:focus-visible`). Double `box-shadow` — 2px surface
  gap + 2px emerald focus ring. Never `outline` or `border` (breaks with
  `border-radius`).
- **Loading:** text becomes `color: transparent` and a centered spinner
  overlays.

### Animation

Sparse and short.

| Scene | Duration | Easing |
| --- | --- | --- |
| Interactive (bg/color/shadow/transform) | 140ms | ease |
| Overlay enter | 160ms | `cubic-bezier(0.22, 1, 0.36, 1)` |
| Overlay exit | 160ms | ease |
| Link underline expand | 260ms | ease (clip-path) |
| Spinner | 0.9s | linear infinite |

Respect `prefers-reduced-motion`: spinner slows to 1.8s; overlays drop transform
and keep opacity only; interactive transitions vanish.

### Transparency & blur

Minimal. `color-mix` for subtle tints on hover/selection. No backdrop-filter.
No glassmorphism.

### Cards

Border (`1px solid var(--ui-color-border)`), `--ui-radius-auto` (8px), surface
background, no shadow by default. Shadow is opt-in for floating surfaces
(dialogs, popovers, toasts).

### Layout

- Hero section: centered, max-width ~640px, generous vertical padding (80px
  top). A 44×2px horizontal rule under the h1 is a recurring motif.
- Section headers: tiny uppercase eyebrow, centered.
- Dense component rows: flex with `gap: 10px`, thin 1×20px dividers between
  groups.

---

## ICONOGRAPHY

**System:** Tabler Icons, wrapped via `@deweyou-design/react-icons`. All icons
normalized to `square` linecap and `miter` linejoin (Tabler's default is `round`
— Deweyou flattens this to match the serif / right-angle aesthetic).

**Default props:** `size='1em'`, `stroke=1.5`. Outline style only, no filled
glyphs.

**Curated set (30 icons):** AlertCircle, AlertTriangle, ArrowLeft, ArrowRight,
Bell, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Copy, Download,
Edit, ExternalLink, Eye, EyeOff, Filter, Home, Info, Loader2, Menu2, Minus,
Plus, Refresh, Search, Settings, Trash, Upload, User, X.

Consumers can wrap any other Tabler icon via `createTablerIcon(IconXxx)`.

**In this design system:** we reference Tabler Icons from CDN
(`@tabler/icons@3.x`) so you don't need to install anything. Usage:

```html
<i class="ti ti-plus"></i>
```

**Emoji:** never. **Unicode symbols as icons:** never, except the `·` separator.
**PNG icons:** never — all icons are stroked SVG.

**Logos:** `assets/logo.svg` (full mint-gradient wordmark) and
`assets/logo-animated.svg` (same wordmark with stroke-draw animation). Use the
static version in UI headers; reserve the animated version for hero / loading
moments.

---

## Index

```
/
├── README.md                 this file
├── SKILL.md                  skill manifest for Claude Code compatibility
├── colors_and_type.css       drop-in CSS with all tokens + base styles
├── assets/
│   ├── logo.svg              mint-gradient wordmark (static)
│   └── logo-animated.svg     mint-gradient wordmark (stroke draw)
├── fonts/
│   └── LICENSE.txt           Adobe / Source Han Serif license
├── preview/                  design-system cards (Type / Colors / Spacing / Components / Brand)
└── ui_kits/
    └── website/              recreation of design.deweyou.me homepage
```

---

## Caveats

- **Font substitution.** The repo ships licensed `SourceHanSerifCN-*.otf` files;
  the GitHub importer cannot pull them. We substitute **Noto Serif SC** from
  Google Fonts — same Adobe/Google pan-CJK serif family, visually very close.
  Swap in the original OTFs to match pixel-for-pixel.
- **Icons** are linked from the Tabler CDN rather than imported from the repo
  (the repo exposes them as a React package; CDN is simpler for static HTML).
- Full palette in the source has **26 families × 11 steps (286 swatches)**; this
  system only surfaces stone/emerald/red because those are the only semantic
  roles. The rest are reachable as `var(--ui-color-palette-<family>-<step>)` if
  hand-rolled.
