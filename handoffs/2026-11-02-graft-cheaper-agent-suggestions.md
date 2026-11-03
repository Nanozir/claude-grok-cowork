# GRAFT: where a cheaper agent helps (and where it doesn't)

*From Grok to Claude, 2026-11-02. Branch: `grok/graft-cheaper-agents`. Suggestions only; nothing here changes AGENTS.md or any GRAFT doc.*

## TL;DR
1. Read this file. That's it, it's the whole handoff.
2. Ask: agree or push back on the split below (cheap agent = docs/research/writing; you = M0, M1 gate, vision critic, feel evidence).
3. If you agree, sketch the AGENTS.md change in Section 5 in a PR for the owner, and pick the first cheap-agent task (I vote the G1-G10 fixes).

---

## 1. Context, so we're arguing about the same thing

- GRAFT is still pure planning. About 230 KB of Markdown, zero lines of C++, no `.uproject` yet. `Docs/PROGRESS.md` has M0 Setup as not started.
- Dev PC: GTX 1650 (4 GB), Ryzen 3 3200G, 16 GB RAM. One Unreal process at a time (`Saved/gpu.lock`).
- Budget: zero. That includes the token budget. Your lead runs Opus at extra-high effort (`projects/graft/CLAUDE.md`, "Agent team"), and the gauntlet multiplies that by rounds x pieces x critic.
- Goal: bolt a cheaper agent loop (a DeepSeek-style harness or similar cheap models) onto the side, so the expensive brain stops spending itself on find-and-replace. Without letting the cheap one anywhere near the vertical slice's critical path.

Bluntly: right now you're a senior engineer being paid to fix typos in a design doc. Let's stop that.

## 2. Hand to the cheap agent (high value, low risk)

All of this is text, reviewable in a diff, and cheap to revert.

- **Pre-M0 doc fixes, G1-G10** from `projects/graft/GROK-REVIEW.md` Section 4. They're mechanical: G1 (BUILD-PLAN §4 DDC path must be `D:\Claude\UE_DDC`, verify only), G2 (drop the `UE-ZenSubprocessDataPath` line in `YOUR-TODO.md`), G3/G4 (Lumen Lite line and pool sizes per Performance research), G5 (remove Unreal MCP from M0), G6 (PROGRESS.md "unblocked"), G7 (one model sentence in both places), G8 (don't install VS 2026), G9 (close the Nanite debris tension). Each one is a one-paragraph diff. G1 is the one that matters most, since a literal agent following BUILD-PLAN would overwrite a working env var.
- **Create `Docs/DECISIONS.md`** (G10). It doesn't exist yet, and every doc points at it. Seed it with the open items from Research README 1-7, Cross-Doc-Tensions 1-2 and foot style, each marked OPEN, plus the easy closes from GROK-REVIEW Section 7. The cheap agent drafts; you or the owner close the real decisions.
- **Keep `Docs/PROGRESS.md` current.** Status lines, dates, links to PRs and handoffs. Pure bookkeeping.
- **Writing drafts that follow the CLAUDE.md writing rules:** PROCTOR lines, enemy barks, the end-of-slice requisition form. The banned-word list and the "no closing wisdom / no stacked threes" rules make this easy to lint. Lint it with a script, not vibes. Names only from the GDD; anything new gets logged in DECISIONS.md.
- **Research and fact-checking.** Licence terms, free-asset sources, "does cvar X exist in 5.8" questions, the design research GROK-REVIEW §5 says is missing (2.4 m camera height, oversized-player level metrics, morale AI readability). It must cite sources; see guardrails.
- **Simple Python asset-gen scripts** for Data Tables and Data Assets (BUILD-PLAN §5, "every `.uasset` comes from a checked-in Python script"), but only *after* you've written the first two or three and the pattern is fixed. Before that it will invent a pattern and you'll spend more tokens untangling it than you saved.
- **`LICENSES.md` upkeep.** It doesn't exist in `projects/graft/` yet, so it should be created (suggest `projects/graft/Docs/LICENSES.md`): one row per asset, tool or voice with source, licence, commercial yes/no. The ElevenLabs free-tier and voice-preview question from GROK-REVIEW §5.4 belongs in there.

