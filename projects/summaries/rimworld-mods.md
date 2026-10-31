# RimWorld mods

Summary of the mods in `D:\SteamLibrary\steamapps\common\RimWorld\Mods`, from each mod's README, HANDOFF, ROADMAP, BACKLOG and About.xml. Source code was not read. All target RimWorld 1.6 and 1.7. Author handle: epiczuper / GTSA.

## Aleria - A Guide For Heroes (`gtsa.aleria`)
- What: lore mod for the author's fantasy world Aleria. 16 xenotypes, mana "cores" as genes and hediffs, a mana/magic system with a Magic tab, ideoligions (Church of Ucliat, Crimson Sun Order), beasts, crystals, and the Doomsday as a recurring threat. A lore mod, not a story mod. Needs Harmony, Ideology, Biotech.
- State: the most developed mod (HANDOFF.md is about 1850 lines). Session 17 (2026-10-19) did a health sweep, balance, archite genes, lifespans and art. Two builds (1.6 and 1.7) and a test harness exist.
- Next (NEXT_SESSION.md / BACKLOG.md): fix art feedback (tetrabrachian arms, kharvex eye, horns); verify Narelith to Lumenari evolution; let crystal tiers gate recipes; lore skin overlays (kharvex veins, syrakai stone); owner decisions on tetrabrachian aging vs lifespan and LifespanFactor double-counting.

## Nemesis System (`epiczuper.NemesisSystem`)
- What: Shadow of War style nemesis system. Raid captains and warchiefs with levels, hidden strengths and weaknesses, taunts, revenge returns, domination into the colony, power struggles, and a Nemesis tab. No Harmony.
- State: only About.xml exists as documentation. Detailed status unknown.
- Next: unknown.

## Titanfall: Rimfall (`epiczuper.titanfall.rimfall`, v1.0.0)
- What: Titanfall 2 in RimWorld. Pilot helmet, suit and jump kit; 7 Titan chassis (Vanguard/BT-7274, Ion, Scorch, Northstar, Ronin, Tone, Legion) with Core abilities; Titanfall drops, auto-Titan, auto-eject; new research tab. Needs Harmony and Biotech. Combat Extended patch loads automatically. Optional First Person integration.
- State: README says tested with Harmony, Biotech, Ideology, with and without CE, and a 180-mod list. Art is rendered from CC-BY 3.0 Poly Pizza models, SFX are Kenney CC0, voice lines are original TTS. No Titanfall files used. Unofficial fan mod.
- Next: unknown (no roadmap file).

## RuleBreakers (`gtsa.rulebreakers`)
- What: body-snatching spirits ("Resurrects": Newling, Adapter, Imposter) versus people born with a personal Rule (Enforcers). Purge Pills, collars, Bonds, an HQ bounty tab, about 35 settings. Based on the author's story RULEBREAKERS; the owner decides lore.
- State: HANDOFF.md at session 10d (2026-10-13): runs on 1.7, 21/21 smoke tests passing. Code namespace stays `ResurrectMod` for save compatibility.
- Next (ROADMAP.md): playtest the session 10 features; Flannel Shirt recurring boss; make "the organisation" a real faction (needs a name from the owner); collar rendering; two Bypasses not yet possible; Workshop prep.

## Monolith: Kavros-9 (`gtsa.monolith`)
- What: story-based mod from the author's "The Nebulous Odyssey". Elther powers, the Zeiphon Empire's Assessment, ZTAN bosses, Kavros-9 factions, E-Zones, a Sentenced start, a final offensive ending. Needs Harmony and Biotech; CE patch built in. Adds a cross-mod "Eidolon" power when Aleria and RuleBreakers are both active.
- State: Phase 3 built (HANDOFF session 5, 2026-10-24). A full-modlist run of 40k ticks had 0 Monolith errors. The 1.6 build compiles but is untested (only 1.7 installed).
- Next: owner's full playthrough to the ending; art rework (the `D:\Bilder` AI images are reference only; no paid image model); cut in-game story references a non-reader cannot know; unbuilt items include Kael Dravok/Aria events, jet boots and a Credits currency.

## CordycepsOutbreak (`epiczuper.CordycepsOutbreak`)
- What: The Last of Us style mashup. Infected types (Runner to Rat King), Cordyceps infection with amputation and suppressant, FEDRA, Hunters, WLF, Seraphites and Fireflies. Original painted and synthesized art and audio. No Harmony.
- State: playable per About.xml; CE patch included; procedural sprites ship now.
- Next: optional hand-painted AI art via `ART_PROMPTS.md` (3 views per creature, then an import script). Anything else: unknown.

## Zeiphon Race mod (old stub)
- A 2023 RimWorld 1.4 stub with files saved as .txt (About, biome and body defs). Monolith's HANDOFF says to leave it untouched unless the owner says to archive it. Superseded by Monolith. Note: the folder is named "Zeiphon Race mod".

## rjw-* (third-party, not the owner's work)
- rjw-master (RimJobWorld, Ed86), rjw-genes (Vegapnk, 1.6 rewrite by Telanda, v2.6.2), rjw-traits (ArcherSaiter, v1.53), rjw-experience-ideology (amevarashi, v1.6.1.0), rjw-cnc (Moth). Adult-oriented framework and add-ons installed in the owner's modlist. No planned work found in the files read.

## Where Grok could help
- Video/image: trailers or key art for Aleria races, Titans, Resurrects and ZTAN bosses (Monolith needs original art, not the `D:\Bilder` images); hand-painted CordycepsOutbreak sprite sheets from `ART_PROMPTS.md`.
- Live research: current RimWorld 1.7 modding changes, Workshop upload requirements, Combat Extended updates, how comparable mods are received.
- Independent review: RuleBreakers bounty economy, Monolith boss difficulty, Aleria crystal-tier recipe design.
- Mature content Claude declines: adult material around the rjw-* add-ons or adult story content for these worlds.
