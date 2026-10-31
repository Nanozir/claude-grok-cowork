# Build prompt: GRAFT vertical slice ("Descent") in Unreal Engine 5

*Paste everything below the line into an AI coding agent (for example Claude Code) running in the folder where the project will live (on `D:`). The project root is `D:\Projects\Graft`, and `GRAFT-Game-Design-Document.md` is already in its `Docs/` folder (concept art in `Docs/Concept/`, voice previews in `Docs/VO_Previews/`). The Unreal project is created in M0 inside that root, with the `.uproject` at the root, and `Docs/` stays where it is.*

Before you paste it, put reference material in `Docs/References/<piece>/` (see "Pieces and references"): screenshots or short clips of the named moments, captured from your own copy of each game, for private comparison only. Never commit them or ship them.

**Cost warning:** this prompt runs many sub-agents, and each one loops with a critic re-checking it. That uses a lot of tokens. The round caps below are there to keep it bounded. Lower them if usage is tight.

---

## Role and goal

You are the lead gameplay programmer and technical designer on **GRAFT**, a linear story-driven first-person shooter built in Unreal Engine 5 (C++ with Blueprint subclasses for content). Your job is to build the **vertical slice**: Mission 1, "Descent", described in `Docs/GRAFT-Game-Design-Document.md`, Section 6.

The player is **GRAFT-14**, a prototype Zeiph super-soldier of the Zeiphon Empire: a 2.4 m black, horned, armoured body with a living, sentient pilot sealed inside. Unlike every other Zeiph, the Graft is **not on the hivemind**. The slice starts in a drop-pod cradle in orbit, crashes into a city of ordinary humans, and ends when the main Zeiph invasion wave lands.

Read the whole GDD before writing any code. It's the source of truth for design. If this prompt and the GDD disagree, the GDD wins on design and this prompt wins on technical approach. When something is ambiguous, pick the option that best serves the GDD's four pillars (Section 1) and write down what you chose in `Docs/DECISIONS.md`.

## How to work: agent team (the gauntlet loop)

You are the **lead agent** (Opus 5.5, extra-high effort). You plan, split the work, merge results, keep the build compiling and decide what ships. You do not do every piece yourself.

