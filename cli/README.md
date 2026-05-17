# deweyou-cli

`deweyou-cli` bootstraps Dewey's personal agent workflows into any local
repository. It manages the repo-level wiring for selected skills and rules while
keeping the source assets in the central `deweyou/agents` hub.

The v0 scope is intentionally small:

- cache skills and rules from a local `deweyou/agents` checkout
- initialize a repository with selected skills and rules
- render the active agent context for the current repository
- diagnose whether the current repository is wired correctly

## Install

From npm:

```bash
npm install -g deweyou-cli
```

Then refresh the local asset cache:

```bash
deweyou-cli agent update
```

By default, `agent update` clones or pulls `https://github.com/deweyou/agents.git`
into `~/.deweyou/agents/source`. For local development, set
`DEWEYOU_AGENTS_SOURCE=/path/to/deweyou/agents` to use a specific checkout
instead.

## Quick Start

```bash
cd /path/to/your/repo
deweyou-cli agent init
deweyou-cli agent doctor
deweyou-cli agent context --format markdown
deweyou-cli agent -h
deweyou-cli -v
```

For a non-interactive setup that selects everything:

```bash
deweyou-cli agent init --all --mode link --yes
```

## Mental Model

`deweyou/agents` is the asset hub. It owns `skills/` and `rules/`.

`deweyou-cli` is the workflow manager. It scans the hub assets, generates a
cache registry under your home directory, then writes a small
`.agents/manifest.json` into each repository so the repository knows which
assets are active.

Each repository chooses its own asset set. A coding repo can select coding
skills and rules; a writing or design repo can select different ones.

## Commands

General options:

| Option | Meaning |
|--------|---------|
| `-h`, `--help` | Show help. Supports nested help such as `deweyou-cli agent -h` and `deweyou-cli agent init -h`. |
| `-v`, `--version` | Show the installed CLI version. |

### `deweyou-cli agent update`

Refreshes the local Dewey asset cache from the default `deweyou/agents` source
checkout.

```bash
deweyou-cli agent update
```

This command writes the global cache at:

```text
~/.deweyou/agents/
```

Run this after changing or pulling updates in the asset hub.

Source selection:

- Default: clone or pull `https://github.com/deweyou/agents.git` under
  `~/.deweyou/agents/source`.
- Override: set `DEWEYOU_AGENTS_SOURCE=/path/to/deweyou/agents` to scan a local
  checkout.

### `deweyou-cli agent init`

Initializes the current repository with selected skills and rules.

```bash
deweyou-cli agent init
```

Usage:

```text
deweyou-cli agent init [--all] [--skills a,b] [--rules a,b] [--mode link|copy|pointer] [--scope project|global] [--tools codex,claude|all] [--rule-wiring reference|inline] [--yes] [--dry-run] [--force]
```

Without selection flags, this opens an interactive setup where you choose:

- install mode
- skills
- rules

Scripted examples:

```bash
deweyou-cli agent init --all --mode link --yes
deweyou-cli agent init --skills repo-memory,spec-driven-coding,git-delivery --rules code-style
deweyou-cli agent init --scope project --tools codex,claude --rules code-style --mode link
deweyou-cli agent init --scope global --tools all --rules code-style --rule-wiring reference --yes
deweyou-cli agent init --dry-run
```

Flags:

| Flag | Meaning |
|------|---------|
| `--all` | Select every skill and rule from the cached registry. |
| `--skills a,b` | Select only the listed skill ids. Values are comma-separated. |
| `--rules a,b` | Select only the listed rule ids. Values are comma-separated. |
| `--mode link\|copy\|pointer` | Choose how the repository references selected assets. |
| `--yes` | Run without prompts. Requires `--all`, `--skills`, or `--rules`. |
| `--dry-run` | Print the planned files without writing them. |
| `--force` | Replace existing Dewey-managed asset destinations when needed. |

`--yes` does not guess a default asset set. It only confirms a scripted
selection you already provided.

### `deweyou-cli agent context`

Prints the active Dewey agent context for the current repository.

```bash
deweyou-cli agent context --format markdown
deweyou-cli agent context --format json
```

Formats:

| Format | Meaning |
|--------|---------|
| `markdown` | Human-readable instructions and asset paths. This is the default. |
| `json` | Structured context for tooling or future integrations. |

The context output tells an agent which skills and rules are active, where their
files live, whether the hub commit changed, and whether any selected asset hash
changed in the local cache.

### `deweyou-cli agent doctor`

Checks whether the current repository and local cache are healthy.

```bash
deweyou-cli agent doctor
```

It verifies:

- local cache registry exists and is valid
- repository `.agents/manifest.json` exists and is valid
- `AGENTS.md` exists
- selected skills and rules still exist in the registry
- selected asset hashes match the repository's initialized snapshot
- selected asset files are present
- symlinks are valid when using `link` mode

The command exits with a non-zero status when a check fails.

## Install Modes

| Mode | Repository Writes | Best For |
|------|-------------------|----------|
| `link` | Symlinks selected assets into `.agents/skills/` and `.agents/rules/`. | Daily local work where updates should be immediately visible after cache refresh. |
| `copy` | Copies selected assets into `.agents/skills/` and `.agents/rules/`. | Repositories that should keep a snapshot of the selected assets. |
| `pointer` | Writes only `.agents/manifest.json` and `AGENTS.md`; assets stay in the global cache. | Minimal repo footprint and tooling that can follow absolute cache paths. |

## Files Created

Depending on the selected mode, `deweyou-cli agent init` may create or update:

```text
AGENTS.md
.agents/manifest.json
.agents/skills/<skill>/SKILL.md
.agents/rules/<rule>.md
```

`AGENTS.md` receives a managed Dewey section that points agents at the selected
workflow context. Existing content outside that managed section is preserved.

Project installs write repository instruction files such as `AGENTS.md` and
`CLAUDE.md`. Global installs write user-level instruction files such as
`~/.codex/AGENTS.md` and `~/.claude/CLAUDE.md`.

## Safety Notes

- Run `deweyou-cli agent update` before `deweyou-cli agent init`.
- Asset ids must be kebab-case and must exist in the cached registry.
- `--force` only replaces destinations that are already Dewey-managed. It
  refuses to overwrite unrelated user-created files or directories.
- `--dry-run` is the safest way to preview what `init` would write.
- Set `DEWEYOU_AGENTS_SOURCE` only when you want to override the default source
  checkout, usually while developing this asset hub locally.

## Development

The CLI source and tests are written in TypeScript. Vite+ builds the published
JavaScript files into `dist/`.

```bash
npm run typecheck
npm test
npm run test:coverage
npm run build
npm pack --dry-run
```

## Release

Merging CLI package changes into `main` runs the release workflow. It typechecks,
runs tests, verifies the package with `npm pack --dry-run`, infers the next
version from conventional commit messages, prepends [CHANGELOG.md](./CHANGELOG.md),
tags `cli-vX.Y.Z`, and publishes `deweyou-cli` to npm.

Release commit rules:

- `feat:` creates a minor release.
- `fix:`, `perf:`, and `refactor:` create a patch release.
- `!` or `BREAKING CHANGE` creates a major release.
- `docs:` entries are included in the changelog only when another releasable CLI
  commit is present.
- `test:` and `chore:` do not publish by themselves.

## Relationship To `deweyou/agents`

`deweyou/agents` continues to provide the actual skills, rules, and asset
validation workflow. The CLI generates the cache registry during
`deweyou-cli agent update`.

`deweyou-cli` does not replace those assets. It gives every repository a
repeatable way to choose and wire the assets it wants, without manually copying
or linking the same files again and again.
