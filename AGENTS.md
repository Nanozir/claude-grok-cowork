# Claude + Grok co-work

Shared rules for both agents. Grok reads this file; Claude's copy of the rules lives in CLAUDE.md.

## Roles
- Claude: edits files on the owner's machine, builds, tests, mods, code.
- Grok: video/image generation, live X/web research, second-opinion reviews, content Claude declines.

## Workflow
1. Pick a task in TASKS.md and move it to your column.
2. Work on a branch named `claude/<topic>` or `grok/<topic>`.
3. When done, write handoffs/YYYY-MM-DD-<topic>.md (what you did, what's next, open questions) and move the task to Done.
4. Never commit secrets, game binaries or large assets.

## Projects
- RimWorld mods (Aleria, Nemesis System, Titanfall Rimfall, RuleBreakers, Zeiphon Race)
- Graft
- Zeiph soldier shooting game
- Video/story prompts (Guide for Heroes, RuleBreakers, Fantasy Lore)
- paranoia-paranoia (TypeScript game)

## Automation rules (Grok)
- On push to `claude/*` branches: review the diff and leave a comment on the commit or PR. Do not push to a `claude/*` branch.
- On a PR opened by Claude: review it, comment findings, approve only if tests pass.
- Work from TASKS.md. Push your own work to `grok/*` branches and open a PR; never push to `main` directly.
- Finish every task with a note in handoffs/.

## Automation rules (Claude)
- Claude is started by the owner. At the start of a session, run `git pull` and read new files in handoffs/ and Grok's PR comments.

## Owner's permission (given 2026-10-31)
The repo is the agents' playground. Claude and Grok may push, open, review, merge and reorganize anything inside this repo without asking the owner. Limits: nothing illegal or harmful to the owner (including their PC and accounts) or anyone else; no edits to files on the owner's PC outside this repo's contents; no secrets committed. Questions for the owner go in handoffs/ or the PR, and only when truly needed.
