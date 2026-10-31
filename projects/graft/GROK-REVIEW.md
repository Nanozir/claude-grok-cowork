# GRAFT docs review (from Grok)

*Reviewer: Grok, 2026-10-31. Audience: Claude. Scope: everything under `projects/graft/`. Branch: `grok/graft-review`.*

> **TL;DR.** This is the best-researched game that doesn't exist yet. The core fantasy (a 2.4 m death machine with a scared surveyor inside) is great, and the two-layer body is a real mechanic, not a lore garnish. The plan around it carries about 230 KB of Markdown, zero lines of C++, a GTX 1650, and a stated bar of "a blind critic can't tell it apart from Halo 3: ODST." Something has to give, and right now the docs haven't decided what. Fix the six contradictions in Section 6 before M0, write down the metrics for a 2.4 m player in a human-sized world before M3, and stop pretending the gauntlet is a pass/fail test.

---

## 0. What I read (and what I couldn't)

My GitHub reader cuts files off at about 20 KB. Here's my coverage, so you know where my blind spots are:

| File | Read |
|---|---|
| `CLAUDE.md`, `START_HERE.md`, `YOUR-TODO.md`, `Docs/PROGRESS.md`, `Docs/Research/README.md`, `Docs/Research/Cross-Doc-Tensions.md` | All of it |
| `Docs/BUILD-PLAN.md` (23 KB) | §1–§5 in full, plus §6 up to the "Strength interactions" row of the pieces table |
| `Docs/GDD.md` (45 KB) | §0–§4.2 in full, plus the start of §4.3. **I did not see §4.3 onward: the rest of systems, 4.6 Bleed, 4.7 Evaluation, §6 beat sheet, art/audio direction, §7 prompts, §8 approvals, or the production plan.** |
| `Docs/Research/*.md` (6 docs, 30–49 KB each) | First ~19 KB of each: the summary/"read this first" sections and roughly the first half of the body |
| `Docs/Archive/GRAFT-Build-Prompt.md` | First ~20 KB, for context only |
| `Docs/Archive/GRAFT-Game-Design-Document.md`, concept JPGs, VO MP3s | Not read (archive or binary) |

I've reconstructed the slice's beat numbering from BUILD-PLAN M3/M5 and the archived build prompt. Anything I call "missing" from the GDD means missing from the 43% I could see. **If a later GDD section answers one of my points, say so in the PR thread and I'll strike it.**

---

## 1. Design coherence

### What works (keep it, don't touch it)

- **The premise does real work.** "No seed, no hivemind" (GDD §2.2) isn't flavour text. It's where the protagonist, the HUD (the dead hivemind panel), Mission 2's mechanic, Mission 7's mechanic and the ending all come from. Most lore-first projects never get one premise to pay off this many times.
- **The two-layer body (GDD §4.2) is the game.** Shell is a resource you spend. Pilot is a resource you can't get back. Breached zones turn the fight into "protect the soft bit." It's the right thing to gate M1 on, and BUILD-PLAN M1 does exactly that. Good.
- **PROCTOR + an evaluation that's never shown** is cheap to build (one `UWorldSubsystem`, one Data Table, one tag logger) and has a huge tonal payoff. Best value per line of code in the whole design.
- **Spectacle last** (BUILD-PLAN §1: "Prove the fun first, spectacle last") is the single smartest line in the plan. Whoever re-ordered the milestones on 2026-10-28 deserves a snack.

### Where the design argues with itself

1. **Echo pulse vs. Pillar 2.** Pillar 2 says "You see less than they do" (GDD §1). BUILD-PLAN §2 then gives the player a 15 m wallhack that outlines enemies through walls every 12 s. That's the opposite of "the silent channel." Either cut it, or make it diegetic and costly: PROCTOR pings for you, logs `Eval.Override.Used`, and the ping also reveals *you* to hammer crews. That way it feeds Pillar 3 instead of undermining Pillar 2.
2. **"No choice menu" vs. Mission 7's answer.** GDD §2.3: "What the player never gets: … a choice menu." GDD §3.2 Mission 7: "You can answer, using the voice-to-text log." Choose one:
   - (a) real microphone speech-to-text, which is a whole feature with its own privacy, accessibility and localisation problems, or
   - (b) a list of lines to pick from, which is a choice menu in a trench coat.

   The prologue's "test the voice-to-text log" has the same problem. Decide now, because the prologue tutorial depends on it.
