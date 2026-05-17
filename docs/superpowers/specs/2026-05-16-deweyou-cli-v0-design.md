# deweyou-cli v0 Design

> Status note: this was the original design draft. The implemented CLI now lives
> in this repository under `cli/`, exposes the `deweyou-cli` binary, and
> generates the cache `registry.json` during `deweyou-cli agent update` instead
> of maintaining a source `registry.json` in the asset hub.

## Goal

Create `deweyou-cli` as Dewey's personal agent workflow bootstrapper.

The first version manages only skills and rules. It helps each repository opt into
Dewey's workflow without manually copying files, editing `AGENTS.md`, or remembering
which assets to install. The CLI should make repo onboarding pleasant, repeatable,
and easy to update.

This CLI does not replace Lark, Notion, GitHub, or other provider CLIs. It also does
not start as a general personal workflow CLI. Version 0 is an agent runtime manager
for Dewey's personal skills and rules.

## Non-Goals

- Do not support MCP assets in v0.
- Do not add profiles in v0.
- Do not add recommended defaults in v0.
- Do not auto-detect repository domains or technology stacks in v0.
- Do not replace service-specific CLIs such as `lark-cli`, `notion-cli`, or `gh`.
- Do not require every repository to use the same selected skills and rules.

## Mental Model

There are three layers:

1. Asset hub: this repository stores skills, rules, and the asset registry.
2. Local cache: `deweyou-cli` stores a local copy of those assets under
   `~/.deweyou/agents/assets`.
3. Repository onboarding: each repository can run `deweyou agent init` to select
   skills and rules and write local wiring under `.agents/`.

The pain being solved is repetitive setup, not repository purity. Repositories may
contain `.agents/` files or symlinks, but the CLI owns creating, updating, and
diagnosing them.

## Repository Scope

This repository remains the personal agent asset hub. It should contain:

```text
skills/
rules/
registry.json
docs/
```

Future directories such as `mcp/` can be added when those assets are part of the
active design.

The existing `agents add/update/remove` installer is not the long-term primary
interface. It can remain as legacy behavior while `deweyou-cli` becomes the main
workflow entrypoint.

## registry.json

`registry.json` is the machine-readable asset index for the hub. It is stored in
the asset hub and copied into the local cache by `deweyou agent update`.

It answers:

- What assets exist?
- What type is each asset?
- Where is each asset stored?
- What version and description should the CLI display?
- Which tags help users understand the asset?

It does not decide which assets are recommended. In v0, the user chooses assets
explicitly per repository.

Example:

```json
{
  "version": "2026.05.16",
  "assets": {
    "skills": {
      "code-knowledge": {
        "path": "skills/code-knowledge",
        "version": "2.0.0",
        "description": "Repository knowledge workflow",
        "tags": ["coding", "knowledge"]
      }
    },
    "rules": {
      "code-style": {
        "path": "rules/code-style.md",
        "version": "1.0.0",
        "description": "Language-agnostic coding preferences",
        "tags": ["coding"]
      }
    }
  }
}
```

The registry should be validated against the actual assets during update and doctor
checks. A registry entry is invalid if its path is missing, its frontmatter version
does not match, or its type does not match the expected file layout.

## Local Cache

`deweyou agent update` manages this directory:

```text
~/.deweyou/
  agents/
    assets/
      registry.json
      skills/
      rules/
    manifest.json
```

The cache is the source for repo-level link mode. Link mode keeps repositories easy
to update because symlinks point to the local cache.

`manifest.json` records:

- asset source repository
- current registry version
- update timestamp
- CLI version that last updated the cache

## Repository Files

`deweyou agent init` writes or updates:

```text
AGENTS.md
.agents/
  manifest.json
  skills/
  rules/
```

`AGENTS.md` receives a Dewey workflow section. The section tells agents to use local
`.agents/` assets and to run `deweyou agent context --format markdown` when they need
the current resolved context.

`.agents/manifest.json` records:

- selected skills
- selected rules
- installation mode
- source cache path
- registry version at initialization time
- timestamps

The manifest is the source of truth for `context`, `doctor`, and future updates.

## Install Modes

### link

Default mode. Creates symlinks:

```text
repo/.agents/skills/<name> -> ~/.deweyou/agents/assets/skills/<name>
repo/.agents/rules/<name>.md -> ~/.deweyou/agents/assets/rules/<name>.md
```

Use when a repo should follow the local Dewey asset cache and receive updates after
`deweyou agent update`.

### copy

Copies selected assets into `.agents/`.

Use when a repo needs self-contained or frozen assets.

### pointer

Only writes the `AGENTS.md` Dewey workflow section and `.agents/manifest.json`.

Use when a repo should stay thin and agents should rely on
`deweyou agent context` to locate assets in the local cache.

## Commands

### deweyou agent init

Onboards the current repository.

Default behavior is interactive. The CLI should use a polished terminal UI,
preferably `@clack/prompts`, with clear labels, descriptions, summary, and cancel
handling.

Interactive flow:

