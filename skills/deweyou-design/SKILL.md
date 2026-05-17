---
name: deweyou-design
description: Use this skill to generate well-branded interfaces and assets for Deweyou Design (Dewey Ou's personal design system), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping. For web production code, complex components are built on Ark UI primitives with Deweyou tokens layered on top.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy
assets out and create static HTML files for the user to view. If working on
production code, follow the guidelines below — especially the Ark UI section for
web targets.

If the user invokes this skill without any other guidance, ask them what they
want to build or design, ask some questions, and act as an expert designer who
outputs HTML artifacts _or_ production code, depending on the need.

## What's here

- `README.md` — brand story, tone, visual foundations, iconography.
- `colors_and_type.css` — drop-in CSS with every token (palette, semantic
  colors, fonts, radii, shadow, spacing, sizing) and a sensible base reset.
  Import it in any HTML file and you're 90% done.
- `assets/` — the Dewey Ou wordmark (static + animated).
- `fonts/` — license info. Fonts load from Google Fonts via `@import` in the
  CSS (Noto Serif SC — a stand-in for Source Han Serif CN).
- `preview/` — small HTML cards demoing each token set and component.
- `ui_kits/website/` — working React recreation of `design.deweyou.me`, with
  Button, Input, Select, Switch, Checkbox, Badge, Spinner, Popover, Menu,
  Tabs, Toast. Use as visual reference; for production, wrap Ark UI instead.

## Web production: Ark UI as the component primitive

For web apps (React), **do not reimplement complex component behavior from
scratch.** Use [Ark UI](https://ark-ui.com) as the headless primitive layer and
apply Deweyou Design tokens and styles on top. This is how the source repo
(`deweyou/design`) is built.

**Why Ark UI:** it handles the hard parts — keyboard navigation, ARIA, focus
management, portal rendering, animation state — so you only write styles.

### Which components use Ark UI

Use Ark UI primitives for anything with non-trivial interaction:

| Component | Ark UI primitive |
|-----------|-----------------|
| Popover | `@ark-ui/react/popover` |
| Dialog / Modal | `@ark-ui/react/dialog` |
| Select / Combobox | `@ark-ui/react/select` or `combobox` |
| Menu / DropdownMenu | `@ark-ui/react/menu` |
| Tabs | `@ark-ui/react/tabs` |
| Toast | `@ark-ui/react/toast` |
| Switch | `@ark-ui/react/switch` |
| Checkbox | `@ark-ui/react/checkbox` |
| Accordion | `@ark-ui/react/accordion` |
| Tooltip | `@ark-ui/react/tooltip` |

Simple components (Button, Badge, Spinner, Input, Card) need no primitive —
implement directly with Deweyou tokens.

### Wrapping pattern

Wrap Ark UI's unstyled parts and apply `colors_and_type.css` tokens via CSS
Modules or a `<style>` block. Keep the Ark UI data attributes (`data-state`,
`data-disabled`, `data-highlighted`) as styling hooks — do not duplicate their
logic in JS.

```tsx
// Example: Popover wrapping Ark UI
import { Popover } from '@ark-ui/react/popover'
import styles from './Popover.module.css'

export function DyPopover({ trigger, children }) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Popover.Positioner>
        <Popover.Content className={styles.content}>
          {children}
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  )
}
```

```css
/* Popover.module.css — tokens from colors_and_type.css */
.content {
  background: var(--ui-color-surface-raised);
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-auto);
  box-shadow: var(--ui-shadow-md);
  padding: var(--ui-space-md);
  font-family: var(--ui-font-body);
}
```

### Installation (web projects)

```bash
pnpm add @ark-ui/react
```

Ark UI is unstyled and framework-agnostic — it adds no visual opinions. All
Deweyou visual rules (colors, radii, shadows, typography, motion) still apply
exactly as documented in `README.md`.

### Ark UI MCP server

The Ark UI MCP server gives coding agents direct access to component APIs,
usage examples, and styling guides without browsing docs manually.

**Setup (Claude Code):**
```bash
claude mcp add ark-ui -- npx -y @ark-ui/mcp
```

**Available tools via MCP:**
- `list_components` — all available components
- `list_examples` — component usage examples
- `get_example` — retrieve specific code examples
- `styling_guide` — data attributes and CSS variables for a component

When implementing a component backed by Ark UI, use the MCP tools to fetch the
correct API and styling hooks before writing code — this avoids guessing at
prop names or data attributes.

## Rules of thumb

1. **Serif everywhere.** Song/serif for all body + display. System-ui
   **only** for small uppercase eyebrows / micro-labels.
2. **Three semantic colors.** neutral (stone) · primary (emerald) · danger
   (red). Don't reach for blue, purple, or invent a fourth. The full palette
   is there for consumption through these three roles.
3. **Warm off-white canvas** (`#fefcf8`) — never pure white.
4. **Four radii, no in-between.** `rect 0 · float 4 · auto 8 · pill 999`.
5. **Borders > shadows.** Cards use a 1px border by default; shadow only on
   floating surfaces (dialogs, popovers, toasts).
6. **Motion is 140ms ease.** Overlays 160ms cubic-bezier(0.22, 1, 0.36, 1).
   Press adds `translateY(1px)`.
7. **No emoji. No gradients** (except the logo wordmark). **No hero images.**
   The design trades ornament for typographic precision.
8. **Chinese copy is primary**, matter-of-fact, no hype. Inline English
   technical terms. `·` is the house separator.
9. **Icons:** Tabler Icons, stroke 1.5, `square` linecap, `miter` linejoin.
   Outline only.
10. **Complex components = Ark UI + Deweyou tokens.** Never reimplement
    keyboard handling, ARIA, or focus trapping by hand.
