# Specify Step

Generate the feature specification. The branch and feature directory have already been created by the harness-dev orchestrator.

## Context

The feature description is provided by the harness-dev orchestrator as the original user input.

## Pre-Execution

Run `knowledge/.scripts/bash/check-prerequisites.sh --json --paths-only` from repo root to get FEATURE_DIR and FEATURE_SPEC. Abort if either is missing.

## Outline

1. Load `knowledge/.scripts/templates/spec-template.md` to understand required sections.

2. Follow this execution flow:
   1. Parse the feature description from orchestrator context.
      If empty: ERROR "No feature description provided"
   2. Extract key concepts from description.
      Identify: actors, actions, data, constraints.
   3. For unclear aspects:
      - Make informed guesses based on context and industry standards.
      - Only mark with [NEEDS CLARIFICATION: specific question] if:
        - The choice significantly impacts feature scope or user experience
        - Multiple reasonable interpretations exist with different implications
        - No reasonable default exists
      - **LIMIT: Maximum 3 [NEEDS CLARIFICATION] markers total**
      - Prioritize clarifications by impact: scope > security/privacy > user experience > technical details
   4. Fill User Scenarios & Testing section.
      If no clear user flow: ERROR "Cannot determine user scenarios"
   5. Generate Functional Requirements.
      Each requirement must be testable.
      Use reasonable defaults for unspecified details (document assumptions in Assumptions section).
   6. Define Success Criteria.
      Create measurable, technology-agnostic outcomes.
      Include both quantitative metrics and qualitative measures.
      Each criterion must be verifiable without implementation details.
   7. Identify Key Entities (if data involved).
   8. Return: SUCCESS (spec ready for planning)

3. Write the specification to FEATURE_SPEC using the template structure, replacing placeholders with concrete details derived from the feature description while preserving section order and headings.

4. **Specification Quality Validation**: After writing the initial spec, validate it against quality criteria:

   a. **Create Spec Quality Checklist**: Generate a checklist file at `FEATURE_DIR/checklists/requirements.md`:

   ```markdown
   # Specification Quality Checklist: [FEATURE NAME]

   **Purpose**: Validate specification completeness and quality before proceeding to planning
   **Created**: [DATE]
   **Feature**: [Link to spec.md]

   ## Content Quality

   - [ ] No implementation details (languages, frameworks, APIs)
   - [ ] Focused on user value and business needs
   - [ ] Written for non-technical stakeholders
   - [ ] All mandatory sections completed

   ## Requirement Completeness

   - [ ] No [NEEDS CLARIFICATION] markers remain
   - [ ] Requirements are testable and unambiguous
   - [ ] Success criteria are measurable
   - [ ] Success criteria are technology-agnostic (no implementation details)
   - [ ] All acceptance scenarios are defined
   - [ ] Edge cases are identified
   - [ ] Scope is clearly bounded
   - [ ] Dependencies and assumptions identified

   ## Feature Readiness

   - [ ] All functional requirements have clear acceptance criteria
   - [ ] User scenarios cover primary flows
   - [ ] Feature meets measurable outcomes defined in Success Criteria
   - [ ] No implementation details leak into specification

   ## Notes

   - Items marked incomplete require spec updates before clarify or plan steps
   ```

   b. **Run Validation Check**: Review the spec against each checklist item.
   - For each item, determine if it passes or fails.
   - Document specific issues found (quote relevant spec sections).

   c. **Handle Validation Results**:
   - **If all items pass**: Mark checklist complete and proceed to step 5.

   - **If items fail (excluding [NEEDS CLARIFICATION])**:
     1. List the failing items and specific issues.
     2. Update the spec to address each issue.
     3. Re-run validation until all items pass (max 3 iterations).
     4. If still failing after 3 iterations, document remaining issues in checklist notes and warn user.

   - **If [NEEDS CLARIFICATION] markers remain**:
     1. Extract all [NEEDS CLARIFICATION: ...] markers from the spec.
     2. **LIMIT CHECK**: If more than 3 markers exist, keep only the 3 most critical and make informed guesses for the rest.
     3. For each clarification needed (max 3), present options to user in this format:

        ```markdown
        ## Question [N]: [Topic]

        **Context**: [Quote relevant spec section]

        **What we need to know**: [Specific question from NEEDS CLARIFICATION marker]

        **Suggested Answers**:

        | Option | Answer                    | Implications                          |
        | ------ | ------------------------- | ------------------------------------- |
        | A      | [First suggested answer]  | [What this means for the feature]     |
        | B      | [Second suggested answer] | [What this means for the feature]     |
        | C      | [Third suggested answer]  | [What this means for the feature]     |
        | Custom | Provide your own answer   | [Explain how to provide custom input] |

        **Your choice**: _[Wait for user response]_
        ```

     4. Number questions sequentially (Q1, Q2, Q3 — max 3 total).
     5. Present all questions together before waiting for responses.
     6. Wait for user to respond with their choices.
     7. Update the spec by replacing each [NEEDS CLARIFICATION] marker with the user's answer.
     8. Re-run validation after all clarifications are resolved.

   d. **Update Checklist**: After each validation iteration, update the checklist file with current pass/fail status.

5. Report completion with spec file path, checklist results, and readiness for the next phase.

## Guidelines

- Focus on **WHAT** users need and **WHY**. Avoid HOW to implement (no tech stack, APIs, code structure).
- Written for business stakeholders, not developers.
- **Mandatory sections** must be completed for every feature; remove optional sections that don't apply.

### For AI Generation

1. **Make informed guesses**: Use context, industry standards, and common patterns to fill gaps.
2. **Document assumptions**: Record reasonable defaults in the Assumptions section.
3. **Limit clarifications**: Maximum 3 [NEEDS CLARIFICATION] markers.
4. **Prioritize**: scope > security/privacy > user experience > technical details.
5. **Think like a tester**: Every vague requirement should fail the "testable and unambiguous" checklist item.

### Success Criteria Guidelines

Success criteria must be measurable, technology-agnostic, user-focused, and verifiable.

**Good examples**:
- "Users can complete checkout in under 3 minutes"
- "System supports 10,000 concurrent users"
- "95% of searches return results in under 1 second"

**Bad examples** (implementation-focused):
- "API response time is under 200ms" → use "Users see results instantly"
- "React components render efficiently" → framework-specific, not allowed
