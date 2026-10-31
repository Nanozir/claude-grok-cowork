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
