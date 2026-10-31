# GRAFT

GRAFT is a linear story-driven first-person shooter in Unreal Engine 5.8, set in the author's Nebulous Odyssey universe. You play GRAFT-14 (pilot Ilku Saar), a Zeiph shell with a living pilot inside and no hivemind link, invading the human planet Tamra. The current goal is the vertical slice: Mission 1, "Descent".

## Where things are
- `Docs/BUILD-PLAN.md` is how to build: milestones and gates, specs, headless verification commands, hardware settings, parallel-work rules and the gauntlet critic. Read it in full once at the start; after that, read only the section a task needs.
- `Docs/GDD.md` is the design (story, systems, the beat sheet in Section 6). Read the sections you need, not the whole file. The GDD wins on design; BUILD-PLAN wins on technical approach.
- `Docs/PROGRESS.md` is the current state. Update it at the end of every milestone and gauntlet round.
- `Docs/DECISIONS.md` (create it) logs every choice the docs leave open, and any new name.
- `Docs/Concept/` has the concept art. `Docs/VO/Reference/` has the voice previews.
- `Docs/Archive/` holds superseded drafts. Don't read it unless asked.
- `YOUR-TODO.md` is the human's list, not yours.

## Key facts
- Engine: `D:\Epic Games\UE_5.8` (5.8.4). The `.uproject` goes at `D:\Projects\Graft`. Visual Studio 17.14.43 is at `D:\VS\2022\Community`.
- **The whole toolchain lives on D:, verified 2026-10-28:** engine, project folder, Visual Studio (only 0.15 GB landed on C:, versus 7.66 GB on D:), and the DDC env var `UE-LocalDataCachePath` is set to `D:\Claude\UE_DDC`. Nothing about building GRAFT needs C:. Confirmed from the 5.8.4 engine source: Zen data follows that env var automatically to `D:\Claude\UE_DDC\Zen`; don't set `UE-ZenSubprocessDataPath`, it's internal (the engine sets it itself for child processes). Verify with a `LogZenServiceInstance` line in the editor log, and keep `%LOCALAPPDATA%\UnrealEngine\Common\Zen\Data` empty.
- Dev PC: GTX 1650 (4 GB), Ryzen 3 3200G (4 cores), 16 GB RAM. Target: Medium, 30 fps at 1080p with TSR. Only one Unreal process at a time.
- C: has 40+ GB free (a one-time cache cleanup freed it from ~19 GB). Still: caches, downloads, venvs and tools go on D: (tools under `D:\Claude`) as a matter of habit, not because C: is tight anymore.
- Solo developer, zero budget. Free assets and free tiers only. Never suggest paid assets, plugins or hiring.

## Agent team
- The lead runs on Opus 5.5 at extra-high effort. Every sub-agent uses the Agent tool with `model: "opus"` and `effort: "medium"`.
- Only the lead builds, runs tests, opens the editor or captures screenshots (`Saved/gpu.lock`). Sub-agents write code, scripts and data in their own folders (`Docs/OWNERS.md`).
- Gauntlet critic: fresh context, blind A/B, names one gap. Caps: MVP 2 rounds, polish 5. Never run past a cap.

## Writing rules (dialogue, barks, posters, documents)
- Plain words. "Said" and "is". Repeat a word instead of cycling synonyms.
- Short, complete sentences that TTS reads well. No stutters ("bad, bad roof"), bare fragments or trailing off. Delivery goes in the CSV emotion column.
- Never use: tapestry, testament, delve, intricate, pivotal, crucial, vital, resonate, robust, journey, navigate, beacon, unveil, formidable, unwavering, enigmatic.
- No "It wasn't X. It was Y.", no stacked threes, no self-answered questions, no closing wisdom. Subtext over statement. Few em dashes.
- Use only names and facts from the GDD. New names use the culture's sound palette (Tamri: hard consonants like Dalsk, Orl, Pell; Ossari: soft vowels like Ilku, Saar, Oss) and get logged in `Docs/DECISIONS.md`.
- User-facing text uses sentence case, never ALL CAPS.

## Working rules
- Verify before calling anything done: build, run automation tests, capture and look at screenshots (BUILD-PLAN Section 3). Feel is the human's call; ask.
- Stop at every milestone gate and report to the human. M1 has a go/no-go gate: nothing after it starts without the human's "go".
- Commit at the end of every task, one feature per commit. Never commit `Binaries/`, `Intermediate/`, `Saved/`, `DerivedDataCache/` or `Docs/References/`.
- Stay in scope. Read only the files a task needs.
