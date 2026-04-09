# Archive Step

Synthesize the completed feature into a durable record, then selectively promote generalizable learnings back to the shared knowledge base.

**This is the most important step for long-term value.** It transforms ephemeral feature work into reusable institutional knowledge. Do not skip it even if the user seems done.

## Pre-Execution

Determine BRANCH_NAME from the current git branch:
```bash
git branch --show-current
```

Verify the feature directory exists:
```bash
ls knowledge/specs/BRANCH_NAME/ 2>/dev/null || echo "MISSING"
```

If MISSING, ask the user to confirm the correct feature path before proceeding.

## Step 1 — Read all feature artifacts

Load the following files in full:
- `knowledge/specs/BRANCH_NAME/spec.md` — original requirements and acceptance criteria
- `knowledge/specs/BRANCH_NAME/plan.md` — architecture decisions and constitution compliance
- `knowledge/specs/BRANCH_NAME/tasks.md` — completed task list
- All files in `knowledge/specs/BRANCH_NAME/checklists/` (if any)

Also load `knowledge/constitution.md` to understand existing principles before writing new ones.

## Step 2 — Write archive.md

Copy the archive template:
```bash
cp knowledge/.scripts/templates/archive-template.md knowledge/specs/BRANCH_NAME/archive.md
```

Fill in each section of `knowledge/specs/BRANCH_NAME/archive.md` with genuine, specific content. Do not write generic summaries — every sentence should be something that could not be inferred from reading the spec or plan alone.

### Delivery Summary

Answer three questions concisely:
1. **What was built?** (1-3 sentences, non-technical, outcome-focused)
2. **Why does it matter?** (user value or business impact)
3. **What was the actual scope vs. original plan?** (anything added, cut, or deferred — and why)

Example of a good delivery summary:
> Added a dark-mode toggle to the settings panel. Users can now switch themes persistently across sessions. Deferred auto-detection of system preference (OS-level media query) to a follow-up — the required browser API had inconsistent behavior in the target environments.

Example of a bad delivery summary:
> Implemented the feature as specified. All tasks were completed successfully.

### Key Decisions

Create a table of every non-obvious technical decision made during this feature. A "decision" is anything where multiple reasonable options existed and a choice was made. Obvious choices (e.g., "used TypeScript because the project uses TypeScript") do not belong here.

| Decision | Options Considered | Choice Made | Rationale |
|---|---|---|---|
| State persistence layer | localStorage / cookie / sessionStorage | localStorage | Survives tab close; no server round-trip needed; small payload |
| Toggle placement | Header / Settings panel / Floating button | Settings panel | Consistent with existing preference patterns; avoids layout shift |

Include decisions about:
- Architecture trade-offs (where performance, simplicity, or maintainability pulled in different directions)
- Library or API choices (especially if alternatives were evaluated)
- Scope calls (what was explicitly excluded and why)
- Constitution compliance judgments (any principle that required interpretation)

### Pitfalls

Document non-obvious problems encountered during implementation, with enough context to help a future developer avoid or recognize the same issue faster.

For each pitfall:
- **What happened**: The specific failure or surprise
- **Why it was non-obvious**: What made it hard to predict
- **How it was resolved**: The actual fix or workaround
- **Signal to watch for**: An early indicator that this pitfall is occurring again

Do not document things that are obvious from the code, obvious from the docs, or obvious from the error message. A pitfall is worth archiving only if a competent developer could reasonably spend >30 minutes on it.

Example:
> **CSS custom property inheritance across Shadow DOM boundaries**
> Problem: Design tokens defined on `:root` were not applying inside web components.
> Why non-obvious: The pattern works in regular DOM; Shadow DOM encapsulation is easy to forget.
> Resolution: Redefined tokens on the `:host` selector inside each component's shadow root.
> Signal: Styles that work in Storybook but break in the real app (Storybook renders in light DOM).

### Reusable Patterns

