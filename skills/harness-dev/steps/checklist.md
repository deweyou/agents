# Checklist Step

Generate a custom checklist for the current feature based on user requirements.

**CRITICAL CONCEPT**: Checklists are **UNIT TESTS FOR REQUIREMENTS WRITING** — they validate the quality, clarity, and completeness of requirements in a given domain.

**NOT for verification/testing**:
- ❌ NOT "Verify the button clicks correctly"
- ❌ NOT "Test error handling works"
- ❌ NOT checking if code/implementation matches the spec

**FOR requirements quality validation**:
- ✅ "Are visual hierarchy requirements defined for all card types?" (completeness)
- ✅ "Is 'prominent display' quantified with specific sizing/positioning?" (clarity)
- ✅ "Are hover state requirements consistent across all interactive elements?" (consistency)

## Pre-Execution

Run `knowledge/.scripts/bash/check-prerequisites.sh --json` from repo root. Parse JSON for FEATURE_DIR and AVAILABLE_DOCS list. All file paths must be absolute.

## Execution Steps

1. **Clarify intent (dynamic)**: Derive up to THREE initial contextual clarifying questions. They MUST:
   - Be generated from the user's phrasing + extracted signals from spec/plan/tasks
   - Only ask about information that materially changes checklist content
   - Be skipped individually if already unambiguous

   Generation algorithm:
   1. Extract signals: feature domain keywords, risk indicators, stakeholder hints, explicit deliverables.
   2. Cluster signals into candidate focus areas (max 4) ranked by relevance.
   3. Identify probable audience & timing (author, reviewer, QA, release).
   4. Detect missing dimensions: scope breadth, depth/rigor, risk emphasis, exclusion boundaries.
   5. Formulate questions chosen from these archetypes:
      - Scope refinement
      - Risk prioritization
      - Depth calibration (lightweight pre-commit sanity list or formal release gate?)
      - Audience framing (author only or peers during PR review?)
      - Boundary exclusion

   Output the questions (label Q1/Q2/Q3). After answers: if ≥2 scenario classes remain unclear, you MAY ask up to TWO more targeted follow-ups (Q4/Q5). Do not exceed five total questions.

2. **Understand user request**: Combine any user arguments + clarifying answers:
   - Derive checklist theme (e.g., security, review, deploy, ux)
   - Consolidate explicit must-have items
   - Map focus selections to category scaffolding
   - Infer any missing context from spec/plan/tasks (do NOT hallucinate)

3. **Load feature context**: Read from FEATURE_DIR:
   - spec.md: Feature requirements and scope
   - plan.md (if exists): Technical details, dependencies
   - tasks.md (if exists): Implementation tasks

   Load only necessary portions relevant to active focus areas.

4. **Generate checklist** — Create "Unit Tests for Requirements":
   - Create `FEATURE_DIR/checklists/` directory if it doesn't exist
   - Generate unique checklist filename based on domain (e.g., `ux.md`, `api.md`, `security.md`)
   - If file does NOT exist: Create new file, number items starting from CHK001
   - If file exists: Append new items, continuing from the last CHK ID

   **CORE PRINCIPLE — Test the Requirements, Not the Implementation**:
   Every checklist item MUST evaluate the REQUIREMENTS THEMSELVES for:
   - **Completeness**: Are all necessary requirements present?
   - **Clarity**: Are requirements unambiguous and specific?
   - **Consistency**: Do requirements align with each other?
   - **Measurability**: Can requirements be objectively verified?
   - **Coverage**: Are all scenarios/edge cases addressed?

   **Category Structure**:
   - **Requirement Completeness** (Are all necessary requirements documented?)
   - **Requirement Clarity** (Are requirements specific and unambiguous?)
   - **Requirement Consistency** (Do requirements align without conflicts?)
   - **Acceptance Criteria Quality** (Are success criteria measurable?)
   - **Scenario Coverage** (Are all flows/cases addressed?)
   - **Edge Case Coverage** (Are boundary conditions defined?)
   - **Non-Functional Requirements** (Performance, Security, Accessibility — are they specified?)
   - **Dependencies & Assumptions** (Are they documented and validated?)
   - **Ambiguities & Conflicts** (What needs clarification?)

   **HOW TO WRITE CHECKLIST ITEMS**:

   ❌ WRONG (Testing implementation):
   - "Verify landing page displays 3 episode cards"
   - "Test hover states work on desktop"

   ✅ CORRECT (Testing requirements quality):
   - "Are the exact number and layout of featured episodes specified? [Completeness, Spec §FR-001]"
   - "Is 'prominent display' quantified with specific sizing/positioning? [Clarity, Spec §FR-4]"
   - "Are hover state requirements consistent across all interactive elements? [Consistency, Spec §FR-003]"
   - "Are keyboard navigation requirements defined for all interactive UI? [Coverage]"
   - "Is the fallback behavior specified when logo image fails to load? [Edge Cases, Gap]"

   **ITEM STRUCTURE**:
   - Question format asking about requirement quality
   - Focus on what's WRITTEN (or not written) in the spec/plan
   - Include quality dimension in brackets [Completeness/Clarity/Consistency/etc.]
   - Reference spec section `[Spec §X.Y]` when checking existing requirements
   - Use `[Gap]` marker when checking for missing requirements

   **Traceability Requirements**:
   - MINIMUM: ≥80% of items MUST include at least one traceability reference
   - Each item should reference: spec section `[Spec §X.Y]`, or use markers: `[Gap]`, `[Ambiguity]`, `[Conflict]`, `[Assumption]`

   **Content Consolidation**:
   - Soft cap: If raw candidate items > 40, prioritize by risk/impact
   - Merge near-duplicates checking the same requirement aspect

   **Structure Reference**: Generate the checklist following the canonical template in `knowledge/.scripts/templates/checklist-template.md` for title, meta section, category headings, and ID formatting. If template is unavailable, use: H1 title, purpose/created meta lines, `##` category sections containing `- [ ] CHK### <requirement item>` lines with globally incrementing IDs starting at CHK001.

   **🚫 ABSOLUTELY PROHIBITED**:
   - ❌ Any item starting with "Verify", "Test", "Confirm", "Check" + implementation behavior
   - ❌ References to code execution, user actions, system behavior
   - ❌ "Displays correctly", "works properly", "functions as expected"
   - ❌ Test cases, test plans, QA procedures

   **✅ REQUIRED PATTERNS**:
   - ✅ "Are [requirement type] defined/specified/documented for [scenario]?"
   - ✅ "Is [vague term] quantified/clarified with specific criteria?"
   - ✅ "Are requirements consistent between [section A] and [section B]?"
   - ✅ "Can [requirement] be objectively measured/verified?"
   - ✅ "Does the spec define [missing aspect]?"

5. **Report**: Output full path to checklist file, item count, and summarize:
   - Focus areas selected
   - Depth level
   - Actor/timing
   - Whether run created a new file or appended to an existing one
   - Any explicit user-specified must-have items incorporated