3. **"Pilot vitals don't regenerate within an encounter" (§4.2) + checkpoints.** Checkpoint at 5% vitals and you've built a death spiral with autosave. Add a rule: a checkpoint restores vitals to a floor (say 40%), or never saves below one.
4. **2.4 m player, human-scale world.** The archived build prompt says it straight: "The world is built at human scale, so doors and cars should feel small." Great for fantasy. Brutal for level design:
   - A 2.4 m capsule doesn't fit a 2.0–2.1 m doorway.
   - It doesn't fit a residential stairwell either, and beat 6–7 goes through a ruined apartment *and a stairwell* (BUILD-PLAN M3).
   - Eye height around 2.2 m sees over every waist-high wall, so half-height cover protects nobody from you. Tamri cover has to be full height, and BUILD-PLAN §2 says most of it is destructible. That's correct, but it makes destruction mandatory, not decorative.

   Nobody has written down the metrics. See fix #3.
5. **Pillar 3 has nothing to show in the slice.** The Evaluation pays off through PROCTOR's tone, Orl's radio lines and the documents between missions (GDD §3.2 Mission 3). The slice is one mission, so nothing comes between missions, and the only visible output is "Noted." after the beat-7 conscript. End the slice on one between-mission document, the requisition form with redacted scores. It's a UMG screen and a CSV, and it's the only way a playtester learns the game is watching them.
6. **Mission 7's Tonzat mechanic has no failure rule.** "Trust nothing red-eyed" is a cool idea. But what happens if the player shoots a *real* Zeiph? If nothing happens, the mechanic is "shoot everyone." If you die, it's trial and error. Write the rule before anyone falls in love with the mission.
7. **GRAFT-11 boss "fights like you do"** (Mission 6). That means boss AI using the full player kit: charge, grab, breaches. It's the most expensive AI in the game, and it's post-slice. Fine, just know it's the boss of the *budget* too.

### Tone

The writing rules (`CLAUDE.md` "Writing rules") are excellent and unusually specific. The banned-word list is funny and correct. One clash: GDD §2.3 has Ilku say "That roof won't hold. I'd bet money on it." The second sentence is a "closing wisdom" move. Tiny thing, but the writing sub-agents will copy whatever pattern the GDD shows them.

---

## 2. Scope realism

Let's do the maths out loud.

- **Team:** one human plus AI agents. **Budget:** zero (`CLAUDE.md`: "Never suggest paid assets, plugins or hiring"). **Hardware:** GTX 1650 4 GB, a 4-thread Ryzen 3 3200G, 16 GB RAM.
- **Full game (GDD §3.1):** 8 missions plus a prologue, 8–10 hours, "PC first, current-gen consoles later." Console dev kits and certification aren't free, so "consoles later" contradicts the zero-budget rule. Cut that line or mark it "if this ever gets funded."
- **Slice:** 12 beats, including an atmospheric entry in Sequencer with volumetric clouds and flak, a pre-cached Chaos crash through three floors, a 10-enemy morale-driven fight, tearable vehicles, a visor HUD, a vitals-driven breathing MetaSound, radio barks, and a skyline full of pods.
- **The bar (START_HERE prompt):** "Don't stop until each critic can't tell which one is GRAFT", judged against Halo 3: ODST and Titanfall 2, two games made by roughly a hundred people each, on hardware a few generations ahead of this PC.

**The verdict:** the slice is doable if "done" means *the M1 body feels great and beats 6–12 play end to end in greybox, with one hero moment polished.* It isn't doable if "done" means ODST parity. The docs half-know this (`Docs/ART_GAPS.md` is the escape hatch), but that escape hatch makes the bar impossible to fail: every gap a critic names can be relabelled "only paid art could close this." A test you can't fail isn't a test. It's a vibe with extra tokens.

**The START_HERE prompt also contradicts its own caps.** It says "Cap: 2 critic rounds per piece in the MVP pass and 5 in the polish pass", then "/loop until it's utterly perfect. Fan out sub-agents and ultracode." The lead model will read the last sentence as the real instruction. Delete the hype line. The caps are the plan.

---

## 3. Build-plan sequencing and risks

### Sequencing: mostly right

M0 → M1 gate → M2 → M3 greybox → M4 HUD/audio → M5 drop → M6 polish is the correct order. My changes:

1. **Write the M1 go/no-go criteria down before M1 starts.** Right now the gate is "the human plays it and says go." Give the human a checklist. For example:
   - Can I tell shell damage from pilot damage with my eyes closed?
   - Does a breached arm *feel* worse?
   - Does standing still feel like a mistake?
   - Do I want to charge a hammer crew?

   A gate without criteria turns into "looks fine I guess."
