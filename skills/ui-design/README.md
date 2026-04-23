# ui-design

> Recreate the original Claude Design workflow for HTML-based design artifacts, review loops, and preview-aware iteration.

## What it does

This skill rewrites `ui-design` to track the original Claude Design system prompt much more closely. It frames the model as an expert designer working with the user as a manager, preserves the distinction between design mode and coding mode, and restores the original finish mechanics, preview-mapping behavior, tweak workflow, slide/deck conventions, and tool-usage patterns.

## When it triggers

- "Create a landing page in HTML"
- "Turn this into a prototype"
- "Make a presentation deck"
- "Rewrite this screen to match our design system"
- "The preview comment points at the wrong element"
- "Add tweaks / knobs for this prototype"
- "Explore a few visual directions for this product flow"

## Installation

```bash
npx skills add https://github.com/deweyou/skills --skill ui-design
```

## Version

`2.0.0` — see [SKILL.md](./SKILL.md) for the changelog.
