---
name: knowledge-archive
description: After completing a feature, fix, or refactor, check whether anything from the work is worth adding to the repository knowledge base. Use this skill when the user says they just finished something ("just shipped X", "PR merged", "done with this feature", "刚做完", "刚合了"), or when wrapping up a development branch. This is a lightweight habit check — it asks "did anything worth documenting come out of this?" and updates the knowledge base only when the answer is yes.
version: 1.0.0
---

# Knowledge Archive

A post-work habit check: after finishing a feature or change, scan what was done and decide whether anything is worth adding to the repository knowledge base.

This skill is intentionally lightweight. Most features produce nothing worth archiving. The goal is to catch the ones that do — and to build the habit of asking.

---

## Process

### Step 1 — Understand what was done

Gather context about the completed work. Accept any of:
- Git diff or commit range (e.g. `git diff main...HEAD`, a PR number)
- A spec or task description the user points to
- The user's verbal description of what changed

If nothing is provided, run:
```bash
git log --oneline main...HEAD 2>/dev/null || git log --oneline -10
git diff main...HEAD --stat 2>/dev/null || git diff HEAD~1 --stat
```

---

### Step 2 — Check what knowledge already exists

Read AGENTS.md (or CLAUDE.md) to understand the current knowledge base structure. Skim the relevant knowledge docs — you need to know what's already captured so you don't recommend duplicates.

---

### Step 3 — Evaluate archival value

Go through the changes and ask whether any of the following emerged:

| Worth archiving | Examples |
|-----------------|---------|
| A business rule or domain constraint that isn't obvious from code | "Orders can only be refunded within 30 days" |
| A design decision with a non-obvious reason | "We denormalize this field because the join was too slow at scale" |
| A module boundary or invariant that changed | "Payment service no longer owns order status — billing does now" |
| A pitfall the team hit that will recur | "Don't use X library for Y — it silently drops events under load" |
| A new concept that needs defining | "Soft delete vs hard delete means something specific in this codebase" |

**Not worth archiving:**
- Implementation details already visible in the code
- One-off fixes with no recurring pattern
- Anything that can be recovered reliably from reading the diff

---

### Step 4 — Act or close

**If there's something worth archiving**: hand off to `code-knowledge` update mode with the specific findings. Be concrete — tell it exactly which docs to update and what to add.

**If there's nothing worth archiving**: tell the user clearly. One sentence is enough: "Nothing from this change needs to go into the knowledge base." Don't invent reasons to update docs.

---

## Tone

Keep it fast. This is a quick check, not a deep audit. If you're spending more than a few minutes on Step 3, you're probably overthinking it.
