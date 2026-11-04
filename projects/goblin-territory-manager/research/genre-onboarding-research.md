# Goblin Territory Manager: onboarding and pacing research

Date: 2026-11-04. Author: Claude (research subagent). Scope: progressive disclosure, just-in-time teaching, pacing, first goals, UI density, early time pressure.

## 0. TL;DR

The prototype's problem is not too many features. It is that all of them are visible at minute 0 while the first deadline is about 60 seconds of unpaused play away. The genre's consistent answer is:

1. Start with one verb and one number, and let each new system arrive as a reward or as a response to a problem the player just felt.
2. Teach through a short objective chain, an advisor voice and tooltips on demand. Do not use modal text walls.
3. Make the first deadline long, visible and survivable. Pause by default. Let the player rewind or retry.

Evidence quality is flagged per row (A = primary source or developer statement, B = reputable secondary, C = anecdote or aggregator). Several developer primary sources were not reachable, so I mark those rows.

### Current game, as given

- 1x = 2 ticks per real second, so 1 day = 12 s, and war on day 6 is about 60 s of unpaused play. Tick constants are in `js/data.js` (`TICKS_PER_DAY = 24`) and `js/main.js` (`acc += dt * state.speed * 2`).
- About 12 resource cells, 7 tabs, a 12-row table and an always-open log, all visible at once.

---

## 1. Progressive disclosure

