# Research index

Technical research gathered 2026-10-28 for building GRAFT's vertical slice. This is research material, not design or technical decisions — anything adopted from here gets logged in `Docs/DECISIONS.md` and, where it changes a command or setting already written down, folded back into `Docs/BUILD-PLAN.md`. Every file tags its claims by how it was verified (installed 5.8.4 engine source/config, Epic's 5.8 docs, older UE5.x docs, or community/unverified) — check the tag before trusting a specific detail.

Unlike `Docs/References/` (reserved per `BUILD-PLAN.md` Section 6 for the human's own ODST/Titanfall 2 screenshots for the gauntlet critic — gitignored, never filled by research), this folder is plain technical reference material.

## Files

- **[Performance-and-Scalability.md](Performance-and-Scalability.md)** — TSR tuning, Lumen Lite vs old Lumen, shadows, Nanite, VRAM budget, DDC/Zen paths, shader-compile threading. Read `BaseScalability.ini` and engine source directly. **Flags that BUILD-PLAN's Medium/Low cvars don't match stock 5.8 defaults** (Medium now ships Lumen Lite, not screen-probe Lumen; stock Low has DFAO off; texture pool defaults to 600MB not 1000MB) — needs a decision and a BUILD-PLAN fix. Also resolves CLAUDE.md's open Zen-cache question: don't set `UE-ZenSubprocessDataPath`, it's internal.
- **[Gameplay-Systems-GAS-StateTree-EQS.md](Gameplay-Systems-GAS-StateTree-EQS.md)** — GAS AttributeSet/execution-calculation patterns for the zone-armor damage model, StateTree morale states, EQS cover queries at 2.4m, Enhanced Input. Cross-checked against installed 5.8.4 engine source.
- **[Destruction-and-VFX.md](Destruction-and-VFX.md)** — Dataflow-based Geometry Collection fracturing, Chaos Cache Manager for the deterministic pod-impact, tag-filtered ability destruction, `IGraftTearable` approach, Niagara particle budgets for the drop sequence.
- **[Audio-MetaSounds-and-VO-Pipeline.md](Audio-MetaSounds-and-VO-Pipeline.md)** — MetaSound parameter-driven breathing loop, radio/digital-edge voice effects, Python VO import workflow, ElevenLabs/Chatterbox/Kokoro. **Flags that ElevenLabs' free tier has no commercial license for generated audio** — conflicts with shipping PROCTOR/Ilku/Orl lines from the already-claimed free-tier voices; needs a decision.
- **[Free-Assets-and-Licensing.md](Free-Assets-and-Licensing.md)** — Fab, Poly Haven, ambientCG, Mixamo, Game Animation Sample Project, Meshy/Tripo/Hunyuan3D licensing. **Flags Tripo's free-tier output rights as contradictory across sources** (avoid shipping) and **Hunyuan3D's self-hosted license excludes the EU/UK/South Korea** (needs the human's location confirmed).
- **[Headless-Pipeline-and-Testing.md](Headless-Pipeline-and-Testing.md)** — Build/test/capture/profiling commands, checked against the installed 5.8.4 binaries. **Corrects two of BUILD-PLAN's exact commands that would fail as written** (`-csvprofile`/`-csvframes` don't exist in 5.8.4; `-TestExit` is silently ignored by the engine). Confirms Unreal MCP is genuinely Epic's own plugin, recommends leaving it off (needs an open editor, breaks the one-process rule on this hardware).
- **[Cross-Doc-Tensions.md](Cross-Doc-Tensions.md)** — recommendations from different docs that conflict once combined: the Nanite streaming pool is budgeted by the performance doc for environment-only use but the destruction doc separately proposes using it for debris too; a Chaos break event and the AI's cover re-query it triggers land on the same frame on a CPU with no spare thread.

## Open items for `Docs/DECISIONS.md` once decided

1. Lumen Lite vs forcing the old screen-probe path on Medium.
2. Whether destructible Geometry Collection debris uses Nanite (BUILD-PLAN's wording already reads "no").
3. Texture/Nanite streaming pool sizes for Medium (BUILD-PLAN's 1000MB vs stock 600MB; recommend 700-800MB + 256MB Nanite, re-measured).
4. ElevenLabs free-tier commercial-use restriction — accept for a never-sold free release, or move PROCTOR/Ilku/Orl to another TTS source.
5. Keep Tripo free-tier outputs out of the shipped build until its terms are read by hand.
6. Confirm the project's/human's location is outside the EU/UK/South Korea before using self-hosted Hunyuan3D commercially.
7. Whether to enable the Unreal MCP plugin (recommendation: not yet).
