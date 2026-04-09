# Clarify Step

Identify underspecified areas in the current feature spec by asking up to 5 highly targeted clarification questions and encoding answers back into the spec.

Note: This step is expected to run BEFORE the plan step. If the user explicitly states they are skipping clarification, proceed but warn that downstream rework risk increases.

## Pre-Execution

Run `knowledge/.scripts/bash/check-prerequisites.sh --json --paths-only` from repo root **once**. Parse fields:
- `FEATURE_DIR`
- `FEATURE_SPEC`

If JSON parsing fails, abort and instruct user to re-run the specify step or verify feature branch environment.

## Outline

1. Load the current spec file. Perform a structured ambiguity & coverage scan using this taxonomy. For each category, mark status: Clear / Partial / Missing. Produce an internal coverage map used for prioritization (do not output raw map unless no questions will be asked).

   Functional Scope & Behavior:
   - Core user goals & success criteria
   - Explicit out-of-scope declarations
   - User roles / personas differentiation

   Domain & Data Model:
   - Entities, attributes, relationships
   - Identity & uniqueness rules
   - Lifecycle/state transitions
   - Data volume / scale assumptions

   Interaction & UX Flow:
   - Critical user journeys / sequences
   - Error/empty/loading states
   - Accessibility or localization notes

   Non-Functional Quality Attributes:
   - Performance (latency, throughput targets)
   - Scalability (horizontal/vertical, limits)
   - Reliability & availability (uptime, recovery expectations)
   - Observability (logging, metrics, tracing signals)
   - Security & privacy (authN/Z, data protection, threat assumptions)
   - Compliance / regulatory constraints (if any)

   Integration & External Dependencies:
   - External services/APIs and failure modes
   - Data import/export formats
   - Protocol/versioning assumptions

   Edge Cases & Failure Handling:
   - Negative scenarios
   - Rate limiting / throttling
   - Conflict resolution (e.g., concurrent edits)

   Constraints & Tradeoffs:
   - Technical constraints (language, storage, hosting)
   - Explicit tradeoffs or rejected alternatives

   Terminology & Consistency:
   - Canonical glossary terms
   - Avoided synonyms / deprecated terms

   Completion Signals:
   - Acceptance criteria testability
   - Measurable Definition of Done style indicators

   Misc / Placeholders:
   - TODO markers / unresolved decisions
   - Ambiguous adjectives ("robust", "intuitive") lacking quantification

   For each category with Partial or Missing status, add a candidate question opportunity unless:
   - Clarification would not materially change implementation or validation strategy
   - Information is better deferred to planning phase (note internally)

2. Generate (internally) a prioritized queue of candidate clarification questions (maximum 5). Do NOT output them all at once. Apply these constraints:
   - Maximum of 5 total questions across the whole session.
   - Each question must be answerable with EITHER:
     - A short multiple-choice selection (2–5 distinct, mutually exclusive options), OR
     - A one-word / short-phrase answer (explicitly constrain: "Answer in <=5 words").
   - Only include questions whose answers materially impact architecture, data modeling, task decomposition, test design, UX behavior, operational readiness, or compliance validation.
   - Ensure category coverage balance: attempt to cover the highest impact unresolved categories first.
   - Exclude questions already answered, trivial stylistic preferences, or plan-level execution details.
   - If more than 5 categories remain unresolved, select the top 5 by (Impact × Uncertainty) heuristic.

3. Sequential questioning loop (interactive):
   - Present EXACTLY ONE question at a time.
   - For multiple-choice questions:
     - **Analyze all options** and determine the **most suitable option** based on: best practices for the project type, common patterns in similar implementations, risk reduction, alignment with explicit project goals.
     - Present your **recommended option prominently** at the top with clear reasoning (1-2 sentences).
     - Format as: `**Recommended:** Option [X] - <reasoning>`
     - Then render all options as a Markdown table:

     | Option | Description |
     | ------ | ----------- |
     | A      | <Option A description> |
     | B      | <Option B description> |
     | Short  | Provide a different short answer (<=5 words) |

     - After the table, add: `You can reply with the option letter, accept the recommendation by saying "yes" or "recommended", or provide your own short answer.`

   - For short-answer style:
     - Provide your **suggested answer** based on best practices and context.
     - Format as: `**Suggested:** <your proposed answer> - <brief reasoning>`
     - Then output: `Format: Short answer (<=5 words). You can accept the suggestion by saying "yes", or provide your own answer.`

   - After the user answers:
     - If the user replies "yes", "recommended", or "suggested", use your previously stated recommendation/suggestion.
     - Otherwise validate the answer maps to one option or fits the <=5 word constraint.
     - Once satisfactory, record it in working memory and move to the next queued question.

   - Stop asking further questions when:
     - All critical ambiguities resolved early, OR
     - User signals completion ("done", "good", "no more"), OR
     - You reach 5 asked questions.

4. Integration after EACH accepted answer (incremental update approach):
   - Maintain in-memory representation of the spec.
   - For the first integrated answer in this session:
     - Ensure a `## Clarifications` section exists (create it just after the highest-level contextual section if missing).
     - Under it, create (if not present) a `### Session YYYY-MM-DD` subheading for today.
   - Append a bullet line immediately after acceptance: `- Q: <question> → A: <final answer>`.
   - Then immediately apply the clarification to the most appropriate section(s):
     - Functional ambiguity → Update or add a bullet in Functional Requirements.
     - User interaction / actor distinction → Update User Stories or Actors subsection.
     - Data shape / entities → Update Data Model (add fields, types, relationships).
     - Non-functional constraint → Add/modify measurable criteria in Success Criteria.
     - Edge case / negative flow → Add a new bullet under Edge Cases / Error Handling.
     - Terminology conflict → Normalize term across spec.
   - If the clarification invalidates an earlier ambiguous statement, replace it instead of duplicating.
   - Save the spec file AFTER each integration.
   - Preserve formatting: do not reorder unrelated sections; keep heading hierarchy intact.

5. Validation (performed after EACH write plus final pass):
   - Clarifications session contains exactly one bullet per accepted answer (no duplicates).
   - Total asked (accepted) questions ≤ 5.
   - Updated sections contain no lingering vague placeholders.
   - No contradictory earlier statement remains.
   - Markdown structure valid; only allowed new headings: `## Clarifications`, `### Session YYYY-MM-DD`.

6. Write the updated spec back to FEATURE_SPEC.

7. Report completion:
   - Number of questions asked & answered.
   - Path to updated spec.
   - Sections touched (list names).
   - Coverage summary table listing each taxonomy category with Status: Resolved / Deferred / Clear / Outstanding.
   - If any Outstanding or Deferred remain, recommend whether to proceed to plan step or run clarify again.

## Behavior Rules

- If no meaningful ambiguities found, respond: "No critical ambiguities detected worth formal clarification." and suggest proceeding.
- If spec file missing, instruct user to run the specify step first.
- Never exceed 5 total asked questions.
- Respect user early termination signals ("stop", "done", "proceed").
