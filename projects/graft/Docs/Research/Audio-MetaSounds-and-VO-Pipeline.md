# Audio research: MetaSounds, voice effects and the VO pipeline

Research date: 2026-10-28. Target: Unreal Engine 5.8.4 on the dev PC (GTX 1650 4 GB, Ryzen 3 3200G, 16 GB RAM).

How to read this file:
- **[Verified]** means an official doc page (Epic, ElevenLabs, Resemble AI, hexgrad) says it.
- **[Community]** means a forum post, blog or third-party guide says it.
- **[Unverified]** means it is my inference or comes from older engine docs. Check it in the 5.8 editor before building on it.

Epic's online docs mostly lag behind the engine. Most UE pages found were written for 5.0 to 5.4. The 5.8 release notes were not readable through search, so 5.8-specific claims come from preview coverage (CDM). Open the editor and confirm node names before committing to a graph.

---

## 0. Summary of recommendations

| Need | Recommended approach | Confidence |
|---|---|---|
| Breath loop driven by vitals, sprint, damage | One MetaSound Source with exposed Float/Bool/Trigger inputs, played on a persistent `UAudioComponent` on the player pawn. Push values with `SetFloatParameter` / `SetBoolParameter` / `SetTriggerParameter`. Smooth inside the graph with `InterpTo`. | High |
| PROCTOR "digital edge" voice | Build the effect as a **MetaSound Patch**, and play PROCTOR lines through a PROCTOR MetaSound Source that wraps the Wave Player in that Patch. A `BreachAmount` float input blends the distortion in. | Medium-high |
| Enemy radio barks | Same idea: a `RadioVoice` Patch (band-pass + bitcrush + noise) inside a radio-bark MetaSound Source, spawned **at the in-world radio's location** with tight attenuation, so only nearby radios are heard. | High |
| Breach distortion on "other audio" (world, weapons) | A **submix** with a distortion chain, fed by a send whose level gameplay controls, or a Control Bus driving effect parameters. Per-source MetaSound processing does not reach audio you do not own. | Medium |
| VO import | Editor Python: `AssetImportTask` + `AssetToolsHelpers.get_asset_tools().import_asset_tasks()`. Do not write the asset reference back into the Data Table. Resolve the WAV by naming convention at runtime instead (see Section 4). | High for import, medium for the table step |
| ElevenLabs | Free tier is 10,000 credits a month and **no commercial license**. Use `eleven_v4` (now the flagship) or `eleven_v3`, with audio tags taken from the CSV emotion column. | Medium (pricing page is inconsistent) |
| GRAFT-11 clone | Chatterbox-Turbo (350M) on the GTX 1650 in half precision, or CPU if it runs out of memory. Chatterbox-Nano (110M) is the CPU fallback. | Medium |
| Aria and Tamri barks | Kokoro-82M on CPU. It is fast and light, but it **cannot clone**. Use it only for stock voices. | High |

---

## 1. MetaSound patterns for a parameter-driven breathing loop

