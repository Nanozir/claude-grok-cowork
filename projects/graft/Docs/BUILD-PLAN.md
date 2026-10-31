# GRAFT build plan (vertical slice "Descent")

The technical source of truth for the build. Design lives in `Docs/GDD.md` (read the section you need, not the whole file). Project rules live in `CLAUDE.md`. Current state lives in `Docs/PROGRESS.md`. Update PROGRESS.md at the end of every milestone.

---

## 1. Milestones (in order; each ends with a report to the human)

Prove the fun first, spectacle last. Nothing in a later milestone starts before the earlier gate passes.

**M0 — Setup.** Check that Visual Studio (2026 is Epic's recommendation for 5.8; 2022 17.14+ also works) and git-lfs are installed. Stop and tell the human if not. If a 5.8 project won't build with VS 2026, set the editor's source-code editor to "Visual Studio 2026" (a known 5.8 issue). Optionally enable Epic's experimental **Unreal MCP** editor plugin (local HTTP, no auth, so local use only) so the agent can drive the open editor, as an extra to the headless pipeline, not a replacement. Write `Graft.uproject` and `Source/` by hand, or copy `Engine\Templates\TP_FirstPerson`. Generate project files. Set the DDC on D:. Set up `.gitignore`, `.gitattributes` (LFS), and `BuildConfiguration.xml` with `MaxParallelActions=3`. Disable every unused default plugin. Enable GAS, Enhanced Input, StateTree, GameplayStateTree, EQS, Chaos, Niagara, MetaSounds and Python Editor Script Plugin. Create scalability presets (Section 4), the `Docs/` files and `Tools/`. Write the `Graft.CaptureShots` console command (Section 3). **Done when:** the project builds headless, opens, a capture of an empty test map produces a non-grey PNG, and a commit exists.

**M1 — "Body in a box" (THE GATE).** A greybox courtyard. UE first-person arms plus a full-body shadow mesh (full-body first person comes later). The two-layer body: five shell zones, breaches, regeneration only while moving, pilot vitals with no regeneration, and death from vitals. Thorn Rifle and the Directorate rifle pick-up. Rifleman and Hammer Crew (spotter plus gunner) enemies. A debug UMG HUD. One looping breath sound pitched by vitals. Automation tests for every damage and regeneration rule. **Gate: the human plays it and says go or no-go.** If no-go, iterate on M1 only. Nothing else starts until go.

**M2 — Strength and choices.** Charge, grab and throw, the human shield, door punch, and a tearable static APC door. Hollowcannon (wrist shotgun). Conscript with morale states and surrender. The scripted beat-7 conscript. The Evaluation logger (tags to save game, never shown). **Done when:** functional tests show surrender and flee happening, and the human confirms charge and grab feel heavy.

**M3 — Greybox the level, beats 6–12.** Ruined apartment, stairwell, courtyard, rooftop hammer-crew breach, tram yard (riflemen, hammer crews, conscripts, static APC; no helicopter), the battery (four guns, three ways to destroy them), black rain. Persistent `L_Descent` plus one streamed sublevel per beat. **Done when:** a capture-set screenshot of every beat exists, each piece has passed the MVP critic loop (Section 6) or hit its cap, and a scripted bot or the human can play beats 6–12 start to finish.

**M4 — Visor HUD, PROCTOR, audio.** The diegetic visor HUD (zone diagram with shape fills, heartbeat line, dead hivemind panel with static, helmet-crack corruption). The PROCTOR subsystem with subtitles and Data Table lines. The breathing MetaSound driven by vitals, sprint and damage. Tamri radio barks. Placeholder radio beeps for lines with no audio yet. Export `Docs/VO/<Speaker>.csv` scripts. **Done when:** the human can tell shell and pilot state with the HUD off (sound only), and with the sound off (HUD only).

**M5 — Beats 1–5: cradle, drop, impact** (MVP critic loop on the drop pieces). The launch bay with 12 red-eyed Zeiph and a static captured-texture reflection showing the player's amber eyes (no planar reflection). The pod interior with head-look and brace. Exterior entry made in Sequencer (Sky Atmosphere, Volumetric Clouds, Niagara heat and flak, other pods as meshes with trails). The pod hit and spin. The pre-cached Chaos impact through three floors. **Done when:** a capture set of the drop exists, and the full slice (beats 1–12) plays start to finish.

**M6 — Beauty pass and the gauntlet.** Final lighting, rain and fog, destruction, VFX and audio in the hero spaces: pod entry, courtyard, black rain. The critic loop (Section 6) runs here, on fixed bookmarks. Profile in a packaged Development build. **Done when:** the dev-PC budget is met on Medium, each hero bookmark has passed the critic or hit the round cap with its remaining gap written down, and High/Epic presets exist (labelled "not measured").

**Deferred past the slice:** attack helicopter (a scripted fly-by at most), drones, EMP sapper, APC turret AI, Motion Matching, Control Rig hand IK (use montages), Mass AI, Common UI, Quartz music sync, Bleed, MetaHumans, World Partition, planar reflections, Spine Lance (unless M3 needs a heavy weapon for the battery).

---

## 2. System specs (only what the slice needs)

### Player: `AGraftCharacter`
- **M1:** first-person arms mesh plus a full-body shadow-only mesh. **M5+:** full-body first person if time allows.
- Capsule for a 2.4 m character, in a human-scale world.
- Walk 450 cm/s, sprint 900 cm/s, slow acceleration, short momentum carry. Footstep camera shake scaled by speed. Ledge climb up to 200 cm. No double jump, no wall run.
- Abilities are `UGameplayAbility` classes. Numbers live in Data Assets or Curve Tables, never in code.
  - **Charge (M2):** a sprint into a shoulder-barge. Knocks infantry down in a cone and breaks `Graft.Breakable.Light` walls.
  - **Ground Slam (M3, optional):** radial stagger. Breaks `Graft.Breakable.Floor`.
  - **Echo pulse (M4):** 15 m sonar sweep, outlines enemies through walls for 2 s using custom-depth stencil. 12 s cooldown.

### Two-layer body (M1; GDD 4.2)
- **`UGraftBodyAttributes`:** ShellHelmet, ShellTorso, ShellSpine, ShellArmL, ShellArmR (each with a max), PilotVitals and PilotVitalsMax. Bleed is deferred.
- **Hit-zone map:** physics-asset bone to zone.
- **Damage execution (`UGameplayEffectExecutionCalculation`):** check the damage type against the zone's armour. Small arms: heavy reduction. Anti-armour, explosive, EMP: little reduction. A zone with shell above 0 takes the damage. A breached zone (0) passes the damage to PilotVitals with a multiplier. Concussive and EMP damage always deal a small amount to the pilot.
- **Regeneration:** only while velocity is above a threshold; paused for 3 s after any damage; disabled while the spine is breached.
- **Breach effects (Gameplay Effects plus Cues):** arm breach adds recoil and sway, helmet breach adds a visor crack and HUD corruption, spine breach stops regeneration.
- **Death:** PilotVitals at 0, even with a full shell. Heartbeat flatline, breathing stops, the HUD stays on.

### Weapons
- **`AGraftWeaponBase`:** fire modes, ammo, recoil from Curve Tables, ADS as a slight visor zoom, hitscan or projectile per weapon, impact effects from a physical-material table.
- **Slice weapons:** Thorn Rifle (projectile; pins ragdolls to walls on kill), Hollowcannon (wrist shotgun; breaches light walls), the Directorate rifle (one-handed, weak against armour), the hammer crew's anti-armour rifle (heavy, slow; the one human weapon that matters). Brand Charges (sticky grenades) if M3 needs them for the battery.
- **Loadout:** 2 primaries, 4 grenades.

### Interaction (M2)
- **Grab:** physics props under 400 kg, and staggered or surrendered humans. Throw with a charge-up. A held human works as a shield.
- **Tear:** actors implementing `IGraftTearable` (APC door, mounted gun) play a two-handed montage and spawn the detached part.
- **Door punch:** three punches, escalating destruction.

### AI (M1–M3)
- **StateTree** per enemy. **EQS** cover queries against a 2.4 m target. Most cover is destructible; re-query when it breaks.
- **Enemies:** Conscript, Rifleman, Hammer Crew (pair: when the spotter dies, the gunner's accuracy drops), static APC (tearable door only).
- **Morale:** drops when the Graft is close, an ally dies nearby, or the AI sees a grab or tear. States: Steady, Shaken, Broken (flee), Surrendered (Conscripts and Riflemen only).
- **Breach targeting:** `AI.Trait.Tactical` enemies prefer breached zones (tunable weight).
- **Radio barks (M4):** squad-level callouts the player can hear near radios. Captain Orl's battery lines use the same system with a special speaker.
- **Zeiph allies (black rain only):** walk in sync, ignore fire, never react to the player.
- **Budget:** 10 enemies at under 4 ms AI game-thread cost in `stat game`.

### Narrative
- **`UProctorSubsystem` (`UWorldSubsystem`):** plays lines from a Data Table with priority, interrupt rules, cooldowns and gameplay-tag conditions. Writes subtitles. Mixed close and centred; distorted when the helmet is breached.
- **`UEvaluationSubsystem`:** logs tag-plus-payload events (`Eval.Kill.Combatant`, `Eval.Kill.Surrendered`, `Eval.Kill.Civilian`, `Eval.Spared.Fleeing`, `Eval.Override.Used`, `Eval.Damage.Pilot`, objective times) to the save game. **It never shows a score.**

### Voice pipeline
- Lines live in Data Tables with stable row names. Export `Docs/VO/<Speaker>.csv` (row name, line, emotion note) for the human. Import WAVs named `VO_<Speaker>_<RowName>.wav` with an editor Python script. Until a line has audio, show its subtitle with a radio beep.
- Radio band-pass, PROCTOR's digital edge and the breach distortion are MetaSound and submix effects, not baked into the files.
- **Voices:** ElevenLabs IDs: PROCTOR `gyUnbYHg44xp00IFNZ7R`, Ilku `qbeQL6vXuJyFKrh7SjMu`, Captain Orl `jZCT4q52RiY7S3HofKq5` (all 3 free slots used). GRAFT-11 is a local Chatterbox clone from `Docs/VO/Reference/Graft11_preview_3.mp3`. Aria and the Tamri barks use Chatterbox or Kokoro. The human generates the audio from the CSVs.
- **Write lines that TTS reads well:** short, complete sentences. No stuttered repeats ("bad, bad roof"), bare fragments or trailing-off muttering. Put delivery (whispered, out of breath) in the emotion column or as ElevenLabs audio tags.

### Art, assets and licences
- You can't make final art. Use greybox, Starter Content and free assets the human adds (Fab free content, the free Megascans set, Poly Haven, ambientCG, Mixamo, the Game Animation Sample). Every placeholder goes in `Content/Placeholder/`. Never block a system on missing art.
- **AI-made models** (Meshy, Tripo, Hunyuan3D): help the human clean them up with Blender Python scripts (decimate, fix normals, split armour pieces, UVs) and give exact Unreal import settings. Build **one** Zeiph body mesh. The standard Zeiph is the Graft mesh with red eye emissive and a smooth plate over the spine. Concept art is in `Docs/Concept/`.
- **`Docs/LICENSES.md`:** every external asset, sound and voice: name, source URL, licence, credit needed. Flag anything non-commercial (ElevenLabs free tier) or CC BY (Meshy and Tripo free outputs).
- Ask before adding any third-party plugin or Fab content. Epic's built-in plugins are fine.

### Destruction
- Chaos Geometry Collections at about 300 pieces each, debris lifetime 5 s. The pod impact is a pre-cached simulation. Fracture assets in a separate editor session.

### Level
- Persistent `L_Descent` plus one streamed sublevel per beat (`L_Descent_B01_Cradle` ... `L_Descent_B12_BlackRain`). Test maps: `L_Test_Body`, `L_Test_Combat`.
- Mood: night, rain, fog, sodium lights, brutalist tower blocks, tram wires, posters in an invented script.

---

## 3. Headless verification (the agent can't see PIE, so it uses these)

**Build** (the editor must be closed, or Live Coding locks the DLLs):
```
"D:\Epic Games\UE_5.8\Engine\Build\BatchFiles\Build.bat" GraftEditor Win64 Development -Project="D:\Projects\Graft\Graft.uproject" -WaitMutex
```

**Generate project files:**
```
"D:\Epic Games\UE_5.8\Engine\Binaries\DotNET\UnrealBuildTool\UnrealBuildTool.exe" -projectfiles -project="D:\Projects\Graft\Graft.uproject" -game -engine
```

**Automation tests:**
```
"D:\Epic Games\UE_5.8\Engine\Binaries\Win64\UnrealEditor-Cmd.exe" "D:\Projects\Graft\Graft.uproject" -ExecCmds="Automation RunTests Graft;Quit" -unattended -nullrhi -nosplash -nosound -log -ReportExportPath="D:\Projects\Graft\Saved\TestReport"
```
`-TestExit` is ignored by the engine (only UAT's RunProject reads it), so it's dropped above; the `;Quit` inside `-ExecCmds` is what ends the process and sets the exit code (0 all pass, -1 any fail). Parse `Saved/TestReport/index.json`. Use `AFunctionalTest` actors in `L_Test_Body` for the movement-based rules; a test's full name is `Project.Functional Tests.<map path>.<actor label>`, and its map must be saved before the test is found. Screenshot tests can't run under `-nullrhi`. Write results to `Docs/TESTING.md`.

**Screenshots:** a bare `HighResShot` fires before shaders and streaming finish and gives grey frames, and no console command waits for that on its own — build `Graft.CaptureShots <Set>` (written in M0) on `UAutomationBlueprintFunctionLibrary::FinishLoadingBeforeScreenshot()` to flush loading, streaming and shader compilation first. It then moves a camera through named bookmarks from a `UGraftCaptureSet` Data Asset, calls `FScreenshotRequest::RequestScreenshot` for each (wait for `FScreenshotRequest::OnScreenshotRequestProcessed` before moving the camera again), and quits.
```
"D:\Epic Games\UE_5.8\Engine\Binaries\Win64\UnrealEditor.exe" "D:\Projects\Graft\Graft.uproject" /Game/Graft/Maps/L_Descent -game -windowed -ResX=1920 -ResY=1080 -unattended -nosound -ExecCmds="Graft.CaptureShots Courtyard" -log
```
Screenshots land under `Saved/Screenshots/WindowsEditor/` for this `-game` editor run, `Saved/Screenshots/Windows/` for a packaged build. Copy the ones worth keeping to `Docs/Captures/<milestone>/`. Look at every capture before saying a visual task is done.

**Perf:** `-csvprofile`/`-csvframes` don't exist in 5.8.4. Use `-csvCaptureFrames=1800`, or better, have `Graft.Flythrough` run the `CsvProfile Frames=1800` console command once it settles (`CsvProfile ExitOnCompletion` to quit when the capture ends). Use `-muteaudio`, not `-nosound`, on perf runs — `-nosound` disables the audio engine and hides its CPU cost. Summarize `Saved/Profiling/CSV` with `Engine\Binaries\DotNET\CsvTools\PerfreportTool.exe -reportType Default30fps` (there's no shipped `flythrough` report type). Add `-trace=cpu,gpu,frame -tracefile="D:\Projects\Graft\Saved\Traces\<name>.utrace"` for Unreal Insights — without `-tracefile` the trace only persists if an Insights window happens to be open. Final numbers come from a packaged Development build, because editor `-game` reads high. Write them to `Docs/PERF.md`.

**Editor Python** (`UnrealEditor-Cmd.exe <project> -run=pythonscript -script=Tools\<x>.py`) creates and edits assets. It runs on Unreal's bundled Python, not on `C:\Python314`.

**Feel** (weight, heaviness, fun) is judged by the human. Ask, don't claim it.

---

## 4. Hardware settings (GTX 1650 4 GB, Ryzen 3 3200G, 16 GB RAM)

- **Only one Unreal process at a time** (editor, build or game), because of VRAM and RAM. Use the `Saved/gpu.lock` rule in `CLAUDE.md`.
- **First open:** expect 1–3 hours of shader compiling. Tell the human, and don't treat it as a hang.
- **Humans:** the UE5 mannequin skeleton (Manny/Quinn) or Mixamo meshes with helmets. No MetaHumans in the slice.
- **Lumen (Medium):** software only, `r.Lumen.ScreenProbeGather.ScreenTraces 1`, `r.Lumen.Reflections.Allow 0`, `r.ScreenPercentage 67` with TSR. **Low:** no Lumen, Distance Field AO.
- **Shadows:** Medium and Low use cascaded shadow maps (`r.Shadow.Virtual.Enable 0`). High and Epic use Virtual Shadow Maps.
- **Nanite:** environment kit pieces only. Not skinned meshes, foliage or translucency.
- **Streaming pool:** `r.Streaming.PoolSize 1000` in game, lower in the editor. Editor viewport scalability defaults to Medium, with real-time off.
- **Budget:** 30 fps at 1080p, Medium, TSR, on the dev PC. On an RTX 3070-class GPU: 60 fps at 1440p, High. That one is labelled "not measured".
- **DDC:** `setx UE-LocalDataCachePath D:\UE_DDC`. Zen data follows it to `D:\UE_DDC\Zen` automatically — don't set `UE-ZenSubprocessDataPath`, it's an internal variable the engine sets for its own child processes, not a user override. Confirm with a `LogZenServiceInstance` line in the editor log naming the D: path, and check Editor Preferences' Local Derived Data Cache path isn't overriding it back to C:.

---

## 5. Parallel work rules (sub-agents)

- **Model:** every sub-agent runs on Opus at medium effort (`model: "opus"`, `effort: "medium"`). The lead runs on whatever the human picked for the session.
- **Only the lead builds, runs tests, launches the editor or captures screenshots.** It takes `Saved/gpu.lock` first. Sub-agents write C++, Python tools, CSV/JSON data and docs in parallel, then hand back to the lead.
- **Ownership by folder**, recorded in `Docs/OWNERS.md`:
  - Body + Abilities (`Source/Graft/Body`, `Abilities`)
  - Weapons + Interaction (`Weapons`, `Interaction`)
  - AI (`AI`)
  - Narrative + UI + Audio (`Narrative`, `UI`, `Audio`)
  - Level (sublevels and `Tools/AssetGen/Level*`)
  A sub-agent never edits another owner's files. Shared headers (`GraftGameplayTags.h`, attribute sets, `Graft.Build.cs`) belong to the lead; sub-agents ask for changes.
- **No hand-edited binary assets.** Every `.uasset` the agents make comes from a checked-in script in `Tools/AssetGen/*.py`, run headless by the lead. Data Tables are imported from CSV/JSON in `Content/Graft/Data/Source/`. If an asset conflicts, regenerate it; never merge it.
- **One owner per sublevel.** Blueprints are thin subclasses with no graph logic.
- **No git worktrees.** Each one would need its own ~10 GB Intermediate folder and a full rebuild.

---

## 6. The gauntlet critic (generator and critic pairs)

**The bar** (chosen by the author): **Halo 3: ODST** (Master Chief Collection on PC) for the drop, and **Titanfall 2**'s campaign for combat, HUD and feel. Both run on the dev PC, so the human can capture matching frames.

**Two loops:**
- **MVP loop (M3–M5, greybox):** at most **2** critic rounds per piece. The critic judges only function: layout, scale against a 2.4 m player, sightlines, timing, readability, and whether the GDD beat happens. Looks don't count yet.
- **Polish loop (M6, hero pieces):** at most **5** critic rounds per piece. Full blind A/B.

**Pieces and references** (the lead may split a piece further and must record the reference used):

| Piece | Reference | How the critic checks |
|---|---|---|
| Drop pod (beats 1–4: bay, drop, entry, hit) | ODST opening: the pod fall over New Mombasa, other pods in the sky | Matched screenshots at the pod window and the flak moment; a 10 s clip for pacing and shake |
| Pod impact (beat 5) and door punch (beat 6) | ODST: the pod landing and door blowing open | Matched screenshots at three moments of the crash; a clip for dust, debris and the silence after |
| Courtyard arena (beat 8) | Titanfall 2 campaign city fights | Screenshots from the entry and from an overlooking window: sightlines, cover spacing, scale |
| Strength interactions (charge, grab, tear) | Titanfall 2 executions and mantling for weight and timing | Checklist (reach, grip, sound, the part is usable), clip compared for weight and timing |
| Visor HUD (boot, breach) | Titanfall 2's pilot HUD and the ODST helmet HUD | Screenshots at full health, at helmet breach; checklist: readable with colourblind filters, parallax feels projected |
| Breathing and audio mix | ODST's helmet-and-silence moments | Checklist (rate tracks vitals, no audible loop, close and centred, PROCTOR dry) plus a loudness log of a clip, listened to with the HUD off |
| Tamri soldier AI | Titanfall 2 grunts (callouts, flanking, panic) | Per-behaviour checklist: freeze, fire, flee, surrender, spotter-dies-gunner-misses, re-query cover; a log of morale states from a 10-enemy fight |
| Black-rain ending (beat 12) | ODST "Mombasa Streets": night rain, wet streets, a skyline full of pods | Matched screenshots of the skyline and street; a 15 s clip of the squad walking past without turning |

**Secondary references** (use only if the human owns the game and a piece has no good ODST or Titanfall 2 equivalent): Metro Exodus "Volga" homes for the ruined apartment; Metro Exodus gas-mask view and breathing for the HUD and audio; Half-Life 2 "Anticitizen One" for the courtyard's scale; Half-Life 2 Combine barks and Halo 3 Grunt panic for AI; Halo 3 turret rip for the tear; Halo Infinite's Master Chief for the armour read at mid-distance.

**Rules:**
- **The human supplies references.** Screenshots or short clips captured from their own copies, saved to `Docs/References/<Piece>/`, with the exact mission and moment in `Docs/References/REFERENCES.md`. They're for private comparison only: never commit or ship them (`Docs/References/` is in `.gitignore`). If a reference is missing, ask; don't swap in a vaguer one.
- **Bookmarks:** each matched shot is a named camera bookmark in the `UGraftCaptureSet` Data Asset, set to the reference frame's angle. Captures use the Section 3 pipeline at 1080p, Medium.
- **The critic** is a fresh sub-agent (Opus, medium) that never sees the generator's reasoning. Visual pieces: two images labelled only A and B, in random order, and it commits to "which one is the real game" before the reveal. Non-visual pieces: it scores a checklist built from the reference, line by line. If it can tell (or a line fails), it names the **single biggest remaining gap** and the piece goes back to its generator.
- **The honest bar:** the critic judges at the Medium preset on the dev PC, against the reference's equivalent moment. A piece **passes** when the critic can't confidently pick, picks GRAFT as the real game, **or** when every gap it names needs paid art or better hardware. Log those gaps in `Docs/ART_GAPS.md` (piece, gap, what it would need) and move on.
- **Caps are hard.** At the cap, stop and write the biggest remaining gap in `Docs/PROGRESS.md`.
- **Progress page:** keep `Docs/progress.html` (plain local HTML, no server) updated after every round: each piece, its latest capture next to the reference, the verdict, the round count and cap, and the biggest gap.