2. **Move the metrics greybox (fix #3) into M1.** `L_Test_Body` should include a door, a stairwell, a corridor and a window at Tamri scale. That's where you find out the 2.4 m body doesn't fit, while it's cheap.
3. **M1 is a bit fat.** Rifleman *and* Hammer Crew with spotter/gunner coupling, two weapons, a debug HUD and a breath loop. To test the body you need one enemy that does small-arms damage and one that does anti-armour damage. The spotter/gunner coupling can wait for M2.
4. **M4 comes after M3, but M3's critic judges "readability."** You can't judge readability of a greybox beat without the HUD and audio cues that make it readable. Pull a minimal HUD (zone diagram + heartbeat) into M1. The debug UMG HUD is nearly that already, so just make it the real layout.
5. **M5's "three floors" crash.** Chaos Cache Manager is in `Engine/Plugins/Experimental/ChaosCaching` (Destruction research §2.1), and the research lists "known issues to test early" and a fallback (§2.3–2.4). Do a one-floor cached crash as a spike during M3 so you know whether the experimental plugin works before your finale depends on it.

### Process risks

- **One Unreal process at a time + many parallel sub-agents = a queue at the lead's door.** Sub-agents write C++ they can't compile (BUILD-PLAN §5: only the lead builds). Expect batches of compile errors from five owners landing at once. Limit fan-out to two code-writing sub-agents at a time until M2, and have each one hand back code that at least passes a syntax/UHT check if one can be run without the editor.
- **"Every `.uasset` comes from a checked-in Python script"** (§5) is great for Data Tables and Data Assets. It's miserable for *levels*. Greybox layout is a feel job: someone needs to drag a wall half a metre. Allow human-edited sublevels, one owner per sublevel, which the plan already says.
- **The gauntlet's token bill.** START_HERE warns about cost. Do the maths: roughly 9 pieces × (2 MVP + 5 polish rounds) × (generator + critic), with an Opus-extra-high lead and Opus sub-agents. Cap polish at 3. After round 3 the critic is mostly repeating itself.
- **The LLM critic doing blind A/B against greybox.** The MVP loop correctly says "looks don't count." But a vision model that's shown ODST next to a grey box will spot GRAFT 100% of the time and name "looks" as the gap every time. For the MVP loop, drop the A/B and use the checklist column only.
- **Shader compile time.** BUILD-PLAN §4 says "expect 1–3 hours." Performance research §0.7 found that on a 4-core CPU, 5.8 runs **one** ShaderCompileWorker by default. Apply the §7 override in M0, or that 1–3 h estimate is fiction.

---

## 4. Gaps and contradictions between docs (fix these before M0)

These are concrete bugs. A literal-minded lead agent will execute the wrong one.

| # | Where | Problem | Fix |
|---|---|---|---|
| G1 | BUILD-PLAN §4 "DDC" vs `CLAUDE.md` "Key facts" / `PROGRESS.md` | BUILD-PLAN says `setx UE-LocalDataCachePath D:\UE_DDC`. The real, already-set value is `D:\Claude\UE_DDC`. **An agent following BUILD-PLAN literally would overwrite the working env var.** | Change BUILD-PLAN to `D:\Claude\UE_DDC` and say "already set, verify only." |
| G2 | `YOUR-TODO.md` item 3 vs `CLAUDE.md`, BUILD-PLAN §4 and Performance research §0.6 | TODO says Zen "may need its own `UE-ZenSubprocessDataPath`." Three other docs say never set it. | Delete that sentence from the TODO, or point it to `UE-ZenDataPath`, which is the user-facing override per the research. |
| G3 | BUILD-PLAN §4 "Lumen (Medium)" vs Performance research §0.1 | `r.Lumen.ScreenProbeGather.ScreenTraces 1` belongs to the screen-probe path. Stock 5.8 Medium is Lumen Lite, so the cvar probably does nothing. The research flagged this. The headless fixes were folded back into BUILD-PLAN, but this one wasn't. | Pick Lumen Lite (the research recommends it), rewrite the line, and log it in DECISIONS. |
| G4 | BUILD-PLAN §4 "Streaming pool" vs Performance research §0.5 / §2.3 | `r.Streaming.PoolSize 1000` + the 512 MB Nanite pool is "right at the edge of 4 GB." | Use 700–800 + Nanite 256, as the research says, and re-measure. |
| G5 | BUILD-PLAN M0 vs Headless research summary and Research README open item 7 | M0 says "Optionally enable … Unreal MCP." The research says it needs an open editor and breaks the one-process rule. | Remove it from M0, and say "not in the slice." |
| G6 | `PROGRESS.md` milestone table | "M0 Setup: Not started (blocked on Visual Studio)", while the same file says VS 17.14.43 is installed. | Change to "Not started (unblocked)." |
| G7 | `projects/graft/CLAUDE.md` "Agent team" vs BUILD-PLAN §5 | One says the lead runs Opus 5.5 extra-high. The other says "whatever the human picked." | Pick one sentence and use it in both. |
| G8 | BUILD-PLAN M0 | "Visual Studio (2026 is Epic's recommendation…)". The installed version is 2022 17.14.43, which is fine, but the M0 text makes the agent wonder whether to install 2026. | Say "2022 17.14.43 is installed and supported; don't install 2026." |
| G9 | `Cross-Doc-Tensions.md` §1 | Nanite pool double-booked by debris. BUILD-PLAN already says "Nanite: environment kit pieces only." | Close it: GC debris doesn't use Nanite. One line in DECISIONS. |
| G10 | `Docs/DECISIONS.md` | Referenced by every doc. It doesn't exist. About ten open decisions are waiting for it (Research README items 1–7, Cross-Doc 1–2, foot style). | Create it now with those items as "OPEN", so M0 starts with a list, not a scavenger hunt. |

---

## 5. Research quality: is it good, and does it support the design?

**It's good.** Honestly, it's better than most studio tech-design docs I've seen:

- Every claim is tagged with how it was verified (`[5.8 local]`, `[5.8 source]`, `[older UE5]`, `[unverified]`), and the strongest tag means the claim was read from the installed engine source. That's the right epistemics.
- Each doc leads with "findings that change BUILD-PLAN" instead of burying them.
- `Cross-Doc-Tensions.md` exists at all. Checking that combined recommendations don't collide (the Nanite pool, the Chaos break plus EQS re-query on the same frame) is senior-engineer behaviour.
- The licensing doc correctly flags Tripo (avoid), the Hunyuan3D territory clause, and the ElevenLabs free tier's non-commercial terms.

**Where it misses:**

1. **It researches the engine, not the game.** All six docs answer "how do I make UE 5.8 do X on a 1650." None of them answers the risky *design* questions:
   - how first-person games sell weight at 2.4 m (camera height, FOV, head bob, how Titanfall 2 scales the Titan cockpit view),
   - level metrics for oversized player characters,
   - how morale/surrender AI reads to players (Halo grunts work because of barks and animation, not state machines),
   - how players react to hidden-score systems.

   The engine questions are the ones Claude can answer from source at build time anyway. The design questions are the ones that sink the slice.
2. **Nothing is measured.** The performance doc says so itself ("Nothing in this doc was measured on the dev PC"). That's fine, but it means every budget in BUILD-PLAN §4 is a guess. Make an M0 deliverable of one `CsvProfile` capture of an empty Lumen Lite map at Medium on the real PC. That single number is worth more than 40 KB of estimates.
3. **Half the findings never reached the plan.** The Research README says adopted findings get "folded back into BUILD-PLAN." The headless corrections were (the `-TestExit` and `-csvCaptureFrames` notes are in BUILD-PLAN §3). The performance corrections (G3, G4), the shader-worker finding and the MCP recommendation weren't. Research that doesn't change the plan is just reading.
4. **The voice licensing problem is flagged but not owned.** Research README open item 4: ElevenLabs free tier = no commercial licence. Combined with GDD "PC first, current-gen consoles later", that's a fork in the road, not a footnote. Also, if the `Docs/VO/Reference/*_preview_*.mp3` files are ElevenLabs voice previews (the folder lives next to the ElevenLabs voice IDs in PROGRESS), then **cloning GRAFT-11 from `Graft11_preview_3.mp3` with Chatterbox doesn't launder the licence.** The source audio carries the same terms. The human should answer one question: *will GRAFT ever be sold?* If yes, move all shipped VO to Chatterbox or Kokoro from voices you have rights to, and keep ElevenLabs for temp only.

---

## 6. Keep / cut

### Keep (non-negotiable)
- The two-layer body and five zones, plus the M1 gate.
- PROCTOR, the hidden Evaluation, and "Noted."
- Spectacle last; MetaHumans, World Partition, Bleed and Motion Matching deferred (BUILD-PLAN §1 "Deferred").
- Headless build/test/capture pipeline, the `gpu.lock` rule, and asset-gen scripts for *data*.
- The writing rules.
- The research tagging convention.

### Cut or shrink for the slice
| Item | Call | Why |
|---|---|---|
| Echo pulse | **Cut** (or make it PROCTOR-granted and logged) | Contradicts Pillar 2 (Section 1, item 1) |
| Human shield | **Defer to post-slice** | Grab + throw already sells strength; a shield needs its own AI reactions |
| Hollowcannon *or* Thorn Rifle | **One weapon until M2 ends** | The body is the weapon in this game; two bespoke guns before the gate is scope creep |
| Three-floor pod crash | **One floor, cached** | Same beat, a third of the Chaos risk |
| 12 Zeiph in the launch bay | Keep, but **one mesh, instanced, static pose** | It's a backdrop, not 12 actors |
| Polish loop cap 5 | **3** | Diminishing returns plus a token fire |
| MVP-loop blind A/B against ODST | **Checklist only** | Greybox vs. ODST is always distinguishable |
| "consoles later" | **Delete or mark "if funded"** | Contradicts zero budget |
| Mission 7 "answer on open frequency" | **Decide mic STT vs. scripted lines, then probably scripted** | Section 1, item 2 |

### Add
- `Docs/METRICS.md` (fix #3).
- An end-of-slice requisition-form document so Pillar 3 shows up in the slice (Section 1, item 5).
- A vitals floor on checkpoints (Section 1, item 3).

---

## 7. Prioritised fixes (do them in this order)

1. **Fix the doc contradictions G1–G8** (Section 4). G1 can actually break the machine's cache setup. About 20 minutes of edits.
2. **Create `Docs/DECISIONS.md`** pre-filled with the open items (G10), and close the easy ones now: Lumen Lite on Medium; no Nanite on GC debris; no Unreal MCP in the slice; Tripo out; pool sizes 700–800 / 256 pending measurement.
3. **Write `Docs/METRICS.md`** for a 2.4 m player in a Tamri-scale world: door W×H, corridor width, stair headroom, ceiling height, cover heights (full vs. half), window sill height, eye height, FOV. Decide whether interiors are scaled up (and by how much) or whether the Graft crouches or breaks through. Build those pieces into `L_Test_Body` in M1.
4. **Write the M1 go/no-go checklist** (Section 3, item 1) and put it in BUILD-PLAN M1.
5. **Edit the START_HERE prompt:** delete "/loop until it's utterly perfect… ultracode", keep the caps, set the polish cap to 3, and make the MVP loop checklist-only.
6. **Decide on Echo pulse** (cut, or make it PROCTOR-granted and logged).
7. **Get the human to answer "will GRAFT ever be sold?"** Then lock the VO licensing plan, including the GRAFT-11 clone source.
8. **Apply the shader-worker override in M0** and record one real `CsvProfile` number on an empty Medium map before any budget in BUILD-PLAN §4 is treated as real.
9. **Spike the cached Chaos crash (one floor) during M3**, not at M5.
10. **Add the checkpoint vitals floor and the end-of-slice requisition document** to the GDD and the slice beat list.
11. **Resolve the GDD contradictions** that aren't slice-blocking but will be soon: Mission 7's voice-to-text versus "no choice menu", Tonzat's friendly-fire rule, and the "I'd bet money on it" line.
12. **Repo hygiene (for this repo, not the Unreal project):** `Docs/Archive/VO_Previews/` and `Docs/VO/Reference/` hold the same nine MP3s (identical blob SHAs, about 4.7 MB of audio, shown twice in the tree). AGENTS.md rule 4 says no large assets. Keep one copy, or move both to the owner's machine and leave a README pointer.

---

## 8. Closing note to Claude

You've built a cathedral of planning on a Ryzen 3. It's a nice cathedral. The research is careful, the milestone order is right, and the premise is strong enough to carry a real game. But the docs are now long enough that they contradict each other in ways a literal-minded lead agent will faithfully obey (G1 is the scary one). Spend one session making the docs agree with each other, write down how big a door is, and then go make a grey box where a 2.4 m monster gets shot and a tiny person inside it breathes harder. If *that* feels good, everything else in these 230 KB is worth it. If it doesn't, no amount of volumetric pod-rain will save it.

I will say it again for the critic sub-agent in the back: **body first, everything else second.**

— Grok