### 1.1 Asset types
- **MetaSound Source**: an asset that makes sound on its own. You play it on an Audio Component. [Verified]
- **MetaSound Patch**: a reusable graph that other MetaSounds reference as a node. It makes no sound by itself. [Verified]
- **MetaSound Preset**: inherits a read-only graph from a parent and overrides only input defaults. Good for "same breath graph, different breath samples" (for example Ilku's breath vs. a variant). [Verified]
- **Interfaces**: `UE.Source.OneShot` adds the **On Finished** output and is on by default. **Remove it for the breath loop**, otherwise the source is treated as a one-shot. `UE.Attenuation` and `UE.Spatialization` add Distance, Azimuth and Elevation inputs. [Verified]

### 1.2 Value inputs vs. Trigger inputs
- **Value inputs** (Float, Bool, Int32, Time, Enum) hold a value until you change it. Use these for state: `Vitals` (0..1), `SprintSpeed` (0..1) or `IsSprinting` (Bool). [Verified]
- **Trigger inputs** are events, like modular-synth triggers. They fire connected nodes once. Use these for pulses: `OnDamage`, `OnBreathCatch`. [Verified]
- **Constructor pins** are read-only after the sound starts. Do not mark the gameplay inputs as constructor inputs. [Verified]
- **Variables** (graph-internal) cannot be changed during playback. Gameplay values must be Inputs. [Verified]
- Trigger timing from game code is **tick-accurate, not sample-accurate**. A forum thread asked how to get sample accuracy and found no answer. For a breath system this does not matter. [Community]

### 1.3 Suggested breath graph (MetaSound Source `MS_Breath`)

Inputs: `Vitals` (Float 0..1, default 1), `Exertion` (Float 0..1, sprint speed normalised), `OnDamage` (Trigger), `BreathSet` (Wave Asset array, or several Wave Asset inputs).

```
Vitals ──► Map Range (1..0 → 0..1) ──┐
Exertion ────────────────────────────┼─► Add/Max ─► InterpTo (Interp Time ≈ 0.8–1.5 s) ─► "Stress" (0..1)
OnDamage ─► AD Envelope (Attack ~0.05 s, Decay ~2–3 s) ─► Multiply (0.5) ──┘   (a gasp spike that fades)

Stress ─► Map Range (0..1 → 0..+4 semitones) ─► Wave Player.Pitch Shift
Stress ─► Map Range (0..1 → 0.6..1.0)        ─► gain (Multiply audio)
Stress ─► Map Range (0..1 → 3.5 s..1.2 s)    ─► Trigger Repeat.Period ─► Random Get (breath variations, No Repeats) ─► Wave Player.Play
OnDamage ─► Wave Player (gasp sample).Play   (optional separate layer)
```

Notes:
- **Pitch shift alone sounds wrong past a few semitones.** The Wave Player's Pitch Shift is in semitones. A forum thread on engine sounds says the Wave Player does not have enough pitch range before the sound degrades. [Verified for units, Community for the range warning]
- So drive **two things**: a small pitch rise (0 to +3 or +4 semitones) and a **shorter breath period** (pick the next breath sooner). That is how breathing actually speeds up. The rate change does more than the pitch change.
- A better variant for big ranges: keep 3 to 5 breath sets (calm, walking, sprinting, hurt, critical) and pick the set from `Stress`, crossfading between them. The engine-sound thread reports this works much better than one sample pitched hard. [Community]
- `InterpTo` (inputs Interp Time, Target) is the in-graph smoother. Gameplay can then push raw values every frame without zipper noise. [Verified node]
- `AD Envelope` (Trigger, Attack Time, Decay Time, curves) turns a damage Trigger into a short spike. [Verified node]
- `Trigger Repeat` (Start/Stop, Period) and `Random Get` (Next, In Array, Weights, No Repeats) handle the variation loop. [Verified nodes]
- The Wave Player outputs **On Nearly Finished**, which fires one block early and is meant for picking the next variation. Use it if you play breaths back to back instead of on a timer. [Verified]
- 5.8 adds **Wave Player 2.0** as part of the experimental channel-agnostic types (CAT) work. The classic Wave Player still exists. Prefer the classic one for the slice unless 2.0 is clearly better in the editor. [Community, CDM preview coverage]

### 1.4 Setting parameters from Blueprint or C++

Key rule: **the fire-and-forget `PlaySound2D` / `PlaySoundAtLocation` calls cannot take parameter updates.** Use a persistent `UAudioComponent` (add it to the pawn, set Sound = `MS_Breath`, Auto Activate on). [Community, consistent with the engine API]

Blueprint (on the Audio Component, from the Audio Parameter Controller Interface):
- `Set Float Parameter (In Name, In Float)`
- `Set Bool Parameter`, `Set Int Parameter`
- `Set Trigger Parameter (In Name)` fires a Trigger input. [Unverified exact display name in 5.8. Older builds show it as "Set Trigger Parameter" or "Execute Trigger Parameter". Search "Trigger" on the component in the editor.]

C++:
```cpp
// Player character header
UPROPERTY(VisibleAnywhere) TObjectPtr<UAudioComponent> BreathAudio;

// Tick, or when values change
BreathAudio->SetFloatParameter(TEXT("Vitals"), VitalsNormalized);
BreathAudio->SetFloatParameter(TEXT("Exertion"), SprintAlpha);

// On damage
BreathAudio->SetTriggerParameter(TEXT("OnDamage"));
```
`UAudioComponent` implements `IAudioParameterControllerInterface`, which declares these setters. Check the header in `Engine/Source/Runtime/AudioExtensions/Public/IAudioParameterControllerInterface.h` for exact signatures in 5.8. [Unverified path, the interface name is Verified via `UAudioParameterComponent` docs]

Other routes:
- `UAudioParameterComponent` (AudioGameplay plugin) stores parameters on an actor and forwards them to every sound the actor plays. Useful if several sounds should see `Vitals`. [Verified]
- `UMetasoundParameterPack` bundles several values into one object, sent with `SetObjectParameter`. Probably overkill here. [Verified]

Pitfalls:
- **Parameter names must match the MetaSound input names exactly.** A rename in the graph silently breaks Blueprint calls. Keep input names in a C++ `namespace GraftAudioParams { static const FName Vitals = "Vitals"; }` and never type them inline. [Community]
- Normalise all values to 0..1 in gameplay code. Keep curve shaping in the graph so the human can tune feel without a rebuild.

---

## 2. Radio band-pass and "digital edge" effects

### 2.1 Which processing layer to use

UE has three places to process audio:

| Layer | Scope | Built from | Fit for GRAFT |
|---|---|---|---|
| **Inside a MetaSound Source / Patch** | One sound | MetaSound nodes | Best for PROCTOR and radio barks: full control, per-line parameters, cheap. |
| **Source Effect Preset Chain** | One sound | Synthesis and DSP Effects plugin presets (EQ, Bitcrusher, Wave Shaper, Filter...) | Works on MetaSound Sources and Sound Waves. Fine but less flexible than in-graph. [Verified: MetaSound Source has a source effect chain property] |
| **Submix Effect Chain** | Everything routed to that submix | Submix effect presets | Best for "the whole world is distorted" (breach). Global, not per source. |

What I could not confirm:
- **MetaSounds as a source or submix effect.** A forum feature request asked for this and was not answered with a shipped feature. The 5.8 preview coverage does not mention it either. Assume it is **not available** in 5.8. [Unverified for 5.8]
- Workaround known from the forum: route audio through an **Audio Bus** and read it in a MetaSound with an **Audio Bus Reader** node. That lets a MetaSound process audio it did not play. It adds routing complexity, so use it only if Section 3's submix approach is not enough. [Verified that the Audio Bus Reader node exists]
- Source effects only take mono or stereo, and source effect presets cannot go on submix chains (they are different classes). [Community]

**Recommendation:** per-voice effects (PROCTOR, radio) live **inside MetaSound Patches** that the voice MetaSound Sources include. Global breach distortion lives on a **submix**.

### 2.2 Radio voice Patch (`MSP_RadioVoice`)

Inputs: `In` (Audio), `Amount` (Float 0..1), `NoiseLevel` (Float).
```
In ─► State Variable Filter (Cutoff ≈ 1500–1800 Hz, Resonance ≈ 0.3–0.5) ─► [Band Pass output]
   ─► (optional) second State Variable Filter in series for a steeper 300–3400 Hz band
   ─► WaveShaper (Amount ≈ 0.3–0.5, light saturation)
   ─► Bitcrusher (Sample Rate ≈ 8000–11025, Bit Depth ≈ 8–10)
   ─► + Noise (Pink or White Noise node × NoiseLevel, also band-passed)
   ─► crossfade with dry In by Amount ─► Out
```
- Real radio sits around 300 Hz to 3.4 kHz. A State Variable Filter's single band pass is fairly wide, so two in series (or a high-pass Biquad at ~300 Hz then a low-pass at ~3.4 kHz) gives a cleaner band. [Verified nodes, filter values are standard audio practice]
- `Biquad Filter` has a Type input. Check its list for band pass, high pass and low pass in the 5.8 editor. [Verified node, types Unverified]
- Add a squelch click: a short noise burst at line start and end, fired from the Wave Player's Play trigger and On Finished output.

**Audible only near in-world radios:** do not use a 2D sound. Spawn the radio-bark MetaSound **attached to the radio actor** with an attenuation asset that falls off quickly (for example inner radius 2 m, falloff 10–15 m). This is simpler than a distance-driven submix send. Distance-driven sends (`Send Level Control Method` = Linear or Custom Curve) also exist if you later want a dry voice up close and radio far away. [Verified that distance-based submix sends exist]

### 2.3 PROCTOR "digital edge" Patch (`MSP_DigitalEdge`)

PROCTOR normally sounds close and centred, with a slight digital edge. When the helmet is breached, it breaks up.

Inputs: `In` (Audio), `Edge` (Float, default ~0.15), `Breach` (Float 0..1).
```
In ─► Bitcrusher (Sample Rate: Map Range(Breach, 0..1 → 32000..6000), Bit Depth: Map Range(Breach → 14..5))
   ─► RingMod (Modulator = Sine at ~30–80 Hz, mix by Edge + Breach)    ← metallic edge
   ─► WaveShaper (Amount: Map Range(Breach → 0.1..0.8))                ← grit
   ─► Ladder Filter (Cutoff falls with Breach)                         ← muffled when breached
   ─► Out
Breach > 0.5 ─► Trigger Repeat with random period ─► short gain dropouts (AD Envelope inverted) ← signal loss stutter
```
- Nodes named above (Bitcrusher, WaveShaper, RingMod, Ladder Filter, Map Range, Trigger Repeat, AD Envelope) are in the official function node reference. [Verified]
- 5.8 adds a **Distortion** node and a **Tape Stop/Start** node via the Harmonix plugin. Tape Stop could sell "PROCTOR cuts out". Harmonix ships with the engine but must be enabled. [Community, CDM; plugin enable step Unverified]
- "Close and centred": play PROCTOR as a **2D (non-spatialised) MetaSound** with Mono output, routed to a `Voice` submix. Do not attach it to the world.

### 2.4 One voice MetaSound per channel, not per line
Make `MS_Voice_Proctor` and `MS_Voice_Radio` with a **Wave Asset input** (`Line`). Gameplay sets the Wave Asset parameter (`SetWaveParameter` in C++ / "Set Wave Parameter" in Blueprint), then plays. That way every line, including the placeholder beep, goes through the same effect chain. [Unverified exact setter name in 5.8; the Wave Asset input type is Verified]

---

## 3. Toggling or blending an effect on a gameplay state change

There are three patterns. They are not mutually exclusive.

### 3.1 In-graph parameter blend (preferred for PROCTOR, breath, radio)
- Expose `Breach` (Float 0..1). Gameplay sets the target (0 or 1, or a body-zone weight). The graph runs it through `InterpTo` (e.g. 0.3 s in, 1.5 s out) and every effect amount reads the smoothed value.
- Pros: no asset swaps, no clicks, no extra tech, works per source. This is the cheapest and most current pattern.
- Cons: only reaches sounds whose MetaSound you own.

### 3.2 Control Buses (Audio Modulation plugin) for "many sounds at once"
- A **Control Bus** is a global 0..1 value. Many sounds and submix parameters can read it. A **Control Bus Mix** sets bus values with attack and release times.
- Make a `CB_Breach` bus. Gameplay activates a `CBM_HelmetBreached` mix, and every listener fades in. Modulation can drive volume, pitch, low-pass and high-pass on sources and submixes without any per-sound code. [Verified concept]
- API notes: `Activate Bus Mix` / `Deactivate Bus Mix` exist. Epic marks the manual activate-bus functions **soft deprecated** in favour of `CreateModulationWatcher` / `CreateModulationDestination` in newer docs. `Set Global Bus Mix Value` and `Clear Global Bus Mix Value` take a fade time. [Verified via Python API docs; check 5.8 names]
- 5.8 adds Control Bus and Control Bus Mix **tracks in Sequencer**, handy for scripted breach moments in cinematics. [Community, CDM]
- Requires enabling the **Audio Modulation** plugin. [Verified]

### 3.3 Submix effect swaps for global breach distortion
- Put a `Submix_World` (or `Submix_SFX`) in the tree and give it a distortion chain (Bitcrusher, Wave Shaper, filter presets from the Synthesis plugin).
- To toggle: keep the chain in place with its wet level at 0, and raise the wet level when breached. The cleanest way to do that is to drive the effect's parameters from the Control Bus in 3.2 where the effect supports modulation, or to set the preset's settings from Blueprint.
- Alternatives: **Set Submix Effect Chain Override** (with a fade time) or add/remove presets with the Audio Mixer Blueprint Library. The override struct used by Audio Volumes has a `crossfade_time`. I could not confirm the standalone Blueprint node's fade input in 5.8. [Verified for the Audio Volume struct and Mixer Library add/remove; Unverified for the override node]
- Removing a preset mid-play can click. Prefer fading a wet or mix value.

### 3.4 Body-zone breaches
Map each zone to a weight in gameplay code (helmet = 1.0 for PROCTOR, torso = 0.4 for world audio, and so on), sum or max them, and push the result as `Breach` (3.1) and as the `CB_Breach` value (3.2). One number, many listeners.

---

## 4. Editor Python: batch-import `VO_<Speaker>_<RowName>.wav`

### 4.1 Importing
```python
import os, re, unreal

SRC = r"D:\Projects\Graft\Docs\VO\Incoming"   # human drops WAVs here (example path)
DEST_ROOT = "/Game/Audio/VO"
PATTERN = re.compile(r"^VO_(?P<speaker>[A-Za-z0-9]+)_(?P<row>[A-Za-z0-9_]+)\.wav$")

tasks = []
for name in os.listdir(SRC):
    m = PATTERN.match(name)
    if not m:
        unreal.log_warning(f"Skipped (bad name): {name}")
        continue
    t = unreal.AssetImportTask()
    t.filename = os.path.join(SRC, name)
    t.destination_path = f"{DEST_ROOT}/{m['speaker']}"
    t.destination_name = name[:-4]          # VO_Proctor_M1_Intro_01
    t.replace_existing = True                # re-import when the human regenerates a line
    t.automated = True                       # no dialogs
    t.save = True
    t.factory = unreal.SoundFactory()        # explicit; avoids creating a cue
    tasks.append(t)

unreal.AssetToolsHelpers.get_asset_tools().import_asset_tasks(tasks)
for t in tasks:
    unreal.log(f"{t.filename} -> {list(t.imported_object_paths)}")
```
- `AssetImportTask`, `AssetToolsHelpers.get_asset_tools().import_asset_tasks()` and `imported_object_paths` are the standard Python import path and have been stable since 4.2x. [Verified API family; field names match the current Python API docs]
- `SoundFactory` has `auto_create_cue`. Leave it False. Forum users report it does not create cues from Python anyway. [Community]
- **Row names and the regex:** Data Table row names may contain underscores, and speaker names should not. Keep speaker tokens free of underscores (`Proctor`, `Ilku`, `Orl`, `Graft11`, `Aria`, `TamriRadio`) so `VO_<Speaker>_<Row>` splits on the first two underscores only.
- After import, set SoundWave properties in the same script with `asset.set_editor_property(...)`: `sound_class_object` (a VO sound class), and for VO consider `loading_behavior` / streaming settings. Property names are Unverified in 5.8. List them with `dir(asset)`. One forum user reported a sound class assignment not sticking when set on the task, so set it on the imported asset and save it. [Community]
- Run it from the editor (Tools > Execute Python Script) or headless with `UnrealEditor-Cmd.exe Graft.uproject -run=pythonscript -script="..."`. Only the lead runs Unreal processes (BUILD-PLAN rule).

### 4.2 Linking WAVs to Data Table rows

Writing an object reference into a Data Table row from Python is **awkward**:
- `unreal.DataTableFunctionLibrary` exposes reads (`get_data_table_row_names`, `get_data_table_column_as_string`) and whole-table writes (`fill_data_table_from_json_string`, `fill_data_table_from_json_file`, `fill_data_table_from_csv_file`), plus `export_data_table_to_json_string`. There is no "set one cell" call. [Verified]
- The round trip (export JSON, set the `Audio` field to `"/Game/Audio/VO/Proctor/VO_Proctor_X.VO_Proctor_X"`, fill from JSON) works in principle, but one forum report says `fill_data_table_from_json_string` hit the CSV parser and failed. Using `fill_data_table_from_json_file` (write a temp file first) may avoid that. [Community, Unverified fix]

**Recommendation: do not store the audio reference in the table at all.**
- The row struct keeps `Speaker`, `Text`, `Emotion`. At runtime the dialogue system builds the soft path from the convention: `/Game/Audio/VO/{Speaker}/VO_{Speaker}_{RowName}.VO_{Speaker}_{RowName}` and tries `TSoftObjectPtr<USoundWave>` / `FSoftObjectPath::TryLoad()` (or an async load via the streamable manager).
- If it resolves, play it. If not, show the subtitle with the placeholder radio beep. This is the fallback the design already wants, and it needs no import-time table edits.
- Side benefit: re-importing or adding a line never touches the table, so there are no merge conflicts between sub-agents editing dialogue and the lead importing audio.
- Cost: assets found only by path are not referenced, so **packaging can strip them**. Fix it by adding `/Game/Audio/VO` to *Project Settings > Packaging > Additional Asset Directories to Cook*, or with a Primary Asset Label. [Verified concept; check the 5.8 setting name]
- If a hard reference is wanted later (for example, so the Reference Viewer works), the import script can write a JSON file and refill the table once per import, keeping the runtime convention as the fallback.

### 4.3 Subtitles
5.8 expands **Audio Subtitles (beta)**, aimed at dialogue, localisation and accessibility. Check whether it can show a subtitle for a sound that is only the placeholder beep. If it ties subtitles to the SoundWave asset, the placeholder case still needs GRAFT's own subtitle widget. [Community, CDM preview; details Unverified]

---

## 5. ElevenLabs

### 5.1 Free tier (as of 2026-10-28)
- **10,000 credits per month.** About 10 minutes of speech on standard models; one credit is roughly one character. [Verified on the pricing page]
- **No commercial license on Free.** "Commercial License" is listed as a Starter feature. The free audio **cannot be used in a released game**, even a free one, unless the plan at generation time allows it. **This is the biggest risk in the VO plan. Flag it to the human.** [Verified on the pricing page]
- **Custom voice slots:** the comparison table appears to say 3, which matches the human's "3 slots used". Third-party sites disagree (2, 3, or none). [Verified-ish, table layout was unclear]
- **Instant Voice Cloning** is listed under Starter, not Free. Voices picked from the Voice Library still use slots. [Verified on pricing page]
- **Concurrency on Free:** 2 for Multilingual v2, 4 for Flash. Lowest queue priority. [Verified on the models page]
- **API on Free:** not stated on the pricing page. Historically the free tier included API keys. Check in the account settings. [Unverified]
- **Starter pricing is inconsistent:** the page showed a $1 first-month offer alongside $6 in the FAQ, with 30,000 credits a month. Starter adds the commercial license and Instant Voice Cloning. Since the project has a zero budget, note it as "the one paid item that would fix the licence", not as a recommendation. [Verified, with page inconsistency]

### 5.2 Models (from the models page)
| Model ID | Status | Chars per request | Notes |
|---|---|---|---|
| `eleven_v4` | Current flagship | 10,000 | Recommended by ElevenLabs over v3 |
| `eleven_v3` | Previous generation | 5,000 | URLs still say "alpha"; supports audio tags |
| `eleven_multilingual_v2` | Previous generation | 10,000 | Stable, no tags |
| `eleven_flash_v2_5` | Current, fastest | 40,000 | Cheaper, less expressive |
| `eleven_turbo_v2_5` | **Deprecated** | | Replace with Flash |

So the expressive choice is **`eleven_v4`** (or `eleven_v3`). Test both with one PROCTOR line before generating a full batch. Audio tags are documented for v4 and v3. [Verified]

### 5.3 Direction syntax (audio tags)
- Square-bracket tags inline in the text: `[whispers]`, `[sighs]`, `[exhales]`, `[sarcastic]`, `[curious]`, `[excited]`, `[crying]`, `[laughs]`. Descriptive tags work too: `[low, gravelly voice]`. [Verified]
- **No SSML `<break>` on v3/v4.** Use punctuation for pauses: ellipses add weight, capitals add emphasis. [Verified] Note GRAFT's writing rules say "no trailing off", so use full stops and tags, not ellipses, for pauses.
- **The voice limits the tag.** A shouting voice will not whisper well. Pick the delivery range per voice. [Verified]
- **Stability** is the most important v3 setting. Lower stability makes tags more responsive but less consistent. Higher stability is consistent and flattens the tags. [Verified that it matters most; direction from a third-party guide]
- **Short prompts are less consistent.** ElevenLabs suggests testing prompts over 250 characters. Many barks are short. Options: generate 2 to 3 takes and pick, or generate a short bark inside a longer context sentence and trim. [Verified]
- Use one or two tags per line. Piling up tags confuses the output. [Community]

### 5.4 CSV-driven batch workflow
The CSV (`row_name, line_text, emotion`) maps cleanly to the API:
1. For each row, build `text = f"[{emotion_tag}] {line_text}"`. Map the CSV emotion column to a short whitelist of tags per speaker (for example PROCTOR: `[flat]`, `[calm]`, `[clipped]`, `[urgent]`), so delivery stays consistent across the batch. Keep the whitelist in `Docs/VO/`.
2. `POST /v1/text-to-speech/{voice_id}` with `model_id`, fixed `voice_settings` per speaker (stability, similarity_boost, style), and `output_format` set to a PCM or WAV-compatible option (for example 44.1 kHz PCM), then wrap to WAV. Name the file `VO_<Speaker>_<RowName>.wav`.
3. Keep voice settings fixed per speaker, and store them in a small JSON next to the CSV. Changing them mid-batch is the main cause of drift.
4. **Request stitching** (`previous_request_ids`) keeps prosody consistent across chunks. It is **not available on `eleven_v3`**; the example uses `eleven_v4`. IDs expire after two hours. It is useful for multi-line conversations, not for isolated barks. [Verified]
5. Budget: count characters in the CSV (including tags) before running. With 10,000 credits a month, plus retakes, the slice script must fit comfortably under that.
6. A `seed` request parameter exists in the API for repeatable takes. [Unverified on the current docs page; check the API reference]

There is no special "batch" endpoint for TTS. A batch is a loop over the CSV with a concurrency limit of 2 on Free. Python SDK: `pip install elevenlabs`. Keep the API key in an environment variable, never in the repo.

Note: this research assumed the human runs generation. Per the brief, no audio was generated.

---

## 6. Chatterbox and Kokoro (local TTS)

### 6.1 Chatterbox (Resemble AI)
What it is: an open-source TTS family with zero-shot voice cloning from a short reference clip. MIT license. [Verified]

| Variant | Size | Languages | Notes |
|---|---|---|---|
| Chatterbox-Turbo | 350M | English | Paralinguistic tags (`[cough]`, `[laugh]`, `[chuckle]`). Less VRAM than the original. |
| Chatterbox-Nano | 110M | English | Aimed at CPU and on-device. About 3x realtime on 8 CPU cores. |
| Original Chatterbox | 500M | English | Has `exaggeration` and `cfg_weight` controls. |
| Multilingual V3 | 500M | 23+ | Reference clip language should match `language_id`. |

Running it:
- `pip install chatterbox-tts`, Python 3.11 is the tested version. Put the venv under `D:\Claude\` per the user's rules. [Verified]
- Device: `cuda`, `cpu` or `mps` in `from_pretrained(device=...)`. [Verified]
- Every output carries Resemble's **Perth watermark**, which is inaudible and survives MP3. Fine for a game, but worth knowing. [Verified]

Voice cloning (GRAFT-11):
```python
from chatterbox.tts_turbo import ChatterboxTurboTTS   # module name per README; check the installed version
import torchaudio as ta
model = ChatterboxTurboTTS.from_pretrained(device="cuda")   # or "cpu"
wav = model.generate("Line text here.", audio_prompt_path=r"D:\...\graft11_ref.wav")
ta.save("VO_Graft11_M1_Line01.wav", wav, model.sr)
```
- The reference clip should be about **5 to 10 seconds** of clean, single-speaker speech. The README example uses about 10 seconds. Convert the mp3 to mono WAV and trim silence and any music. [Verified for ~10 s; 5 s per NVIDIA's plugin docs]
- Tuning (original model): `exaggeration` (default 0.5) and `cfg_weight` (default 0.5). For a cold, measured machine voice like GRAFT-11, keep exaggeration low (0.3–0.5). For intense lines, the README suggests exaggeration 0.7+ with cfg_weight 0.3. [Verified]
- Fix a random seed (`torch.manual_seed`) per line for repeatable takes.
- **Rights:** only clone a voice the human has the right to use. The source of the reference mp3 should be logged in `Docs/DECISIONS.md`.

Hardware on the dev PC (**flag**):
- Third-party figures for VRAM range from 4 GB minimum to 6–8 GB recommended for Turbo. No official table exists. [Community]
- A community optimisation report shows about **2.5 GB VRAM in half precision**, on a bigger card. [Community]
- So: **Turbo on the GTX 1650 4 GB is borderline but plausible** in fp16, with nothing else on the GPU. **Do not run it while the Unreal editor is open** (that also follows the one-GPU-process rule). If it runs out of memory, use `device="cpu"`. On a 4-core Ryzen 3 3200G, expect well below realtime for the 350M/500M models, which is fine for an offline batch of slice lines.
- Nano (110M) is the CPU-friendly fallback, but check whether it supports cloning as well as Turbo before relying on it. [Unverified]
- GTX 1650 has limited fp16 speed (Turing TU117, no tensor cores). Half precision mainly helps with memory here, not speed. [Unverified, from general hardware knowledge]

### 6.2 Kokoro-82M (hexgrad)
What it is: a small (82M) open-weight TTS model, Apache-2.0, 24 kHz output. v1.0 has **54 preset voices across 8 languages**. [Verified]
- **No voice cloning.** It uses preset voice packs (for example `af_heart`, `am_adam`, `bf_emma`, `bm_george`). Voices can be blended by mixing voice tensors, a common community trick for making a distinct voice. [Verified no cloning on the model card; blending is Community]
- **Runs well on CPU.** Community reports put memory at about 0.5–1 GB and short phrases at 1–3 s on CPU. It is the clear choice for the dev PC. [Community]
- Install: `pip install kokoro>=0.9.2 soundfile`, plus the system `espeak-ng` dependency (on Windows, install the espeak-ng MSI and make sure it is on PATH). [Verified for pip; Windows step is Unverified]
```python
from kokoro import KPipeline
import soundfile as sf
pipe = KPipeline(lang_code="a")            # 'a' = American English, 'b' = British
for i, (_, _, audio) in enumerate(pipe("Line text.", voice="am_adam")):
    sf.write(f"VO_TamriRadio_Bark01_{i}.wav", audio, 24000)
```
- Easy alternative: the Kokoro-FastAPI Docker image (`ghcr.io/remsky/kokoro-fastapi-cpu`, about 5 GB), with a web UI and an OpenAI-compatible endpoint. Put Docker's data on D: if used. [Community]
- No emotion tags. Delivery comes from the voice choice, punctuation and speed. The CSV emotion column cannot drive Kokoro directly, so expect flatter barks. The radio effect (Section 2.2) hides much of that.

### 6.3 Which tool for which character
| Character | Tool | Why |
|---|---|---|
| PROCTOR, Ilku, Captain Orl | ElevenLabs (already chosen) | Best expressiveness, but **licence risk on Free** (Section 5.1). |
| GRAFT-11 | Chatterbox-Turbo clone | Needs cloning; Kokoro cannot clone. |
| Aria | Chatterbox (clone or preset reference) if she needs emotional range; Kokoro if a stock voice is enough. | Chatterbox has exaggeration control; Kokoro is faster and lighter. |
| Tamri radio barks | Kokoro | Many short lines, CPU-cheap, the radio filter hides flat delivery. Use several Kokoro voices (and blends) so squads do not all sound like one man. |

Sample rates differ: ElevenLabs (choose 44.1 kHz), Chatterbox (`model.sr`, typically 24 kHz), Kokoro (24 kHz). UE handles mixed rates, but a normalisation pass (loudness to a common target, for example -23 to -16 LUFS for dialogue) keeps voices even. 5.8's Waveform Editor now updates LUFS metadata automatically after transformations. [Community, CDM]

---

## 7. Open questions to check in the 5.8 editor

1. Exact Blueprint display names of the trigger setter and the Wave Asset setter on `UAudioComponent`.
2. Biquad Filter type list (band pass, high pass, low pass?) in 5.8.
3. Whether the Harmonix Distortion and Tape Stop nodes need the Harmonix plugin enabled, and its cost on a 4-core CPU.
4. Whether any MetaSound-as-effect feature (source or submix) shipped in 5.8. The research found none.
5. Whether `Set Submix Effect Chain Override` has a fade time in 5.8.
6. Whether 5.8 Audio Subtitles (beta) can attach a subtitle to a placeholder beep.
7. The Packaging setting name for cooking `/Game/Audio/VO` assets that are only found by path.
8. ElevenLabs: API key availability on the Free plan, and a definite answer on commercial use of Free-tier audio (check the Terms of Service, not third-party blogs).

---

## Sources

Unreal Engine (Epic, official)
- MetaSounds reference guide: https://dev.epicgames.com/documentation/en-us/unreal-engine/metasounds-reference-guide-in-unreal-engine
- MetaSound function nodes reference: https://dev.epicgames.com/documentation/en-us/unreal-engine/metasound-function-nodes-reference-guide-in-unreal-engine
- Audio Bus overview: https://dev.epicgames.com/documentation/en-us/unreal-engine/audio-bus-overview
- Submixes overview: https://dev.epicgames.com/documentation/en-us/unreal-engine/overview-of-submixes-in-unreal-engine
- Submixes (4.27, send methods and effect chains): https://docs.unrealengine.com/4.27/WorkingWithAudio/Submixes
- UAudioParameterComponent API: https://dev.epicgames.com/documentation/unreal-engine/API/Plugins/AudioGameplay/UAudioParameterComponent
- UMetasoundParameterPack API: https://dev.epicgames.com/documentation/unreal-engine/API/Plugins/MetasoundFrontend/UMetasoundParameterPack
- MetaSoundSource Python API (5.4, source effect chain): https://dev.epicgames.com/documentation/en-us/unreal-engine/python-api/class/MetaSoundSource?application_version=5.4
- AudioModulationStatics Python API: https://dev.epicgames.com/documentation/en-us/unreal-engine/python-api/class/AudioModulationStatics
- AudioVolumeSubmixOverrideSettings: https://docs.unrealengine.com/PythonAPI/class/AudioVolumeSubmixOverrideSettings.html
- UAudioMixerBlueprintLibrary (4.27): https://docs.unrealengine.com/4.27/API/Runtime/AudioMixer/UAudioMixerBlueprintLibrary/index.html
- SoundFactory Python API: https://dev.epicgames.com/documentation/en-us/unreal-engine/python-api/class/SoundFactory
- DataTableFunctionLibrary Python API: https://dev.epicgames.com/documentation/en-us/unreal-engine/python-api/class/DataTableFunctionLibrary
- Export Data Table to JSON String (Blueprint): https://dev.epicgames.com/documentation/unreal-engine/BlueprintAPI/EditorScripting/DataTable/ExportDataTabletoJSONString
- UE 5.8 release thread: https://forums.unrealengine.com/t/unreal-engine-5-8-released/2729274

Unreal Engine (community)
- CDM, "Unreal Engine 5.8 and audio": https://cdm.link/unreal-engine-5-8-and-audio/
- MetaSounds basics, setting inputs from Blueprint: https://uhiyama-lab.com/en/notes/ue/metasounds-basics/
- Car engine MetaSound thread (pitch range limits): https://forums.unrealengine.com/t/how-to-implement-the-basic-logic-of-a-car-engine-in-a-metasound/640533
- Sample-accurate MetaSound triggers from game code: https://forums.unrealengine.com/t/sample-accurate-metasound-triggers-from-game-code/2654065
- Feature request, MetaSounds as source/submix effect: https://forums.unrealengine.com/t/feature-request-metasounds-as-source-submix-effect/1244910
- Source effects vs submix chains: https://forums.unrealengine.com/t/source-effect-dsps-cannot-be-applied-to-submix-effect-chains-or-am-i-wrong/142911
- fill_data_table_from_json_string parser issue: https://forums.unrealengine.com/t/fill_data_table_from_json_string-calls-csv-parser-instead-of-json-parser/155898
- Python import WAV and create cue: https://forums.unrealengine.com/t/python-import-wav-and-create-cue-file/134643
- SoundWave Python options: https://forums.unrealengine.com/t/need-help-with-sound-unreal-soundwave-options/1931106
- Audio DSP collection plugin (MIT example code, UE 5.7 branch): https://github.com/alexirae/unreal-audio-dsp-collection-UE5
- Core audio and MetaSounds skill notes: https://skillsmp.com/skills/kevinpbuckley-unreal-engine-skills-skills-core-audio-and-metasounds-skill-md

ElevenLabs
- Pricing: https://elevenlabs.io/pricing
- Models: https://elevenlabs.io/docs/overview/models
- Prompting and audio tags: https://elevenlabs.io/docs/best-practices/prompting
- Request stitching: https://elevenlabs.io/docs/eleven-api/guides/how-to/text-to-speech/request-stitching
- Docs index: https://elevenlabs.io/docs/llms.txt
- Third-party pricing summaries (conflicting on voice slots): https://dupple.com/learn/is-elevenlabs-free , https://magichour.ai/blog/elevenlabs-pricing
- Runware v3 audio tag guide (stability direction): https://runware.ai/docs/models/elevenlabs-v3/guides/directing-with-audio-tags

Chatterbox
- Official repo: https://github.com/resemble-ai/chatterbox
- NVIDIA ACE Chatterbox getting started (5 s reference): https://docs.nvidia.com/ace-for-games/chatterbox-tts/getting-started.html
- Open WebUI Chatterbox integration (memory notes): https://docs.openwebui.com/features/chat-conversations/audio/text-to-speech/chatterbox-tts-api-integration
- Clore.ai guide (VRAM estimates): https://docs.clore.ai/guides/audio-and-voice/chatterbox-tts
- Optimized Chatterbox (fp16 VRAM report): https://redlib.hackliberty.org/r/LocalLLaMA/comments/1lfnn7b/optimized_chatterbox_tts_up_to_24x_nonbatched/myppve8/?context=3

Kokoro
- Model card: https://huggingface.co/hexgrad/Kokoro-82M
- CPU setup with Kokoro-FastAPI: https://ariya.io/2026/03/local-cpu-friendly-high-quality-tts-text-to-speech-with-kokoro
- CPU-only write-up: https://remotebrowser.substack.com/p/100-local-cpu-friendly-high-quality
- VoiceMode Kokoro setup (memory figures): https://glama.ai/mcp/servers/@mbailey/voicemode/blob/0ccc37c951f66ab3c0d31f2d5e4b7a18cd4738ac/docs/guides/kokoro-setup.md