1. Confirm the repository root.
2. Ensure the local asset cache exists, offering to run update if missing.
3. Select mode: `link`, `copy`, or `pointer`.
4. Select asset scope: `all`, `custom`, `skills only`, or `rules only`.
5. If needed, multiselect individual skills and rules.
6. Show a summary of files to create or update.
7. Ask for confirmation before writing unless `--yes` was provided.

Flags:

| Flag | Meaning |
|------|---------|
| `--all` | Enable all skills and rules from the registry. |
| `--skills <list>` | Enable comma-separated skill names. |
| `--rules <list>` | Enable comma-separated rule names. |
| `--mode <mode>` | One of `link`, `copy`, or `pointer`. Defaults to `link`. |
| `--yes` | Skip the final confirmation. |
| `--dry-run` | Print the planned changes without writing files. |
| `--force` | Replace existing Dewey-managed files or broken links. |

If none of `--all`, `--skills`, or `--rules` is provided, the command should enter
interactive asset selection.

### deweyou agent update

Updates the local asset cache from the asset hub.

Responsibilities:

- Fetch or refresh this repository's skills, rules, and registry.
- Validate registry entries against the copied assets.
- Write the global cache manifest.
- Report changed asset versions.

It does not mutate every initialized repo. Repositories in link mode automatically
see updated assets through symlinks. Repositories in copy mode remain frozen until a
future repo-level update command exists.

### deweyou agent context

Outputs the effective context for the current repository.

Formats:

| Flag | Meaning |
|------|---------|
| `--format markdown` | Human and agent-readable context. Default. |
| `--format json` | Machine-readable context for scripts and future integrations. |

The command reads `.agents/manifest.json`, verifies selected assets, and prints:

- active skills index
- active rules index
- asset paths
- registry and manifest versions
- runtime notices

It should not dump every `SKILL.md` body by default. The context should list skill
descriptions and paths so agents can load the relevant skill on demand.

### deweyou agent doctor

Diagnoses local and repo runtime health.

Checks:

- CLI can find the local cache.
- `registry.json` is valid.
- selected skills and rules exist.
- frontmatter is valid.
- symlinks are not broken.
- `.agents/manifest.json` matches repository files.
- `AGENTS.md` contains the Dewey workflow section.
- cache and repo registry versions are visible to the user.

Doctor should print actionable fixes. For example, if the cache is missing, suggest
`deweyou agent update`. If a symlink is broken, suggest rerunning
`deweyou agent init --force`.

## Output Contracts

Follow the useful parts of the `lark-cli` pattern:

- stdout contains the requested output.
- stderr is for progress, warnings, and prompts.
- JSON output is stable enough for scripts.
- Notices are structured.

Example JSON context:

```json
{
  "ok": true,
  "repo": {
    "root": "/path/to/repo",
    "mode": "link"
  },
  "runtime": {
    "cliVersion": "0.1.0",
    "registryVersion": "2026.05.16"
  },
  "assets": {
    "skills": [
      {
        "name": "code-knowledge",
        "version": "2.0.0",
        "path": ".agents/skills/code-knowledge/SKILL.md"
      }
    ],
    "rules": [
      {
        "name": "code-style",
        "version": "1.0.0",
        "path": ".agents/rules/code-style.md"
      }
    ]
  },
  "_notice": {
    "update": null,
    "assets": null
  }
}
```

## README Deliverable

The CLI project must include a user-facing `README.md`. The README should be a
usage manual, not an architecture document.

Required sections:

- What `deweyou-cli` does
- Installation
- Quick start
- Mental model
- Commands
- `deweyou agent init`
- `deweyou agent update`
- `deweyou agent context`
- `deweyou agent doctor`
- All flags and their meanings
- Recommended workflows
- Files created
- Relationship to the `deweyou/agents` asset hub
- Safety notes

The README must include examples for:

```bash
deweyou agent init
deweyou agent init --all --mode link --yes
deweyou agent init --skills code-knowledge,deweyou-design --rules code-style
deweyou agent init --dry-run
deweyou agent update
deweyou agent context --format markdown
deweyou agent context --format json
deweyou agent doctor
```

## Testing Strategy

Cover behavior with Node tests or the implementation language's equivalent.

Minimum tests:

- Registry loading and validation.
- Interactive selections can be bypassed with flags.
- `init --mode link` creates symlinks and manifest entries.
- `init --mode copy` copies assets.
- `init --mode pointer` does not install asset files.
- `init --dry-run` writes nothing.
- `context --format json` returns selected assets.
- `doctor` detects missing cache, broken links, invalid manifest, and missing
  `AGENTS.md` section.

## V0 Decisions

- `deweyou-cli` should be designed as a separate CLI package that consumes this
  repository as an asset source. This repository remains the asset hub.
- Copy-mode repositories do not get a separate refresh command in v0. Re-running
  `deweyou agent init --force` is enough for the first version.
- V0 does not create global agent-runtime skill links. It only writes repo-level
  `.agents/` wiring and `AGENTS.md`.
