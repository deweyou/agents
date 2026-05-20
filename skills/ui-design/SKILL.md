---
name: ui-design
description: >
  Use this skill whenever Dewey asks to research, design, implement, refine, or
  review UX/UI across web, component libraries, H5/mobile screens, iOS/Android
  apps, HarmonyOS apps, WeChat/Alipay mini programs, macOS apps, dashboards,
  tools, landing pages, or Sleek prompts. This skill has two layers: practical
  UX/UI quality and project design contracts such as `DESIGN.md`. Trigger for flow,
  interaction, usability, onboarding, settings, editor, list, search, sharing,
  empty state, "别人怎么做", "有没有 UX 参考", "这个流程顺不顺", "审一下体验",
  "帮我设计这个交互", as well as personal-style phrases such as "我的风格",
  "Dewey 的设计风格", "专属于我风格", "帮我设计", "优化 UI", "审一下界面",
  "做个移动端/H5", "鸿蒙", "HarmonyOS", "小程序", "微信小程序",
  "支付宝小程序", "mac app", "生成 Sleek prompt", "组件库风格", or English
  phrases such as "UX pattern research", "review this flow", "Dewey interface",
  and "UI design". Start with UX structure and interaction quality when the
  request is about flow or usability; apply the relevant `DESIGN.md` only when
  the user asks for a visual style, interface taste, component-library fidelity,
  visual design, implementation, or review against a design system.
---

# UI Design

Use this skill as Dewey's general UX/UI design workflow. It covers both
practical interface quality and project-level design contracts, but those layers
are not the same thing:

- UX/UI quality decides whether the flow, interaction, states, platform behavior,
  and implementation are clear and usable.
- `DESIGN.md` decides whether the surface follows the product's chosen visual
  system and component taste.

Solve the experience first, then the interface structure, then the design
contract. Do not let visual style override usability.

## Reference Map

Read only the references needed for the task:

| Reference | Use when |
| --- | --- |
| `references/ux-pattern-research-playbook.md` | The user asks how other products solve a flow, asks for UX references, or the answer depends on existing patterns. |
| `references/interface-quality-playbook.md` | Designing or reviewing flows, states, accessibility, information hierarchy, responsive behavior, or practical UX/UI quality. |
| `references/design-md-workflow.md` | The task involves project style, Dewey's style, visual direction, design-system persistence, `DESIGN.md`, component taste, tokens, typography, color, density, copy, or Sleek prompts. |
| `references/ai-design-tool-playbook.md` | The user asks for Sleek prompts, AI-generated mobile app screens, design variations, generated-screen review, or implementation handoff from generated designs. |
| `references/platform-implementation-playbook.md` | The task targets web, H5/mobile web, native mobile, HarmonyOS, mini programs, macOS, component libraries, or implementation verification. |
| `references/component-library-snapshot.md` | Working with Dewey's React component library or needing current component-system facts. |
| `references/design-tokens.css` | Building standalone prototypes or examples that need portable CSS tokens. |

If the host repository has newer or more specific UI rules, follow the host
repository first and use these references as portable fallback guidance.

## Mode Selection

Choose the mode before designing. Use multiple modes in order when needed.

### UX Pattern Research

Use when the user asks "别人怎么做", asks for UX references, asks not to design
from scratch, or when comparable products/platform conventions could change the
answer.

Read `references/ux-pattern-research-playbook.md`. Inspect references before
proposing a solution. If browsing, screenshots, or product access are
unavailable, state the limitation and mark the recommendation as lower
confidence.

### UX Flow / Interaction Design

Use when the task is about onboarding, settings, editor flows, lists, search,
sharing, empty states, permission/login blockers, error recovery, or whether a
flow feels smooth.

Read `references/interface-quality-playbook.md`. Output the flow, state model,
recovery paths, copy notes, and acceptance criteria before visual styling.

### UI Visual Design

Use when the user asks for visual design, Dewey's style, component-library
fidelity, project `DESIGN.md`, page layout, visual hierarchy, tokens,
typography, color, or a design prompt.

Read `references/design-md-workflow.md`, then read the relevant `DESIGN.md`
according to that workflow. If the visual work also changes user flow or
interaction, handle UX structure first.

### Implementation / Prototype

Use when editing UI code, building a prototype, generating a Sleek prompt, or
working in a platform-specific stack.

Read `references/platform-implementation-playbook.md`. For web or component
library work, also read `references/component-library-snapshot.md` when relevant.
For Sleek or another AI design tool, read
`references/ai-design-tool-playbook.md`.

### Review

Use when the user asks to review UI, UX, flow, accessibility, visual style, or
implementation quality.

Lead with concrete findings. Prioritize flow clarity, accessibility, interaction
states, layout, token/style drift, and implementation risks. Cite file/line
references when files are available.

## Operating Workflow

1. Classify the request: UX research, flow/interaction design, visual design,
   implementation/prototype, review, or a combination.
2. Identify the platform and surface: web component, website page,
   dashboard/tool, H5/mobile web, iOS/Android, HarmonyOS, mini program, macOS,
   landing page, Sleek prompt, or review.
3. Identify the user's real workflow: what must be scanned, compared, edited,
   selected, confirmed, recovered from, or remembered.
4. Read the minimal relevant references from the map above.
5. Resolve UX structure before visual styling when both are involved.
6. Add states: empty, loading, error, success, disabled, selected, focus, hover,
   press, permission/login blockers, and destructive confirmations when relevant.
7. Apply the relevant `DESIGN.md` only when requested or when the task is
   explicitly about visual style, design-system fidelity, or interface taste.
8. If using an AI design tool, preserve generated visual evidence and inspect the
   generated structure before implementation.
9. If implementing, verify in the browser or relevant renderer whenever
   possible.

For ambiguous requests, make a conservative assumption and proceed. Ask only
when the target product, platform, or output artifact is genuinely unclear.

## Output Patterns

For UX pattern research:

```text
UX question
References inspected
Common patterns
Useful differences
What to borrow
What to avoid
Recommended flow
States to cover
```

For UX flow or interaction design:

```text
Recommended flow
Page or component structure
User actions
State model
Recovery paths
Copy notes
Acceptance criteria
What can wait
```

For visual design plans:

```text
Surface and workflow
Hierarchy
Component map
Token and style decisions
Responsive and state checks
Implementation notes
```

For reviews:

- Start with findings ordered by severity.
- Explain why each issue matters.
- Give a concrete fix direction.
- Mention verification gaps when relevant.

For implementation:

- Edit the relevant files directly.
- Start a local dev server when the app needs one.
- Use browser verification for significant visual changes.

## Boundaries

- Do not use this skill for unrelated backend/debugging tasks just because a UI
  word appears.
- Do not impose Dewey's restrained style when the user explicitly requests a
  different visual direction, unless they ask to reconcile that direction with
  Dewey's `DESIGN.md`.
- Use `product-design` when the question becomes product positioning, feature
  priority, market fit, or version scope rather than interface behavior.
