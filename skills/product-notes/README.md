# product-notes

> Turn evolving product ideas, iterations, decisions, insights, and reviews into a living product note system.

## What it does

`product-notes` helps agents classify product discussions before writing them
down. It first resolves the product notes root, which can be a repo directory,
Obsidian project folder, or another user-provided path, and persists that
location in a readable convention file when the user wants it remembered. It then
routes input into positioning notes, iteration specs, decision records, insight
notes, process notes, or iteration reviews.

## When it triggers

- "I have a new product idea"
- "Help me capture this product discussion"
- "整理产品文档", "沉淀这个想法", "写迭代文档"
- Product positioning changes
- Version or MVP scope planning
- Product or technical trade-off decisions
- User feedback, competitor observations, or release reviews
- Requests to use a custom product notes directory or Obsidian product folder

## Installation

```bash
npx skills add https://github.com/deweyou/agents --skill product-notes
```

## Source

This skill is maintained in `deweyou/agents` and indexed by `deweyou-cli agent update`.
