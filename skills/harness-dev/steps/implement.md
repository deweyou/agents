# Implement Step

Execute the implementation plan by processing and executing all tasks defined in tasks.md.

## Pre-Execution

Run `knowledge/.scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` from repo root. Parse FEATURE_DIR and AVAILABLE_DOCS list. All paths must be absolute.

## Outline

1. **Check checklists status** (if FEATURE_DIR/checklists/ exists):
   - Scan all checklist files in the checklists/ directory
   - For each checklist, count: Total items, Completed items, Incomplete items
   - Create a status table:

     ```text
     | Checklist | Total | Completed | Incomplete | Status |
     |-----------|-------|-----------|------------|--------|
     | ux.md     | 12    | 12        | 0          | ✓ PASS |
     | test.md   | 8     | 5         | 3          | ✗ FAIL |
     ```

   - **If any checklist is incomplete**:
     - Display the table
     - **STOP** and ask: "Some checklists are incomplete. Do you want to proceed with implementation anyway? (yes/no)"
     - If user says "no", halt
     - If user says "yes", proceed

   - **If all checklists are complete** or no checklists exist:
     - Proceed automatically

2. Load and analyze the implementation context:
   - **REQUIRED**: Read tasks.md for the complete task list and execution plan
   - **REQUIRED**: Read plan.md for tech stack, architecture, and file structure
   - **IF EXISTS**: Read data-model.md for entities and relationships
   - **IF EXISTS**: Read contracts/ for API specifications and test requirements
   - **IF EXISTS**: Read research.md for technical decisions and constraints
   - **IF EXISTS**: Read quickstart.md for integration scenarios

3. **Project Setup Verification**:
   - Check if git repo exists → create/verify .gitignore if so
   - Check if Dockerfile* exists or Docker in plan.md → create/verify .dockerignore
   - Check if .eslintrc* exists → create/verify .eslintignore
   - Check if .prettierrc* exists → create/verify .prettierignore
   - **If ignore file already exists**: Verify it contains essential patterns, append missing critical patterns only
   - **If ignore file missing**: Create with full pattern set for detected technology

   **Common Patterns by Technology** (from plan.md tech stack):
   - **Node.js/JavaScript/TypeScript**: `node_modules/`, `dist/`, `build/`, `*.log`, `.env*`
   - **Python**: `__pycache__/`, `*.pyc`, `.venv/`, `dist/`, `*.egg-info/`
   - **Go**: `*.exe`, `*.test`, `vendor/`, `*.out`
   - **Rust**: `target/`, `debug/`, `release/`
   - **Universal**: `.DS_Store`, `Thumbs.db`, `*.tmp`, `*.swp`, `.vscode/`, `.idea/`

4. Parse tasks.md structure and extract:
   - **Task phases**: Setup, Foundation, User Stories, Polish
   - **Task dependencies**: Sequential vs parallel execution rules
   - **Task details**: ID, description, file paths, parallel markers [P]
   - **Execution flow**: Order and dependency requirements

5. Execute implementation following the task plan:
   - **Phase-by-phase execution**: Complete each phase before moving to the next
   - **Respect dependencies**: Run sequential tasks in order, parallel tasks [P] can run together
   - **Follow TDD approach**: Execute test tasks before their corresponding implementation tasks (if tests requested)
   - **File-based coordination**: Tasks affecting the same files must run sequentially
   - **Validation checkpoints**: After each phase, run the project's lint/build command from constitution (e.g. `vp check`)
   - If build fails, fix before proceeding to next task

   If the build command is not known, ask the user once: "What's the command to check/build this project?"

6. Implementation execution rules:
   - **Setup first**: Initialize project structure, dependencies, configuration
   - **Tests before code**: If tests requested for contracts, entities, and integration scenarios
   - **Core development**: Implement models, services, CLI commands, endpoints
   - **Integration work**: Database connections, middleware, logging, external services
   - **Polish and validation**: Unit tests, performance optimization, documentation

7. Progress tracking and error handling:
   - Report progress after each completed task
   - Halt execution if any non-parallel task fails
   - For parallel tasks [P], continue with successful tasks, report failed ones
   - Provide clear error messages with context for debugging
   - **IMPORTANT**: For completed tasks, mark them as `[x]` in tasks.md

8. Completion validation:
   - Verify all required tasks are completed
   - Check that implemented features match the original specification
   - Confirm the implementation follows the technical plan
   - Report final status with summary of completed work

Note: If tasks are incomplete or missing, suggest running the tasks step first.