Extract patterns, utilities, or approaches from this feature that are worth reusing in future features. A pattern is reusable if:
- It solves a class of problems (not just this specific problem)
- It could be copied and adapted with minimal modification
- It represents a non-obvious design choice that took effort to arrive at

For each pattern, write it as a standalone reference — not "we did X", but "to achieve Y, do X":

> **Persistent user preference pattern**
> To persist a user preference (theme, locale, density, etc.) across sessions without a server round-trip:
> 1. Store in localStorage under a namespaced key: `app:preferences:${key}`
> 2. Read synchronously on app init before first render to avoid flash
> 3. Expose as a reactive signal so components subscribe, not poll
> 4. Sync to server lazily (debounce 2s) if the preference needs to be cross-device

If no genuinely reusable patterns emerged from this feature, write: "No reusable patterns identified — feature was too domain-specific."

### Constitution Feedback

Review `knowledge/constitution.md` and identify:
- **Gaps**: Situations this feature encountered that the constitution does not address
- **Ambiguities**: Principles that required interpretation — and what interpretation was used
- **Conflicts**: Principles that pulled in opposite directions — and how the tension was resolved
- **Corrections**: Anything the constitution says that turned out to be wrong or outdated

Write these as actionable feedback items. Each item should be specific enough that it can be directly incorporated into the constitution.

Example:
> **Gap — dark mode**: Constitution Section III covers visual hierarchy but says nothing about theming. Suggest adding: "All design tokens must support both light and dark variants. Token names must not encode color values (e.g., `--color-primary`, not `--color-blue`)."

If the constitution performed well and needed no updates, write: "Constitution adequate for this feature — no gaps, ambiguities, or corrections identified."

## Step 3 — Sync agent context

Run:
```bash
bash knowledge/.scripts/bash/update-agent-context.sh claude
```

This detects the tech stack from `plan.md` and syncs it into `CLAUDE.md` so future sessions have up-to-date context. It only adds new technology — manual additions are preserved.

## Step 4 — Selective knowledge promotion

For each significant finding in archive.md (pitfalls, patterns, constitution feedback), apply this judgment filter before writing anything to `knowledge/`:

> **Would this finding still be useful in 3 months? Could it help a future feature make a better decision or avoid a known trap?**

The bar is deliberately high. When in doubt, leave it in archive.md and do not promote.

### Promotion decision tree

```
For each finding:
      │
      ▼
  Would this be useful in 3+ months?
      │
      ├── NO ──→  Stay in archive.md only. Done.
      │
      └── YES ──→  Is it a reusable pattern, design rule, or API convention?
                        │
                        ├── YES ──→  Create a named topic file (see below)
                        │            + add a principle to constitution.md
                        │
                        └── NO ──→  Is it a genuine principle or architecture rule?
                                          │
                                          ├── YES ──→  Add to constitution.md only
                                          │
                                          └── NO ──→  Stay in archive.md only. Done.
```

### Creating a named topic file

Only create a topic file when the finding is substantial enough to stand alone as a reference document (typically 200+ words of actionable guidance).

1. Choose a descriptive filename: `knowledge/<topic>.md`
   - Good: `knowledge/design-tokens.md`, `knowledge/auth-flow.md`, `knowledge/persistent-preferences.md`
   - Bad: `knowledge/notes.md`, `knowledge/misc.md`, `knowledge/feature-123.md`

2. Write the topic file as a standalone reference — someone reading it should not need to read the feature archive to understand it:
   ```markdown
   # [Topic Name]

   ## Overview
   [One-paragraph summary of the pattern/rule/convention and when to use it]

   ## Usage
   [Concrete guidance, ideally with examples]

   ## When NOT to use
   [Important edge cases or anti-patterns]

   ## Background
   [Brief context — why this pattern exists, what problem it solves]
   _Discovered during: [BRANCH_NAME], [date]_
   ```

3. Add a pointer to `CLAUDE.md` under `## Harness Development`:
   ```markdown
   - **[Topic name]**: [knowledge/topic.md](knowledge/topic.md)
   ```

