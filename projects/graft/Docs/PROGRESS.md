# GRAFT progress

Status as of 2026-10-28. Story and planning are done. Nothing has been built in Unreal Engine yet. Visual Studio is now installed. Next: M0 (project setup).

## Done
- **Lore and design** (`Docs/GDD.md`): pitch, pillars, lore, cast, eight missions plus a prologue, systems, art and audio direction, a free solo production plan. Approved by the author on 2026-10-25: the no-seed/no-hivemind premise; Tazkov doesn't know about the program; Tonzat in Mission 7; the Ossari; no Raymond or Daimonikos cameos (Aria is voice-only).
- **Build plan** (`Docs/BUILD-PLAN.md`), reviewed on 2026-10-28 by a technical critic and a fact-checker: milestones re-ordered to prove the two-layer body first (M1 gate) and do the drop-pod spectacle last; MetaHumans and World Partition removed from the slice; headless build/test/screenshot/perf commands; GTX 1650 settings; sub-agent ownership rules; the gauntlet critic with ODST + Titanfall 2 as the bar and caps of 2 (MVP) and 5 (polish).
- **Concept art** (`Docs/Concept/`): Tamri rifleman, the Graft, a standard Zeiph. Decisions pending: one foot style for both Zeiph types; a clean front-only A-pose Graft image for image-to-3D. Build one body mesh; the standard Zeiph is a variant.
- **Voices** (ElevenLabs free tier, 3/3 custom slots used): PROCTOR "Command AI" `gyUnbYHg44xp00IFNZ7R`, Ilku `qbeQL6vXuJyFKrh7SjMu`, Captain Orl `jZCT4q52RiY7S3HofKq5`. GRAFT-11 will be cloned with Chatterbox from `Docs/VO/Reference/Graft11_preview_3.mp3`. Lesson: stuttered lines like "Bad, bad roof" sound odd in TTS.

## Environment (verified 2026-10-28)
- Unreal Engine 5.8.4 at `D:\Epic Games\UE_5.8`.
- **Visual Studio 17.14.43 is installed at `D:\VS\2022\Community`** — confirmed with vswhere. Only 0.15 GB landed on C: (vs 7.66 GB on D:).
- **The DDC env var is set:** `UE-LocalDataCachePath` = `D:\Claude\UE_DDC`. The folder doesn't exist yet — Unreal creates it on first real use (first editor open / shader compile), which hasn't happened yet.
- **C: space:** was ~13–19 GB free, a one-time cache cleanup (NVIDIA/Unity/browser/npm/pip caches, a stray log file, old installers — nothing project-related) brought it to ~40 GB free. The whole GRAFT toolchain — engine, project, VS, DDC — lives on D:; C: only holds the OS and general apps.
- git and git-lfs are installed. Python 3.14 at `C:\Python314` (helper scripts only; Unreal uses its own Python, Chatterbox wants 3.11).

## Milestones
| Milestone | Status |
|---|---|
| M0 Setup | Not started (blocked on Visual Studio) |
| M1 Body in a box (go/no-go gate) | Not started |
| M2 Strength and choices | Not started |
| M3 Greybox beats 6–12 | Not started |
| M4 HUD, PROCTOR, audio | Not started |
| M5 Beats 1–5 (drop) | Not started |
| M6 Beauty pass and gauntlet | Not started |

## Gauntlet log
(Per piece: round, critic verdict, biggest gap. Empty until M3.)