| # | Technique | Game (source) | Why it works | Applied to Goblin Territory Manager (GTM) | Evidence |
|---|---|---|---|---|---|
| 1.1 | Start with one action. Each new capability appears as a consequence of the previous one. | A Dark Room. Opens with one button (light fire). A stranger arrives, wood gathering appears, then building, then the wider world. [Wikipedia](https://en.wikipedia.org/wiki/A_Dark_Room), [Game Developer: ADR's journey](https://www.gamedeveloper.com/design/-i-a-dark-room-i-s-unique-journey-from-the-web-to-ios), [ADR wiki, Room](https://adarkroom.fandom.com/wiki/Room_(Browser)), [Nightmare Mode timed run](https://nightmaremode.net/field-notes/a-dark-room-first-four-minutes/) | Each reveal is a reward and tells the player "this game gets bigger". Townsend: "natural fit to have the player's understanding of the world expand along with the game mechanics." Reveals are cheap, so attention never overloads. | Day 1 shows food, goblins and one zone only. The Construction tab appears when wood first reaches a build cost. | A (quotes), B (timings) |
| 1.2 | Tune the gap between reveals. Never leave the player staring at one button too long. | A Dark Room. Townsend tightened the timers so "there always [is] something new on the screen when the player tabbed back". The iOS porter worried about a paying user seeing the lone stoke button "for too long". [ADR secrets transcript](https://adarkroom.fandom.com/wiki/Secrets), [Game Developer](https://www.gamedeveloper.com/design/-i-a-dark-room-i-s-unique-journey-from-the-web-to-ios) | Reveal cadence is a tuned parameter. Too slow loses the player and too fast loses the "growing" feel. | Target a new visible element roughly every 60 to 90 s of real play in the first 10 minutes (see section 9). | A |
| 1.3 | Unlock UI by production quota. | Kittens Game ("when I hit production quotas I unlock more"), Universal Paperclips (dashboard sections unlock and "feel productive"). [IF50 on Paperclips](https://if50.substack.com/p/2017-universal-paperclips), [Incremental game, Wikipedia](https://en.wikipedia.org/wiki/Incremental_game), [Q23 thread](https://forum.quartertothree.com/t/the-incremental-thread-of-idle-clickers/145358) | The unlock itself is the goal. The player gets a feeling of accomplishment without a tutorial. | Gate tabs and resource cells on events (see section 8). | B/C. Kittens thresholds not found. |
| 1.4 | Gate complexity behind research or a tech graph. | Factorio. One transport verb at a time (hand-carry, burner, belt, train, bots), each gated by research. Wube went through four tutorial approaches and settled on freeplay plus passive tips. The old tutorial took 30-45 min to reach automation. [Friday Facts #241](https://factorio.com/blog/post/fff-241), [teemo.dev Factorio onboarding](https://teemo.dev/game-design/factorio/systems/onboarding-and-first-session) | The tech tree is the mission list. A scripted tutorial that is too long loses to simply playing. | The R&D tab appears only after a Research hut. Within R&D, show 3 projects first, not 12. | A (FFF #241), C (teemo summary) |
| 1.5 | Simpler early game that unlocks real choices as the player wants them. | Against the Storm. Eurogamer: "the early game isn't unpleasant and grindy, it's just simpler - and you unlock the ability to make more choices as you start wanting to engage with more complexity." Two guided tutorial settlements. [Eurogamer](https://www.eurogamer.net/against-the-storm-review-a-perfectly-chaotic-city-builder), [Official wiki walkthrough](https://wiki.hoodedhorse.com/Against_the_Storm/Tutorial_Walkthrough) | Players meet systems in a deliberate order, in a lowered-difficulty sandbox. | Ship a scripted "Orientation Territory" before the full game: Hierarchy and Incentives are not in it. | B |
| 1.6 | Start with 1-2 problems, not all of them. | Kingdoms and Castles. "The game starts with two basic problems that need to be solved: homelessness and hunger." Dev loop: listen to advisors, find a matching building, build it, see what happens. [Game Developer](https://www.gamedeveloper.com/design/teaching-players-without-tutorials-in-i-kingdoms-and-castles-i-) | A narrow problem space is a tutorial in itself. | Open with exactly two problems: "goblins are starving" and "we have no wood". | A (developer quotes) |
| 1.7 | Hand a pre-scoped loadout so early mistakes are not fatal. | RimWorld. A starting larder of 50 meals is about 8 in-game days, longer than a first session. A "Learning Helper" panel surfaces a lesson when the related concept comes up. [teemo.dev RimWorld onboarding](https://teemo.dev/game-design/rimworld/systems/onboarding-and-first-session), [RimWorld wiki, Phoebe](https://www.rimworldwiki.com/wiki/Phoebe) | Buffer plus on-demand lookup gives agency without forced rails. | Start food at about 5 days instead of a few, so starvation is not the first lesson. | C. Aggregator site. Ludeon's own reasoning not found. |

Not found: a primary Tynan Sylvester source on the Learning Helper, a Kittens Game unlock table, Cookie Clicker or Melvor design commentary, Banished, Townsmen and Stardew first-day analysis. I do not claim specifics for those.

---

## 2. Just-in-time and contextual teaching

| # | Technique | Game / source | Why it works | Applied to GTM | Evidence |
|---|---|---|---|---|---|
| 2.1 | Advisor voice states the next need in one sentence. The player finds the matching building. | Kingdoms and Castles ([Game Developer](https://www.gamedeveloper.com/design/teaching-players-without-tutorials-in-i-kingdoms-and-castles-i-)). The devs also expose multiple layers: watch individual workers, building info, city-level summaries. | Diegetic, short and tied to a live problem. Multiple info depths let the player "self-guide". | The Goblin Lord's salaryman voice and a single advisor goblin ("Gruk from HR") say one line per need. See the Day 1 chain in section 8. | A |
| 2.2 | Pull, not push, help. | NN/g: tutorials "interrupt users... and are quickly forgotten"; contextual "pull revelations" triggered by a signal win. [NN/g](https://www.nngroup.com/articles/onboarding-tutorials/) Northgard uses non-blocking contextual tips fired by discovery events ([UX Collective](https://uxdesign.cc/games-ux-building-the-right-onboarding-experience-a6e99cf4aaea)). | Help appears when the player is about to need it and can be ignored. | Fire a tip on first contact with a concept, once: first time food drops below 2 days, first time a building is affordable, first time a goblin is injured. Each tip is one line plus an optional "more". | B |
| 2.3 | Keep tooltips short and non-redundant. | Apple HIG: tooltips about 60-75 characters, start with a verb, skip the obvious. NN/g: redundant tips "waste users' time". [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/offering-help), [NN/g](https://www.nngroup.com/articles/info-tips-bad) | Each hover has a cost. | Write every stat and role tooltip as a one-liner with a number: "STR: warrior damage. Yours: 6". | B (general UX, not game-specific) |
| 2.4 | Teach by consequence. Let the silent failure be legible. | Factorio (a backed-up furnace is "a legible, silent error message"), Frostpunk (a reviewer forgot the generator and the cold killed everyone on night one). [teemo.dev Factorio](https://teemo.dev/game-design/factorio/systems/onboarding-and-first-session), [PCGamesN](https://www.pcgamesn.com/frostpunk/frostpunk-guide) | Memorable, but harsh if unrecoverable. | Allow cheap, visible mistakes early (a goblin goes hungry and morale dips) and attach a rewind or a toast "Goblins ate dried fruit. Next time: ..." | B/C. Pair with soft-fail (section 4). |
| 2.5 | Fix problems at the root. Do not paper over a too-complex system with a tutorial. | Games UX article: "We will fix it with a tutorial" is a red flag. Ask "how are players going to discover that element?" for each element. [UX Collective](https://uxdesign.cc/games-ux-building-the-right-onboarding-experience-a6e99cf4aaea) | Reduces what must be explained. | Merge or defer systems rather than explaining them: the Hierarchy tab's 5 ranks, editable thresholds and naming form are late-game, not tutorial material. | B |
| 2.6 | A text-light log. Events carry an icon and a number, and only the latest 3-5 lines show. | Inferred from the genre. No single source. | The always-open log is a wall. | Collapse the log to the latest 3 lines with an expand button. Highlight lines that need action. | Opinion. No direct source. |

---

## 3. Pacing of real-time and tick systems

| # | Technique | Game / source | Why it works | Applied to GTM | Evidence |
|---|---|---|---|---|---|
| 3.1 | Start paused, and the clock does not run while the player reads tutorial prompts. | Against the Storm. "The Queen's Impatience does not increase while the game is [paused]." Another guide: "Use the Pause button often... The game is designed around decision-making, not speed." [Official wiki](https://wiki.hoodedhorse.com/Against_the_Storm/Tutorial_Walkthrough), [single-player.org](https://single-player.org/post/101-against-the-storm-beginners-guide) | Pause is a first-class tool, not an admission of failure. | Keep "opens paused", but also (a) auto-pause whenever a new objective or tip appears, (b) have the player press Play deliberately for the first time with a clear "Start day 1" button. | B |
| 3.2 | Slow the first minutes. | A Dark Room (the whole opening is timers measured in seconds). Townsend/Rajan tuned the first part repeatedly ([secrets transcript](https://adarkroom.fandom.com/wiki/Secrets)). | New players need time to process cause and effect. | Default 1x = 1 tick/s (1 day = 24 s) and offer "Relaxed" at 0.5 tick/s for day 1-2. Speeds above 2x stay locked until day 3. | A for ADR; the numbers here are my design proposal. |
| 3.3 | A long first fuse with a visible countdown. | RimWorld Cassandra's first raid is on day 5 and Phoebe's first major threat cycle starts on day 13 ([number13](https://en.number13.de/rimworld-storyteller), [RimWorld wiki](https://www.rimworldwiki.com/wiki/Phoebe)). RimWorld's default start gives about 8 days of food ([teemo.dev](https://teemo.dev/game-design/rimworld/systems/onboarding-and-first-session)). | Players need several "decision cycles" before the first test. | Move the first war from day 6 to day 10 (or later) and tie it to elapsed player decisions, not just the clock. | B |
| 3.4 | Pressure meters that run on the fiction, not on "time ran out". | Against the Storm. A blue Reputation bar vs a red Impatience bar. A dev says the "Queen" fiction turned a timer into "the capricious Queen demanding results" and not a complaint about balancing. Impatience climbs slowly (+0.15/min in the tutorial). [Game Developer interview](https://www.gamedeveloper.com/business/how-against-the-storm-managed-to-mix-city-building-and-roguelite-play), [wiki](https://wiki.hoodedhorse.com/Against_the_Storm/Tutorial_Walkthrough) | The same pressure feels fairer when it has a face. | The war countdown should be "the Rival Warlord's herald arrives in N days". The corporate-satire framing is a free fit: "Quarterly Review", "Hostile Takeover". | A |
| 3.5 | Auto-pause on important events. | Common in the genre; I found no single citation that analyzes it. RimWorld pauses on letters and Against the Storm players pause to read events. | Prevents "I looked away and the war happened". | Auto-pause on: new unlock, war warning (T-3 days, T-1 day), first death or injury, food below 1 day, the war itself. A setting lets veterans turn it off. | Thin evidence. Reasonable convention. |
| 3.6 | A gentle pace setting for learners. | RimWorld presets: Peaceful "for players who want to learn the mechanics with minimal pressure". Reload-anytime is "the pick for a player who is still learning". [teemo.dev](https://teemo.dev/game-design/rimworld/systems/onboarding-and-first-session) Game Wisdom also recommends difficulty options and skippable tutorials ([Game Wisdom](https://game-wisdom.com/critical/pacing-problems-game-design)). | Opt-in help with no stigma. | First launch: "Guided (recommended)" vs "Full game". Guided gates the UI and softens the war. | B/C |

Counter-evidence worth noting: the RimWorld Steam thread notes that Phoebe's long gaps can turn into unprepared spikes for newbies ([Steam thread](https://steamcommunity.com/app/294100/discussions/0/2595630410192317026), anecdote, C). A long quiet period is only good if the player is still being given goals during it.

---

## 4. Soft-fail first encounters, countdowns that teach, and retry

| # | Technique | Game / source | Applied to GTM | Evidence |
|---|---|---|---|---|
| 4.1 | A first test that is survivable. | Frostpunk's scenarios are built around an imminent storm. The designer also states that a goal is "to create game mechanisms that both advanced players and beginners would be satisfied with" ([Inven Global, IGC 2018](https://www.invenglobal.com/articles/6528/igc-2018-empathize-with-numbers-the-process-of-frostpunk-scenario-writing)). Another goal there was "a sense of victory despite the result". | A tutorial war ("Skirmish") with a small, scripted raiding party. The preview shows its strength and what beats it. Losing costs resources, not the game. | B. No Frostpunk source I could open states first-storm tuning numbers. A Frostpunk review notes the tutorial under-prepared players for the first big storm ([indienova critical play](https://lab.indienova.com/indie-game-review/critical-play-report-frostpunk/), C). |
| 4.2 | Difficulty ramp across settlements, not inside one. | Against the Storm: each settlement is a closed run (typically 1-3 h), and the tutorial settlements are lowered difficulty ([single-player.org](https://single-player.org/post/101-against-the-storm-beginners-guide)). | Treat war 1 as a boss with a published recipe. War 2+ is the real game. | B |
| 4.3 | Save-scumming is sanctioned for learners. | RimWorld "Reload anytime" mode ([teemo.dev](https://teemo.dev/game-design/rimworld/systems/onboarding-and-first-session)). Also, "soft game-over" after a wipe. | Autosave at the war warning (T-1 day). On defeat show "Rewind to Day N-1" as the default button, with "Continue with consequences" as secondary. | C |
| 4.4 | Show the threat's size before it arrives. | RimWorld raids scale with colony wealth (Cassandra) ([number13](https://en.number13.de/rimworld-storyteller)). GTM already has scouting intel and a defense projection. | Make the War Room's first view one bar: "Their strength 40 / Your defense 28". Scouting remains a later layer. | A for the mechanic, design is proposal. |
| 4.5 | Countdowns that teach. | Frostpunk and Against the Storm both attach pressure to a goal. Impatience also drives pacing choices ([Wanderer review](https://playwanderer.online/game-reviews/against-the-storm)). | Use the countdown as a checklist: "War in 7 days. Ready? 1 of 3: defenders, a palisade, enough food". | B |

Risk flag: in Against the Storm, reviewers say players "finish the mandatory tutorial steps able to click the right buttons without understanding why" the pressure meters interact ([Wanderer](https://playwanderer.online/game-reviews/against-the-storm), C). Teach the one relationship the war cares about (defenders and traps vs raiders), not every stat.

---

## 5. Clear immediate goals and visible feedback

| # | Technique | Game / source | Why it works | Applied to GTM | Evidence |
|---|---|---|---|---|---|
| 5.1 | A single "what now" slot. | ONI: the first prompt is "Start Digging" ([ONI wiki.gg](https://oxygennotincluded.wiki.gg/wiki/Guide/Getting_Started)). Factorio's old tutorial had an objective window, but it was criticised for scattered information and "objective[s] without purpose" ([FFF #241](https://factorio.com/blog/post/fff-241)). | One focus slot beats a list. The objective must also state the purpose. | A pinned banner: "Next: put 2 goblins on Timber, so you can build the palisade." Always give the why. | B |
| 5.2 | Action within 60 seconds. | A Dark Room's first click is at second 1, and an observed web run reached its first branch at about 3:02 ([Nightmare Mode](https://nightmaremode.net/field-notes/a-dark-room-first-four-minutes/), C). | The first action is cheap and visible. | Within 30 s, the player has assigned laborers and seen food or wood tick up. | C |
| 5.3 | Show change, not only values. | Idle genre convention (per-second rates; Pecorella's idle-math talk at [GDC Europe 2016](https://www.slideshare.net/slideshow/quest-for-progress-gdc-europe-2016/65405507), I could only confirm the talk exists). | Rates and deltas tell the player their action worked. | Float "+4 wood" on the zone card, show "/day" next to resources, flash the cell that changed. | Thin. Convention. |
| 5.4 | Reveal every unlock with a small ceremony. | Paperclips: unlocking dashboard parts "feels productive" ([IF50](https://if50.substack.com/p/2017-universal-paperclips)). | Makes the unlock itself rewarding. | New tab: pulse, a one-line banner, and a log line. | B |
| 5.5 | Objective chain as a short checklist (3-4 items). Done items collapse. | Common (Against the Storm Orders, Frostpunk objectives). No single design-analysis source. | Progress is visible and scoped. | See section 8. | Convention |

---

## 6. UI density

| # | Technique | Source | Applied to GTM | Evidence |
|---|---|---|---|---|
| 6.1 | Show only the numbers the player can act on. | Kingdoms and Castles starts with two problems, so only two measures matter ([Game Developer](https://www.gamedeveloper.com/design/teaching-players-without-tutorials-in-i-kingdoms-and-castles-i-)). Kingdom (see 6.3) hides most info. | Day 1 strip: Food (with days left), Wood, Population. Stone, leather, ammo, CP, prestige and morale appear when they first become non-zero or relevant. | B |
| 6.2 | Tabs appear when the system is needed. | Factorio tech gating; ADR tabs ("the Silent Forest tab when it shows up") ([ADR wiki](https://adarkroom.fandom.com/wiki/A_Dark_Room_Wiki_talk:Community_Portal)). | See the unlock table in section 8. | B |
| 6.3 | No-text teaching. | Kingdom: New Lands has only a brief opening tutorial ("Guided by a Ghost") and teaches almost everything through discovery. Reviewers see it as both a strength and a source of rough first runs ([Switch Era via N4G](https://n4g.com/news/2104562/kingdom-new-lands-review-switch-era), [expertgamereviews](https://expertgamereviews.com/?p=1897)). | Take the lesson (visible world cues, e.g. an icon over the zone that needs workers) but do not copy the zero-guidance approach: the player complaint is "thrown in", and Kingdom's own reviewers report frustrating first runs. | C. Could not find a developer postmortem. |
| 6.4 | Information scales with the game. | A review of Against the Storm notes its UI "was built for a smaller game than the one it eventually became" ([Wanderer](https://playwanderer.online/game-reviews/against-the-storm), C). | A warning: introduce density deliberately, or it creeps back. | C |
| 6.5 | Simplify the Population table. | Not sourced. Design inference. | Default columns: name, role, a single "fit" icon. Stats, post and rank appear in an expanded row. Show 6 goblins first, and the other 6 join in the first days (also gives a natural "new arrivals" event). | Opinion |

---

## 7. What the research does and does not tell us

- Strong, quoted developer evidence: A Dark Room (gradual reveal and timing), Kingdoms and Castles (two problems and the advisor loop), Against the Storm (pause behaviour, fiction-wrapped timer), Factorio (tutorial length and the passive-tips outcome).
- Secondary or anecdotal: RimWorld Learning Helper details (aggregator), Kingdom's design intent, Frostpunk's first-storm tuning, ONI, Northgard (one UX article), Dwarf Fortress Steam (devs say the aim was "to ease the need to head straight to a wiki" and that pop-up tips are easy to code, but I found no primary write-up: [PC Gamer](https://www.pcgamer.com/the-pcs-most-infamously-complex-game-gets-a-tutorial-after-16-years) and aggregators).
- Not found at all: Cookie Clicker, Melvor Idle, Townsmen, Banished, Stardew Valley first-day, Eric Guan's idle math (the closest hit was Anthony Pecorella's Kongregate idle-math series), Lost Garden. Treat those as gaps, not as absent evidence.
- Fetch limits: direct WebFetch was blocked for several hosts in this sandbox (informit.com, gamedeveloper.com, invenglobal.com). Those pages were read through the Parallel fetch tool. The Kongregate blog post returned a redirect and was not read.
- Numbers in the recommendations (speeds, day counts, thresholds) are my proposals, not benchmarks from the sources. Playtest them.

---

## 8. Prioritized recommendations

### P0. Do before anyone plays again

1. **Guided start mode, on by default.** First launch asks one question: "Guided (recommended)" or "Full game". Guided turns on the rules below. Rationale: 3.6, 1.5.
2. **Day 1 UI diet.**
   - Top bar: pause/play and one speed button (1x) plus 2x. Hide 5x and 10x until day 3. Show the war countdown as "Herald arrives in N days" (not a raw tick).
   - Resource strip: Food (with days left), Wood, Population. Everything else hidden until non-zero or relevant.
   - Tabs: Zones only. Others locked and hidden (see unlock table).
   - Log: collapsed to the last 3 lines.
3. **Day 1 objective chain, pinned in a single "Next" slot.** Every step states a why and auto-completes when done. Game auto-pauses at each step.
   1. "We have 4 days of food. Put 2 goblins on Fruit in the Meadow to keep it from dropping." (Food, a visible number moves.)
   2. "Wood is low. Put 2 goblins on Timber in the Forest Edge." (+Wood appears in the strip.)
   3. "Build a Pit Trap (10 wood). The herald comes on day 10." (Unlocks Construction tab on first affordability.)
   4. "Press Play. Watch a full day." Auto-pause at day end with a one-line summary.
4. **Slower default and a longer fuse.** 1x = 1 tick/s (1 day = 24 s). Move war 1 from day 6 to day 10. That is about 4 minutes of unpaused play, but with all the pauses a first session should land at 12-15 minutes. Adjust after playtests. Rationale: 3.2, 3.3.
5. **Auto-pause list (with a setting to disable).** New unlock, objective completed, war warning at T-3 and T-1 days, food under 1 day, first injury or death, war start.
6. **Make the first war a "Skirmish".** Scripted small party, strength previewed in the War Room as one bar. A loss costs a zone's output for a few days and some resources, not the game. Rationale: 4.1.
7. **Autosave at T-1 day and a "Rewind to Day N-1" button on defeat.** Rationale: 4.3.
8. **Unlock table** (hide the tab and its resource cell until the trigger):

| Surface | Trigger | Ceremony |
|---|---|---|
| Construction tab | Wood >= cheapest building cost (about day 1) | Tab pulse and 1-line banner |
| Population tab | After objective 3 ("You have 12 goblins; they have jobs now") or day 2 | Pulse |
| Stone, leather, ammo cells | First non-zero, or the first building that needs them | Cell flashes once |
| Morale bar | First time it moves by 10 or more | Banner explains one sentence |
| War Room tab | War warning at T-5 days | Auto-pause and banner |
| R&D tab | First Research hut built | Pulse |
| Hierarchy and Incentives tab | Day 5 or first promotion-eligible goblin | Pulse. Start with 2 of its cards visible (see P1.3) |
| Debug tab | Behind a key (backtick) or "Dev mode" toggle | None |

### P1. Do next

1. **Advisor voice.** One goblin (for example "Gruk from HR") speaks one line per need in the banner slot. Corporate-satire register, max about 15 words. Rationale: 2.1, 3.4.
2. **Contextual one-time tips** on first occurrence of: low food, overcrowded zone, idle goblin, first injury, building complete, first promotion-eligible goblin. Each is one line plus an optional "more" link. Rationale: 2.2.
3. **Hierarchy tab in layers.** Show ranks and one "promote" action first; thresholds, overtime tables and the naming form unlock later (day 8+ or Territory Level 2).
4. **Population table diet.** Show 6 goblins, 3 columns. Expand a row to see stats. New goblins arrive over the first days. Rationale: 6.5.
5. **War countdown as checklist.** "War in N days: Defenders 3/4, Palisade built, Food 3d+". Rationale: 4.5.
6. **Rate and delta feedback.** Floating "+N" on zone cards, "/day" rates next to resources, flash on change. Rationale: 5.3.
7. **Tooltip pass.** One-liner with a number per stat, role and resource (Apple HIG: about 60-75 chars). Rationale: 2.3.

### P2. Later

1. Optional "Relaxed" pace setting (0.5 tick/s) and "Challenge" (original speed).
2. Replay summary after war 1 ("what helped, what you missed") using the existing battle log.
3. Post-tutorial: the second war with the full intel layer, then conquest zones.
4. Per-player memory: if the player dismisses the tips twice, stop showing them.
5. Telemetry-free playtest log (time to first action, time to first war, tab opens) to retune numbers.
6. Study gaps listed in section 7 if budget allows: Cookie Clicker, Melvor, Banished, Stardew, Kingdom postmortems.

---

## 9. Target first-15-minute session

Assumes the P0 changes: 1x = 1 tick/s (24 s per day), war 1 on day 10, auto-pauses, guided mode. "Visible" is cumulative.

| Minute | Visible | Player goal | What unlocks next |
|---|---|---|---|
| 0:00-1:00 | Zones tab only. Food, Wood, Population. Paused. One "Start day 1" button and the pinned Next slot. | Objective 1: put 2 goblins on Fruit. Press Play. | Time controls (1x, 2x) |
| 1:00-3:00 | Same, plus floating +N feedback. Log (3 lines). | Objective 2: 2 goblins on Timber. Watch day 1 end (auto-pause with one-line summary). | Wood reaches 10, so Construction tab pulses |
| 3:00-5:00 | + Construction tab (3 buildings visible: pit trap, palisade, storage). Day 2-3. | Objective 3: build a Pit Trap. Tip fires on first build. | Population tab (day 2-3). 2x speed. Herald countdown shown. |
| 5:00-7:00 | + Population tab (6 goblins, 3 columns). Stone cell appears on first stone. | Assign a Builder and a Warrior. First tip: idle goblin. | Morale bar (first time it moves 10+) |
| 7:00-9:00 | + Morale bar. Day 5-6. Advisor says: "Food 3 days. OK for now." | Keep food at 3+ days while building a palisade. | War Room tab at T-5 days (auto-pause and banner) |
| 9:00-11:00 | + War Room: one bar (their strength vs your defense). Checklist "War in N days". | Fix the checklist: Defenders 3/4, palisade, food. | Hierarchy tab pulses (a goblin is promotion-eligible) |
| 11:00-12:30 | + Hierarchy (promote action only). Day 8-9. | Promote one goblin. See morale/output nudge. Autosave at T-1 day. | War banner at T-1 day (auto-pause) |
| 12:30-14:00 | All of the above. | Skirmish (war 1). Watch the battle log. | Win: reward screen and unlocks (R&D teaser, a conquest zone). Loss: "Rewind to Day 9" default button. |
| 14:00-15:00 | War 1 summary: what helped, what to improve. | Choose: continue to the full game or tweak. | R&D (needs Research hut), Incentives, intel, naming, conquest zones over the next sessions. |

Pacing check: roughly one new surface every 1.5 to 2 minutes, a first meaningful action inside 30 seconds, and no deadline before minute 12. These timings are proposals to be validated by playtest, not measured values.

---

## 10. Sources

Developer or primary-ish:
- Game Developer, Teaching players without tutorials in Kingdoms and Castles: https://www.gamedeveloper.com/design/teaching-players-without-tutorials-in-i-kingdoms-and-castles-i-
- Game Developer, How Against the Storm mixed city-building and roguelite play: https://www.gamedeveloper.com/business/how-against-the-storm-managed-to-mix-city-building-and-roguelite-play
- Game Developer, A Dark Room's unique journey from the web to iOS: https://www.gamedeveloper.com/design/-i-a-dark-room-i-s-unique-journey-from-the-web-to-ios
- A Dark Room secrets transcripts (Townsend, Rajan): https://adarkroom.fandom.com/wiki/Secrets
- Factorio Friday Facts #241, New player experience: https://factorio.com/blog/post/fff-241
- Inven Global, IGC 2018, Frostpunk scenario writing: https://www.invenglobal.com/articles/6528/igc-2018-empathize-with-numbers-the-process-of-frostpunk-scenario-writing
- Against the Storm official wiki, Tutorial Walkthrough: https://wiki.hoodedhorse.com/Against_the_Storm/Tutorial_Walkthrough
- Kongregate/Pecorella, The math of idle games (talk exists; not read): https://blog.kongregate.com/quest-for-progress-the-math-of-idle-games and https://www.slideshare.net/slideshow/quest-for-progress-gdc-europe-2016/65405507

Secondary and UX:
- NN/g, Onboarding tutorials vs contextual help: https://www.nngroup.com/articles/onboarding-tutorials/
- NN/g, Why so many info tips are bad: https://www.nngroup.com/articles/info-tips-bad
- Apple HIG, Offering help: https://developer.apple.com/design/human-interface-guidelines/offering-help
- UX Collective, Games UX: building the right onboarding experience: https://uxdesign.cc/games-ux-building-the-right-onboarding-experience-a6e99cf4aaea
- Game Wisdom, Pacing problems in game design: https://game-wisdom.com/critical/pacing-problems-game-design
- Eurogamer, Against the Storm review: https://www.eurogamer.net/against-the-storm-review-a-perfectly-chaotic-city-builder
- single-player.org, Against the Storm beginner's guide: https://single-player.org/post/101-against-the-storm-beginners-guide
- Wanderer, Against the Storm review: https://playwanderer.online/game-reviews/against-the-storm
- Wikipedia, A Dark Room: https://en.wikipedia.org/wiki/A_Dark_Room
- ADR wiki, Room (Browser): https://adarkroom.fandom.com/wiki/Room_(Browser)
- Nightmare Mode, A Dark Room first four minutes: https://nightmaremode.net/field-notes/a-dark-room-first-four-minutes/
- IF50, Universal Paperclips: https://if50.substack.com/p/2017-universal-paperclips
- Wikipedia, Incremental game: https://en.wikipedia.org/wiki/Incremental_game
- Quarter To Three incremental thread: https://forum.quartertothree.com/t/the-incremental-thread-of-idle-clickers/145358
- teemo.dev, RimWorld onboarding: https://teemo.dev/game-design/rimworld/systems/onboarding-and-first-session
- teemo.dev, Factorio onboarding: https://teemo.dev/game-design/factorio/systems/onboarding-and-first-session
- RimWorld wiki, Phoebe: https://www.rimworldwiki.com/wiki/Phoebe
- number13, RimWorld storytellers: https://en.number13.de/rimworld-storyteller
- Steam, RimWorld storyteller thread: https://steamcommunity.com/app/294100/discussions/0/2595630410192317026
- PCGamesN, Frostpunk first-night anecdote: https://www.pcgamesn.com/frostpunk/frostpunk-guide
- indienova, Critical play report: Frostpunk: https://lab.indienova.com/indie-game-review/critical-play-report-frostpunk/
- ONI wiki.gg, Getting started: https://oxygennotincluded.wiki.gg/wiki/Guide/Getting_Started
- PC Gamer, Dwarf Fortress tutorial: https://www.pcgamer.com/the-pcs-most-infamously-complex-game-gets-a-tutorial-after-16-years
- Kingdom: New Lands reviews: https://n4g.com/news/2104562/kingdom-new-lands-review-switch-era and https://expertgamereviews.com/?p=1897