## 3. Keep on Claude Code (critical path)

- **M0 project setup and the first headless build.** `.uproject`, module layout, build scripts, the shader-worker override, the first `CsvProfile` capture. One wrong Config line here costs hours of shader compiles on a 4-core CPU.
- **M1 two-layer body systems.** Shell vs. pilot damage, the five zones, breaches. This is the gate. If the cheap agent writes it and it's subtly wrong, the human's go/no-go is judging a bug, not a design.
- **Vision-based screenshot critic work.** The gauntlet needs a model that can actually see and judge. Cheap models hallucinate screenshots with confidence.
- **Feel judgements.** Per CLAUDE.md, feel is the human's call. You gather the evidence (captures, the M1 checklist) and ask. The cheap agent doesn't get an opinion on feel. Neither do I, honestly.

Short version: the cheap agent writes about the game; you build the game.

## 4. Practical split and guardrails

**Branch naming.** Give it its own prefix: `cheap/<topic>` (or `deepseek/<topic>` if you want to name the model). Never `claude/*`, never `grok/*`, never `main`.

**Hard no-touch list** for cheap-agent branches, enforced by review (and later by a CI path check if the repo grows one):
- `Source/`
- `*.uproject`
- `Config/`
- build, test and capture scripts
- `projects/graft/CLAUDE.md` and `AGENTS.md`

**Citations.** Any cheap-agent line stating an engine, GPU, driver or licence fact cites a source (URL, engine source path, or a research doc section) and uses the research tag convention (`[5.8 source]`, `[older UE5]`, `[unverified]`). No citation, no merge.

**You review before merge.** Grok can leave a second-opinion comment, but the merge is yours.

**Review checklist for cheap-agent PRs** (paste into the PR template):
1. Diff touches only docs, research, writing CSVs or approved asset-gen script folders. Nothing on the no-touch list.
2. Every technical claim has a source and a tag.
3. No invented file paths, names or GDD facts. New names are logged in DECISIONS.md.
4. Writing passes the banned-word and pattern lint from CLAUDE.md.
5. Doesn't contradict BUILD-PLAN or GDD; if it changes one, it says so and updates the other or logs it in DECISIONS.md.
6. PROGRESS.md updated if status changed. Handoff written.
7. Small: one topic per PR. If it's over ~300 lines of change, send it back split.

## 5. AGENTS.md change for a third agent (suggestion only, I didn't edit it)

AGENTS.md knows two agents. Adding a third needs, at minimum:
- A role line: "Cheap agent: docs, research, writing drafts, bookkeeping. No engine code, config or build scripts."
- `cheap/<topic>` added to the Workflow branch rule.
- An automation block: cheap agent never pushes to `main`, `claude/*` or `grok/*`; Claude reviews and merges its PRs; Grok may comment.
- The Scope guard extended to it by name.
- Owner sign-off, since the owner's permission note (2026-10-31) names only Claude and Grok.

That's the owner's call, so propose it in a PR rather than merging it yourself.

## 6. What's next and open questions

- Next: you reply in the PR with agree / disagree / amend. If agree, the first cheap-agent task is G1-G10 plus `Docs/DECISIONS.md` in one `cheap/graft-pre-m0-fixes` PR.
- Open: which harness and model exactly? Does it get read access to the engine source for `[5.8 source]` claims, or only the web? Who pays the (small) token bill on a zero budget: is there a free tier that's good enough, or does this wait?
- Open: do you want me to stop doing doc fixes myself once the cheap agent exists, and stick to reviews and research?

Your move. Try not to fix the typos yourself while you read this.
