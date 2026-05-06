# Deweyou Design — Website UI kit

A high-fidelity recreation of **design.deweyou.me**, the component preview
site from the `deweyou/design` monorepo (`apps/website`).

## Files

- `index.html` — composed app, two routes: Home + Icons
- `kit.css` — component styles (maps to the repo's CSS Modules)
- `App.jsx` — root + router state
- `Button.jsx` — filled / outlined / ghost / link × neutral / primary / danger
- `Forms.jsx` — Input, Select, Switch, Checkbox, Badge, Spinner, Text
- `Overlays.jsx` — Popover, Menu, Tabs, Toast
- `Sections.jsx` — Navbar, Hero, DesignSection, IconsSection, Footer
- `IconsPage.jsx` — `/icons` route with search

## Interactive bits

- Click "Home" / "Icons" in the top nav to route.
- Tabs in the components section cycle through 4 panels.
- "打开 Popover" opens a popover; "打开菜单" opens a menu (selecting fires a toast).
- "触发 Toast" fires a success toast in the top-right.
- The `/icons` route has a working search filter.

## Cross-reference

- Source: `github.com/deweyou/design/tree/main/apps/website/src`
- Original uses Ark UI + CSS Modules + Less; we flatten to plain CSS + React
  state for portability. All visuals (sizes, tokens, colors, motion) are
  preserved.