### Updating constitution.md

Only update `knowledge/constitution.md` when a finding represents a **genuine principle** — a durable rule that should govern future features. Do not append changelogs or per-feature summaries.

Add the principle to the appropriate existing section, or create a new named section if it doesn't fit anywhere:

```markdown
### [Principle Name]
[Declarative statement of the rule]
<!-- Example: CSS custom properties do not cross Shadow DOM boundaries; re-declare tokens on :host. -->
```

Write principles as declarative statements, not as observations:
- ✅ "CSS custom properties do not cross Shadow DOM boundaries; re-declare tokens on `:host`."
- ❌ "We discovered that CSS custom properties don't work in shadow DOM."

### Update spec index

Check whether `knowledge/specs/index.md` exists:

```bash
ls knowledge/specs/index.md 2>/dev/null || echo "MISSING"
```

**If MISSING — first-time migration:**

The index does not exist yet. Before adding the current feature, backfill all past specs so the index is complete. For each directory under `knowledge/specs/` that contains an `archive.md`:

1. Read its `archive.md` — extract the delivery date (from the archive header or git log) and the one-sentence delivery summary from the "Delivery Summary" section.
2. Append one line per past spec in chronological order (oldest first).

Then append the current feature's line last.

Create the file with this header:

```markdown
# Spec Index

Past feature archives. Read individual archive.md files for full details.

```

**If EXISTS — normal append:**

Append one line for the current feature only.

**In both cases**, the line format is:

```markdown
- [BRANCH_NAME](specs/BRANCH_NAME/archive.md) — YYYY-MM-DD — [one sentence: what was built]
```

**After writing the index**, scan `knowledge/constitution.md` and `CLAUDE.md` for any inline spec lists (e.g. a `## VII. Accumulated Learnings` changelog section, a `## Recent Changes` section, or a bullet list enumerating past feature branches). If found:

- Remove the inline list entirely.
- Add a single pointer in its place (or near the top of the relevant section):
  ```markdown
  > Past feature specs are indexed at [knowledge/specs/index.md](knowledge/specs/index.md).
  ```

This keeps agent context lean — the index is a lightweight reference loaded on demand, not automatically.

## Step 5 — Final summary

Show the user the completion summary:

```
✓ Feature archived: BRANCH_NAME

knowledge/specs/BRANCH_NAME/
├── spec.md         ✓
├── plan.md         ✓
├── tasks.md        ✓ (all completed)
├── checklists/     ✓
└── archive.md      ✓ (new)

knowledge/specs/index.md    ✓ (created + backfilled — if first time; otherwise entry appended)
knowledge/<topic>.md        ✓ (if promoted — otherwise omit this line)
knowledge/constitution.md   ✓ (principle added / inline spec list removed — if applicable)
CLAUDE.md                   ✓ (pointer added / inline spec list removed — if applicable)
```

Then prompt:
> Archive complete. Next steps:
> - Open a PR from `BRANCH_NAME` to merge the feature
> - Run `vp check` one final time if not already done
> - If any constitution gaps were identified, consider scheduling a constitution update session

## Quality bar for archive.md

Before marking the archive step done, check:
- [ ] Delivery summary answers all three questions (what, why, scope delta)
- [ ] Key decisions table has at least one row (or explicitly states "no non-obvious decisions")
- [ ] Each pitfall has all four fields (what, why non-obvious, resolution, signal)
- [ ] Reusable patterns are written as standalone guidance, not as observations
- [ ] Constitution feedback is specific enough to be directly incorporated
- [ ] No section says "N/A" — if it doesn't apply, write a one-sentence explanation of why
- [ ] knowledge/specs/index.md updated (backfilled from all past specs if newly created)
- [ ] constitution.md and CLAUDE.md checked — inline spec lists removed and replaced with index pointer if found
- [ ] constitution.md updated only if a genuine principle was identified (not a changelog entry)
- [ ] Agent context has been synced via update-agent-context.sh