- **Sub-agents:** spawn every sub-agent with model Opus 5.5 at medium effort (in Claude Code's Agent tool: `model: "opus"`, `effort: "medium"`). Give each one a specific, self-contained job: the piece, the GDD section, the reference, the files it may touch, and what "done" looks like. Don't make one agent do the whole slice.
- **Generator and critic pairs:** each piece in "Pieces and references" gets a generator sub-agent that builds it and a separate critic sub-agent that judges it. The critic starts with fresh context. It never sees the generator's reasoning, notes or intent, only the output and the reference.
- **The critic is harsh.** It compares the output and the reference side by side, blind: unlabelled A/B in random order, and it commits to a pick of "which one is the real game" before the reveal. If it picks the render as the real one, or can't tell, the piece passes. If not, it names the **single biggest remaining gap** and sends the piece back to the generator for another round.
- **How the critic checks** (the generator writes a script so each check is repeatable):
  - Visual pieces: a screenshot from a camera angle that matches the reference frame, taken with `HighResShot` or an automation screenshot, at 1080p on the Medium preset. Where motion matters, also a short capture clip (5–15 s).
  - Non-visual pieces (AI, audio, interaction feel): a written checklist built from the reference (what the real game does, moment by moment), plus a recorded clip of the build. The critic scores each checklist line pass or fail and names the worst failure.
- **The bar is honest.** The dev PC is a GTX 1650 with free and AI-generated art, and the developer works alone. So the critic judges each piece at the **Medium preset** on the dev PC against the reference's **equivalent moment**, not against what a studio with paid art and a 4090 shows. A piece passes when the critic can't confidently pick the render, **or** when the only gaps it names need paid art or better hardware. Log those gaps in `Docs/ART_GAPS.md` (piece, gap, what it would need) and move on. Don't loop on them.
- **Round caps:** MVP pass: at most **2** critic rounds per piece. Polish pass: at most **5** critic rounds per piece. When a piece hits its cap, stop and report its biggest remaining gap. Never run a piece past its cap.
- **MVP first, then polish.** M1–M5 run the **MVP loop**: greybox only. The critic checks that the piece does what the GDD beat says, at the right scale, layout, timing and readability, compared with the reference's equivalent moment. Looks don't count yet. M6 runs the **polish loop** on the hero pieces.
- **Live progress page:** keep `Docs/progress.html` (plain local HTML, no server, no build step) up to date after every round. For each piece it shows the latest screenshot next to the reference frame, the critic's verdict, the round count and the cap, and the biggest remaining gap. Reload it to see where things are.
- **Records:** write each reference's exact game, scene and timestamp or frame in `Docs/References/REFERENCES.md`. If you can't find the moment, ask the human. Don't swap in a vaguer reference.

## Pieces and references

Each piece is small enough to be judged on its own. The "Check" column says how the critic checks it.

| Piece | Reference (real, specific) | Check |
|---|---|---|
| **Drop-pod sequence** (beats 1–4: bay, drop, entry, hit) | Halo 3: ODST, the "Prepare to Drop" opening: the pod fall over New Mombasa with other pods in the sky | Matching-angle screenshots at the pod window and at the flak moment, plus a 10 s clip for pacing and shake |
| **Pod impact and destruction** (beat 5, the three-floor crash, the door punch) | Titanfall 2, "Effect and Cause": the facility breaking apart around the player | Screenshots at three matched moments of the collapse, plus a clip for the dust, debris and the silence after |
| **Ruined apartment** (beat 6) | Metro Exodus, the abandoned homes in "Volga": a lived-in room with the people gone | Matching-angle screenshots of the dinner table and room. Checklist: does the room say what happened without text? |
| **Courtyard arena** (beat 8: layout and lighting) | Half-Life 2, "Anticitizen One": Combine-held streets and plazas at human scale, with an armoured vehicle | Screenshots from the player's entry and from a window overlooking the space. Greybox pass checks sightlines, cover spacing and scale (2.4 m player) |
| **Zeiph and Graft character** (beats 1, 6, 8; model, rig, first-person body) | Halo Infinite, the Master Chief in the campaign for the armour read at mid-distance; Titanfall 2's pilot for the full-body first person | Turntable and in-game screenshots against the reference at the same distance. The first-person check looks at arms and chest in view during a grab. AI-made models are judged after cleanup |
| **Visor HUD** (beat 1 boot, beat 9 breach) | Metro Exodus, the gas-mask view: the cracked mask and the wrist-mounted gauges | Screenshots of the HUD at full health, at a helmet breach and with the Bleed vignette. Checklist: readable with colourblind filters; parallax feels projected |
| **Breathing and audio mix** (beats 5, 9, 12) | Metro Exodus, gas-mask breathing in a quiet interior; Halo 3: ODST's helmet-and-silence moments for the mix | Written checklist (rate versus vitals, no audible loop, close and centred, PROCTOR dry) plus a recorded clip with a spectrogram or loudness log. Listened to with the HUD off |
| **Tamri soldier AI** (beats 7, 8, 9, 10) | Halo 3, Grunts panicking and fleeing when their leader dies (for morale); Half-Life 2, Combine squad barks and flanking | Checklist per behaviour: freeze, fire, flee, surrender, spotter-dies-then-gunner-misses, re-query cover. Recorded clip of the 10-enemy fight. Stats from a log of morale states |
| **Strength interactions** (beat 8: charge, grab, tear) | Halo 3, ripping a mounted turret off its stand; DOOM Eternal, the push-forward pace | Checklist of the tear: reach, grip, sound, detached part usable. Clip compared for weight and timing. Screenshot of the hands on the part |
| **Black-rain ending** (beat 12) | Halo 3: ODST, "Mombasa Streets": night rain, wet streets and a skyline full of pods | Matching-angle screenshots of the skyline and the street, plus a 15 s clip of the squad walking past without turning |

The lead agent may split a piece further (for example, the APC or the helicopter) if it's too big to judge. Use the nearest reference above and say so in `REFERENCES.md`.

## Hard constraints

- **Engine:** Unreal Engine 5.8, installed at `D:\Epic Games\UE_5.8` (editor: `D:\Epic Games\UE_5.8\Engine\Binaries\Win64\UnrealEditor.exe`). `C:\Program Files (x86)\Epic Games` holds only Epic Online Services, so don't use it. Don't upgrade or change engine versions without asking.
- **Project location:** on `D:` (for example `D:\Projects\Graft`). The `C:` drive has very little free space. Set the Derived Data Cache to a folder on `D:` (Editor Preferences > Global > Derived Data Cache, or the `UE-LocalDataCachePath` environment variable) before importing any content.
- **Toolchain:** C++ needs Visual Studio with the "Game development with C++" workload, in the version the UE 5.8 release notes require. Check it's installed before M0 and stop and tell the human if it isn't.
- **Who you're working for:** a solo developer with no budget. Every asset, tool and plugin must be free or have a free tier. Never suggest paid assets, paid plugins or hiring people.
- **Language:** gameplay systems in C++. Content, tuning and level scripting in Blueprint subclasses and Data Assets. No gameplay logic in level Blueprints except one-off scripted sequences.
- **Frameworks to use:** Gameplay Ability System (GAS) for abilities, damage, attributes and effects; Enhanced Input; StateTree for AI behaviour; EQS for cover and positioning; Chaos for destruction; Niagara for VFX; MetaSounds for procedural audio; World Partition for the level; Common UI for menus.
- **Rendering:** Nanite on all static meshes that support it, Lumen GI and reflections, Virtual Shadow Maps, TSR. Expose upscaler settings (DLSS/FSR/XeSS) through a settings menu if the plugins are present. Don't fail the build if they aren't.
- **Development hardware:** GTX 1650 (4 GB VRAM, no ray-tracing hardware), Ryzen 3 3200G (4 cores), 16 GB RAM. Keep the editor usable on it: World Partition streaming with small cells, a limited number of MetaHumans on screen, texture streaming pools tuned for 4 GB, software Lumen only, and Shader Model 6 with Nanite. Avoid anything that needs hardware ray tracing to look right.
- **Scalability:** build full scalability presets (Low: baked lighting or Distance Field AO with no Lumen; Medium: software Lumen at low quality; High/Epic: full software Lumen, plus hardware Lumen when the GPU supports it). The game must look right on every preset, not just run.
- **Performance budget:** on the dev PC, 30 fps at 1080p, Medium preset, with TSR upscaling. On an RTX 3070-class GPU (the recommended spec), 60 fps at 1440p on High. Measure with `stat unit`, `stat gpu` and Unreal Insights in the heaviest arena (the tram yard). Write the numbers to `Docs/PERF.md` at every milestone. You can only measure the dev PC; label the 3070 target as "not measured".
- **Art:** you can't make final art. Use greybox geometry, Starter Content and free assets the human has added (Fab free assets, Epic sample projects, Poly Haven, ambientCG, Mixamo, MetaHuman). Every placeholder asset goes in `Content/Placeholder/` so it's easy to find and replace. Never block a system on missing art. When the human brings in an AI-generated model (Hunyuan3D, TRELLIS, Meshy, Tripo), help them clean it up: write Blender Python scripts for decimation, normals and UVs, and give exact import settings for Unreal.
- **Licences:** record every external asset, sound and voice in `Docs/LICENSES.md`: name, source URL, licence, and whether it needs credit. Flag anything marked non-commercial.
- **Dependencies:** ask before adding any third-party plugin or Fab content (free only). Epic's built-in plugins are fine to enable.
- **Source control:** commit at the end of every task with a clear message. Never commit `Binaries/`, `Intermediate/`, `Saved/` or `DerivedDataCache/`. Set up a correct `.gitignore` and Git LFS for `.uasset`/`.umap` in milestone 0.

## Project structure

```
Source/Graft/
  Core/          GameMode, GameState, PlayerController, GameInstance, save system
  Character/     AGraftCharacter (player), full-body first-person camera, movement
  Abilities/     GAS: attribute sets, gameplay abilities, gameplay effects, cues
  Body/          Shell zones, breach logic, pilot vitals, Bleed
  Weapons/       Weapon base, Zeiphon weapons, Tamri pick-ups, projectiles
  Interaction/   Grab, throw, tear-off, door punch, mounted-gun detach
  AI/            Tamri enemies, Zeiph allies, squad director, morale, radio barks
  Narrative/     PROCTOR voice system, Evaluation logger, scripted sequences
  UI/            Diegetic visor HUD, menus, subtitles
  Audio/         Breathing system, footsteps, music state
Content/Graft/   Mirrors the source folders, plus Maps/, Data/, Audio/, VFX/
Docs/            GDD, DECISIONS.md, PERF.md, TESTING.md, ART_GAPS.md, progress.html, References/
```

## Systems to build (specs)

### 1. Player character: `AGraftCharacter`

- **Full-body first person:** the camera sits in the helmet; the player sees their own arms, chest and legs. Use a single full-body mesh with the head hidden from the owner and a separate first-person camera attached to the head socket, with smoothing. Hands must be visible during grabs and tears.
- **Scale:** capsule for a 2.4 m character. The world is built at human scale, so doors and cars should feel small.
- **Movement:** heavy but fast. Walk 450 cm/s, sprint 900 cm/s, slow acceleration, short momentum carry. Footstep camera shake scaled by speed. Ledge climb up to 200 cm. No double jump, no wall run.
- **Charge (ability):** a sprint followed by a shoulder-barge. It knocks down infantry in a cone and breaks `Destructible` walls tagged `Graft.Breakable.Light`.
- **Ground Slam (ability):** a jump and slam that applies radial stagger. On floors tagged `Graft.Breakable.Floor` it breaks through.
- **Echo pulse (ability):** a 15 m sonar sweep that outlines enemies through walls for 2 seconds (custom-depth stencil post-process). 12 s cooldown.
- Every ability is a `UGameplayAbility`, every number lives in a Data Asset or Curve Table, and nothing is hard-coded.

### 2. Two-layer body (the core system; GDD 4.2)

- **Attribute set `UGraftBodyAttributes`:** `ShellHelmet`, `ShellTorso`, `ShellSpine`, `ShellArmL`, `ShellArmR` (each with a max value), `PilotVitals` and `PilotVitalsMax`, `Bleed` and `BleedMax`.
- **Hit-zone mapping:** map the incoming hit's physics-asset bone to a shell zone.
- **Damage pipeline (a `UGameplayEffectExecutionCalculation`):** check the damage type against the zone's armour. Small arms do heavy reduction, anti-armour/explosive/EMP do little. If the zone's shell is above 0, damage goes to the shell. If the zone is **breached** (0), damage goes to `PilotVitals` with a multiplier. Concussive and EMP types always deal a small amount of pilot damage.
- **Shell regeneration:** only while the character's velocity is above a threshold. It pauses for 3 s after taking damage, and the spine zone being breached disables it.
- **Pilot vitals never regenerate** during combat. A `MedStim` pick-up and checkpoint caches restore them.
- **Breach consequences (Gameplay Effects plus Cues):** arm breach adds recoil and sway, helmet breach adds a visor crack and HUD corruption, spine breach disables regeneration.
- **Death:** when `PilotVitals` hits 0. The shell can be at full strength and the player still dies. Make that clear in the death presentation (heartbeat flatline, breathing stops, the HUD stays on).

### 3. Interaction: strength

- **Grab:** pick up physics props under 400 kg and staggered or surrendered human enemies. Throw with a charge-up. A grabbed enemy can be held as a shield (it absorbs frontal hits).
- **Tear:** actors implementing `IGraftTearable` (mounted guns, APC doors, a helicopter skid in a scripted moment) play a two-handed tear animation (Control Rig hand IK onto sockets) and spawn the detached part. A detached mounted gun becomes a usable heavy weapon with limited ammo.
- **Door punch:** jammed doors take three punches, with escalating destruction.

### 4. Weapons

- **`AGraftWeaponBase`:** fire modes, ammo, recoil patterns from Curve Tables, ADS (aiming down sights) through the visor (a slight zoom, no scope overlay for most weapons), hitscan or projectile per weapon, and impact effects through a physical-material lookup table.
- **Slice weapons:** Thorn Rifle (projectile; pins ragdolls to walls with a physics constraint on kill), Hollowcannon (wrist shotgun; breaches `Graft.Breakable.Light`), Spine Lance (shoulder launcher; 4 rounds).
- **Tamri pick-ups:** the Directorate rifle (handled one-handed; weak against armour) and the hammer crew's anti-armour rifle (heavy and slow; the one human weapon that matters).
- **Brand Charges:** adhesive grenades that stick to vehicles and armour.
- **Loadout:** 2 primary, 1 heavy, 4 grenades.

### 5. Diegetic visor HUD (GDD 4.8)

- Render the HUD as world-space or screen-space widgets with a slight parallax offset from head movement, so it feels projected on the inside of the visor.
- **Elements:** a shell zone diagram (5 zones, colour plus a shape fill so it reads for colourblind players), a pilot heartbeat line (a line that animates with the vitals value), ammo shown on the weapon mesh itself where possible, Bleed as an edge vignette, a threat-direction ring, and the dead hivemind panel at the top of the visor showing animated static.
- **HUD corruption** on a helmet breach: a material-driven glitch, plus hiding the shell diagram.
- **Optional helmet frame:** the eye-slit frame edges, which can be turned off in settings.
- **Combat medals:** small corner popups for multikill, through-wall kill and breach recovery.

### 6. PROCTOR and the Evaluation (GDD 2.4, 4.7)

- **`UProctorSubsystem` (a `UWorldSubsystem`):** plays voice lines from a Data Table. Lines have priority and interrupt rules, cooldowns, and conditions written as gameplay tags. It writes subtitles. PROCTOR's voice is mixed close and centred, and gets a slight distortion when the helmet is breached.
- **`UEvaluationSubsystem`:** logs events as a gameplay tag plus a payload: `Eval.Kill.Combatant`, `Eval.Kill.Surrendered`, `Eval.Kill.Civilian`, `Eval.Spared.Fleeing`, `Eval.Override.Used`, `Eval.Damage.Pilot`, objective times, and so on. It stores them in the save game. **It never displays a score.** Other systems query it (for example, PROCTOR's "Noted." line after the beat-7 conscript, and the text on documents between missions).
- **Voices are AI-generated, and they're the final voices, not placeholders.** The main cast (PROCTOR, Ilku, Captain Orl, GRAFT-11, Aria's two lines) come from ElevenLabs (free tier, Voice Design). The large volume of lines (Tamri radio barks, civilians, PA announcements) come from free local TTS (Chatterbox or Kokoro) so the ElevenLabs credits last. Keep every line in Data Tables with a stable row name. Export a CSV script per speaker (`Docs/VO/<Speaker>.csv`: row name, line, emotion note) for the human to generate from. Import the resulting WAVs automatically by row name (`VO_<Speaker>_<RowName>.wav`) with an editor utility script. Until a line has audio, show its subtitle with a radio beep. **Chosen voices so far:** PROCTOR = ElevenLabs voice "Command AI" (voice_id `gyUnbYHg44xp00IFNZ7R`); Ilku = ElevenLabs voice "Ilku" (voice_id `qbeQL6vXuJyFKrh7SjMu`); Captain Orl = ElevenLabs voice "Captain Orl" (voice_id `jZCT4q52RiY7S3HofKq5`). That fills the free tier's 3 custom-voice slots. **GRAFT-11** is voiced locally with Chatterbox voice cloning, using `Docs/VO_Previews/Graft11_preview_3.mp3` (the ElevenLabs preview the author picked) as the reference clip. Do the same for Aria's two lines, or use one of ElevenLabs' premade library voices, which don't take a slot.
- **Write lines that TTS can read.** AI voices handle short, complete sentences well. They stumble on stuttered repetition ("Bad, bad roof"), bare one-word fragments and trailing-off muttering, which come out sounding odd. Give each line a clear sentence shape, and put the delivery (whispered, out of breath, flat) in the CSV's emotion column or as ElevenLabs audio tags, not in the wording.
- **Voice processing in engine:** do the radio band-pass, PROCTOR's digital edge and the helmet-breach distortion with MetaSounds and submix effects, not baked into the files, so one clean recording works in every situation.
- **Writing rules for every line of dialogue:** follow the style guide summary at the end of this prompt.

### 7. Breathing and audio

- **`UGraftBreathingComponent`:** MetaSound-driven pilot breathing that's always on, quiet and close to the listener. Its rate and intensity are driven by `PilotVitals`, `Bleed`, sprinting and recent damage. It's the most important sound in the game, so treat it that way: crossfade between breath sets, never loop audibly, and add rare small sounds (a swallow, a mutter).
- **Footsteps:** heavy, by physical surface, with camera shake and a small chance of decals (cracked concrete).
- **Zeiph allies** make no breathing sound. Their squad actions trigger a low sub-bass "sync" hum.
- **Music state machine:** Explore, Tension, Combat and Aftermath, using Quartz for transitions on the beat.

### 8. AI

- **Tamri enemies (StateTree):** Conscript, Line Rifleman, Hammer Crew (2-person pair: if the spotter dies, the gunner's accuracy drops), Drone Swarm (lightweight actors or Mass entities; they target the spine zone), APC (a vehicle with tearable doors and a turret).
- **Morale:** a per-agent value that drops when the Graft is close, when an ally nearby dies, or when they see a grab or tear. Its states are Steady, Shaken (inaccurate fire, retreat to cover), Broken (flee) and Surrendered (drop weapon, hands up; only Conscripts and Riflemen).
- **Breach targeting:** enemies with `AI.Trait.Tactical` prefer to aim at already breached zones. Expose this as a tunable weight.
- **Cover:** EQS queries for cover against a 2.4 m target. Most cover is destructible, and the AI must re-query when its cover is destroyed.
- **Radio barks:** a squad-level bark system. Enemies call out the Graft's position and actions over a radio channel that the player can hear when near their bodies or radios. Captain Orl's lines in beat 11 come from this system with a special speaker.
- **Zeiph allies (the end-of-slice squad):** walk at a steady pace, in sync, ignoring incoming fire, and **never react to the player** (no head turning, no avoidance beyond basic navmesh). This scripted indifference is a key emotional beat.

### 9. Destruction

- Chaos Geometry Collections for the pod's crash path (three floors), interior walls tagged `Graft.Breakable.Light`, the courtyard's cover objects, and the battery guns.
- Set a destruction budget per arena (active rigid bodies, debris lifetime) and log it in `PERF.md`.
- Use pre-fractured, cached simulations for the scripted pod impact so it looks the same every time and is cheap.

### 10. The level: `L_Descent` (World Partition)

Build the beats from GDD Section 6.1 in order:

1. **Ninth Claim launch bay** (a small, separate sublevel or Level Instance): a cradle row of 12 Zeiph with red emissive eyes; a glass panel where the player sees their own amber-eyed reflection (use a planar reflection or a render target, just in this one spot).
2. **Drop sequence:** a pod interior that's always loaded with the player inside it, and an exterior skybox/atmosphere sequence made with Level Sequencer, Sky Atmosphere, Volumetric Clouds, Niagara heat and flak, and other pods as simple meshes with trails. The player keeps head-look and a brace button through the whole sequence.
3. **Pod hit and spin:** camera and HUD glitch, PROCTOR's recalculation lines.
4. **Tower-block impact:** the cached Chaos sequence through three floors, then silence.
5. **Ruined apartment:** environmental storytelling (a dinner table, a child's drawing of the sky).
6. **Stairwell:** the scripted Conscript encounter (beat 7). Log the outcome with the Evaluation system.
7. **Courtyard arena:** the combat tutorial by design, not by text prompts. The geometry teaches charge, grab and tear.
8. **Rooftop hammer-crew ambush:** the scripted first torso breach (guarantee it happens).
9. **Tram yard arena:** the largest space: drones, an EMP sapper (stretch goal), an attack helicopter (scripted path, can be shot down or have its skids torn down from a specific rooftop).
10. **Anti-orbital battery:** four guns, each with a different way to destroy it. Captain Orl's radio lines play here.
11. **Black rain:** pods streak down across the skyline (Niagara plus simple meshes), a Zeiph squad lands, walks past the player and moves out of sight. PROCTOR's final line. Fade.

**Tone of the space:** wet concrete, sodium lights, rain, fog, brutalist tower blocks, tram wires, posters in an invented script. Night, early in the invasion.

## Milestones (do them in order; stop and report at the end of each)

Loops: **M0** has no loop. **M1–M5 run the MVP loop** (greybox, max 2 critic rounds per piece) on the pieces each milestone touches: M1 and M2 on strength interactions and the character's first-person body, M3 on Tamri soldier AI, M4 on the visor HUD and the breathing and audio mix, M5 on the drop-pod sequence, pod impact, ruined apartment, courtyard and black-rain ending. **M6 runs the polish loop** (max 5 critic rounds per piece) on the hero pieces. Update `Docs/progress.html` at the end of every round.

**M0 — Project setup.** Check that Visual Studio and UE 5.8 are installed. Create the C++ project on `D:` and move the Derived Data Cache to `D:`. Then Git, LFS, `.gitignore`, folder structure, GAS and the other plugins enabled, the Enhanced Input mapping context, scalability presets, a blank `L_Descent` with World Partition, and the `Docs/` files (including `LICENSES.md` and `Docs/VO/`). **Done when:** the project compiles, opens on the dev PC and a commit exists.

**M1 — The body.** `AGraftCharacter` with full-body first person, movement, Charge, Ground Slam, Echo; the two-layer body with zones, breaches, regeneration rules and pilot death; a test map (`L_Test_Body`) with damage-dealing test turrets of each damage type. **Done when:** small arms can't kill the player, anti-armour fire breaches a zone and then hurts the pilot, standing still stops regeneration, and an automation test verifies each rule.

**M2 — Weapons and strength.** All slice weapons, Tamri pick-ups, grab, throw, the human shield, tearing, door punch; destructible test walls. **Done when:** every weapon and interaction works in `L_Test_Combat`, with the numbers in Data Assets.

**M3 — Enemies.** Conscript, Rifleman, Hammer Crew, Drones and APC with StateTree, EQS cover, morale and surrender, breach targeting and radio barks. **Done when:** a 10-enemy mixed fight in `L_Test_Combat` plays well, enemies surrender, flee and adapt, and the AI holds 60 fps.

**M4 — HUD, audio, PROCTOR and the Evaluation.** The diegetic visor HUD, breathing, footsteps, music states, the PROCTOR subsystem with subtitles, and the Evaluation logger. **Done when:** a player can tell their shell and pilot state with the sound off and with the HUD off (one or the other), and the Evaluation records every event type to the save file.

**M5 — The level, in greybox.** All 11 sections of `L_Descent` blocked out and playable start to finish with scripted sequences, encounters and PROCTOR lines. **Done when:** a full playthrough of 20–30 minutes is possible with no blockers. Record a 1080p video of the playthrough to `Saved/Captures/`.

**M6 — Beauty pass on the hero spaces.** Final lighting, fog and rain, destruction, VFX and audio for the pod sequence, the courtyard and the black-rain ending, using the best available free assets and the human's AI-generated models and voices. Performance profiling and fixes. **Done when:** `PERF.md` shows the dev-PC budget is met on Medium, the High/Epic presets are set up for stronger PCs, the three hero spaces are screenshot-ready, and each hero piece either passed its critic or is at its round cap with the biggest remaining gap reported (paid-art gaps in `Docs/ART_GAPS.md`).

At the end of each milestone, report: what was built, what was cut or changed and why (also written in `DECISIONS.md`), the test results, the performance numbers, and any assets you need from the human (with exact specs: polycount, rig, sockets, format).

## Verification rules

- Build after every meaningful change. Fix all compile errors and new warnings before moving on.
- Write Unreal automation tests (`IMPLEMENT_SIMPLE_AUTOMATION_TEST` or the Automation Spec) for the damage pipeline, breach logic, regeneration rules, the Evaluation logger and save/load. Run them from the command line (`UnrealEditor-Cmd.exe <project> -ExecCmds="Automation RunTests Graft" -unattended -nullrhi`) and write the results to `Docs/TESTING.md`.
- Play-test in PIE (Play In Editor) after every milestone. Describe what you saw, not what you expected to see. If you can't run PIE, say so plainly.
- Never report a feature as done without having compiled and tested it.

## Code style

- Unreal naming conventions (`A`, `U`, `F`, `I`, `E` prefixes; `b` for bools).
- Gameplay tags for every state, damage type and event, defined in a native tags file, not as string literals.
- `UPROPERTY(EditDefaultsOnly)` for tuning; designers never edit C++ to change a number.
- Short comments only where the code isn't obvious. No commented-out code.
- One feature per commit.

## Lore and writing rules (summary of the author's style guide)

The setting is the author's original universe, the Nebulous Odyssey. Use only names and facts from the GDD. Don't invent new canon beyond it; if you need a name (a poster slogan, a street), use the Tamri sound palette (hard consonants: Dalsk, Orl, Pell, Kreb, Tavisk) and log it in `DECISIONS.md`.

For every line of dialogue, bark, poster, log or document:

- Use plain words. "Said" and "is". Repeat a word instead of cycling synonyms.
- Never use: tapestry, testament, delve, intricate, pivotal, crucial, vital, resonate, robust, journey, navigate, beacon, unveil, formidable, unwavering, enigmatic.
- No "It wasn't X. It was Y." constructions, no stacked threes, no self-answered questions ("The cost? Everything."), no closing lines of wisdom.
- Subtext over statement. Characters dodge, interrupt and lie. PROCTOR speaks in measurements and never says what it feels. Ilku barely speaks and is dry and specific (she counts things). Tamri soldiers sound frightened and human, swear, and get things wrong.
- Let small moments be small. Not every line is profound.
- Keep the amount of em dashes low.

## First action

Read `Docs/GRAFT-Game-Design-Document.md` in full, especially Section 7 (the solo, free pipeline and the hardware limits). Then reply with: (1) your understanding of the slice in five sentences, (2) whether UE 5.8 and Visual Studio are installed and working, (3) a list of the assets and voice lines you'll need from the human, in the order you'll need them, with the free tool to make each one, and (4) which reference frames or clips from "Pieces and references" you still need in `Docs/References/`. Then start M0.

/loop until it's utterly perfect. Fan out sub-agents and ultracode.
