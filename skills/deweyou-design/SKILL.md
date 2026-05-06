---
name: deweyou-design
version: 1.0.0
description: Use this skill to generate well-branded interfaces and assets for Deweyou Design (Dewey Ou's personal design system), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy
assets out and create static HTML files for the user to view. If working on
production code, you can copy assets and read the rules here to become an
expert in designing with this brand.

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
  Tabs, Toast. Copy components out as needed.

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
