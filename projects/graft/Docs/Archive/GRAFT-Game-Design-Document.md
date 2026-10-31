# GRAFT — Game Design Document

*Working title. A linear, story-driven first-person shooter set in the Arcane Nexus of the Nebulous Odyssey. Engine: Unreal Engine 5. Platform: PC first, current-gen consoles later.*

---

## 0. How to read this document

- **Canon** means it comes from the Nebulous Odyssey wiki or the lore bible (the Google Doc "The Nebulous Odyssey", Arcane Nexus, Tazkov, Aria Nova, Zeiph, ZTAN, Rynex and HINR tabs).
- **New** means it was invented for this game. The author approved the New items on 2026-10-25 (Section 8). Nothing here contradicts the bible; where the bible is silent, this document fills the gap and says so.
- All story text (dialogue, logs, barks) follows the "Literature Research" style guide: Monolith/Arcane Nexus genre notes, plain words, subtext, no tidy morals, no wisdom lines at the end of scenes.

---

## 1. The pitch

You are a Zeiph, the black-armoured, horned, red-eyed super-soldier of the Zeiphon Empire. Except the thing inside the armour is a person.

Normal Zeiph are grown from Aria Nova's technology (the "womb") and brought to life by Tazkov's power (the "seed"). They share a hivemind, need no food or rest and do not doubt. **Project GRAFT** (New) is Aria's experiment in skipping the seed: a living, sentient soldier from a conquered species is sealed inside a Zeiph shell. The shell gives them the strength. The pilot gives the shell a mind of its own. There is no hivemind link, because the link came from the seed.

The Empire wants to know one thing: can a Graft take a world without Tazkov's spark in it? The test site is **Tamra**, a backwater planet of ordinary humans who have never seen a Zeiph. You are dropped onto it in a pod, alone on a silent channel, while a handler grades everything you do.

**The player fantasy:** the raw power of a Zeiph (walking through rifle fire, tearing turrets off their mounts, punching through walls), set against a small, breathing body inside it that can still be hurt, still remembers, and is never told what its score is.

### Pillars

1. **Monstrous power, human fragility.** The shell is nearly unstoppable; the pilot is not. Every system plays on that gap.
2. **The silent channel.** Every other Zeiph is connected and you are not. You see less than they do, you hear nothing from them, and they treat you as equipment.
3. **Graded, never judged.** The Empire records every choice. The game never tells you whether you chose well.
4. **Ground-level scale.** An invasion of a whole planet seen through one visor. Big events happen at the edge of the frame and in the gaps between missions (style guide: Black Company, The Expanse).

### Comparable games (for tone and quality)

- **Halo 3 / Halo Infinite:** a super-soldier power fantasy and a readable combat sandbox.
- **Titanfall 2:** level-by-level mechanical surprises; the bond between a pilot and a machine.
- **Half-Life 2:** a seamless linear campaign with no cutscenes that take control away for long.
- **DOOM Eternal:** an aggressive, push-forward combat loop.
- **Spec Ops: The Line:** the player's actions reflected back without a moral meter.
- **Metro Exodus:** a diegetic HUD, atmosphere, and a world that does not explain itself.

---

## 2. Lore foundation

### 2.1 What the bible already says (Canon)

- **The Zeiphon Empire** is led by Tazkov, with sub-leaders Raymond Archer, Aria Nova and Daimonikos (Karakul is the unwelcome fourth). Its goal is Total Reunity. Tazkov's only order: *lay claim to every world you come across*, with no word on how.
- **Zeiph:** black armour, a helmet covering the whole head with two horns on the forehead, red eyes, prominent spiked shoulder pads, a muscular silhouette. About 100 times stronger than a human soldier. No food or rest. Hivemind. Absolute loyalty to Tazkov. Disobedience means death. Lower ranks keep traces of emotion that come out as sadism, often when ordered to kill. Higher ranks have given up emotion entirely.
- **How Zeiph are made:** Aria's technology is the womb; Tazkov's power is the seed.
- **Aria Nova:** knowledge matters more to her than safety or ethics. She can Scan, Manifest inorganic matter, Warp, and control electronics. She builds constructs with minds of their own (Ria Nova is one).
- **Resources are stretched:** the Holy Imperium's counter-offensive in other sectors (Monolith) has thinned the Empire's forces.
- **The Holy Imperium of New Radiance (HINR):** the Elyan people, faith in Armethon, the Five Watchers. Elite units Lynthar (the anomaly hunters, counterpart to ZTAN) and Saber. Tonzat of Lynthar's First Squad can mimic Zeiphon appearances and carries a Zeiphon bounty.
- In Monolith, a lone Zeiph walks straight through a S.C.A.L.E. squad, ignoring them, while jamming floods their comms. **That image is the visual target for how Zeiph move in this game.**

### 2.2 What this game adds (New, approved by the author)

| Item | What it is |
|---|---|
| **Project GRAFT** | Aria's program to put living sentient pilots inside Zeiph shells, bypassing the need for Tazkov's seed. She runs it partly to solve a supply problem and mostly because she wants to know what happens. |
| **Why there's no hivemind** | The hivemind travels through the seed. No seed, no link. Grafts are deaf to other Zeiph and invisible on their shared overlay. |
| **Graft shell** | Same silhouette as a standard Zeiph, with three tells: a ribbed life-support spine down the back, a faint pulse of breath-fog from the helmet's neck seal in cold air, and eyes that burn **amber** instead of red. Other Zeiph notice the amber. Tamri civilians don't. |
| **The pilots** | Conscripted from worlds the Empire already holds. Partial memory suppression; names stripped and replaced with designations. |
| **The Ossari** | The protagonist's species. Near-human, conquered by the Zeiphon about a decade ago. Their sound palette is soft and vowel-heavy: Ilku, Saar, Oss, Ammeli, Tuuro. |
| **Tamra** | The test world. The Empire's catalogue entry is "Survey Subject TR-41". Ordinary humans, technology roughly at the level of 2040s Earth, no superpowers, no Elther, no mana. Chosen because nobody important will notice if the test goes badly. |
| **PROCTOR** | An Aria construct that serves as your handler and evaluator. It lives in your comms and is never seen until the end. |
| **Carrier *Ninth Claim*** | The Zeiphon ship in orbit over Tamra. Its name refers to Tazkov's order. |

### 2.3 The protagonist

- **Designation:** GRAFT-14. PROCTOR calls you "Fourteen".
- **Real name:** Ilku Saar (New), recovered in fragments during the campaign. The game never says it outright until the pilot remembers it, and it never shows on the HUD.
- **Who she was:** a junior surveyor on Oss, the Ossari homeworld, before the Empire took it. She mapped river deltas. She was never a soldier. Her surveying habits leak through: she counts floors, reads terrain, estimates distances aloud under her breath. (The pronoun and gender are swappable; nothing in the design depends on them.)
- **Voice:** she barely speaks. When she does, it's to herself, short and dry, sometimes in Ossari (subtitled). She is opinionated in small ways ("That roof won't hold. I'd bet money on it.") and unsure in big ones.
- **What she wants:** at first, to survive the test. Later, to know what happened to Oss, which nobody will tell her. By the end she wants something she can't name, and the game doesn't name it for her.
- **What the player never gets:** a speech, a reveal of her true feelings, or a choice menu.

### 2.4 Cast

| Character | Role | Notes |
|---|---|---|
| **PROCTOR** (New) | Handler, evaluator, narrator by default | An Aria construct. Precise, polite, curious, not cruel. Speaks in measurements and probabilities. It is the only voice in your ear for most of the game. It sometimes asks questions that aren't on its checklist and then logs that it asked. |
| **Aria Nova** (Canon) | The program's owner | Heard twice: once in a pre-drop briefing recording, once at the end. Her line from the wiki sets her register: emotions are variables. |
| **Zeiph Line Squads** (Canon) | Your "allies" | Hivemind Zeiph. They walk through gunfire and ignore you unless PROCTOR overrides them. They never speak. |
| **GRAFT-11** (New) | Rival, mid-game boss | Another Graft, dropped three weeks before you. Her pilot came from a conquered warrior culture and loves the work, like the sadistic lower ranks the Zeiph page describes. She's what PROCTOR's best score looks like. |
| **Captain Vesna Orl** (New) | Tamri officer, recurring enemy voice | Commands the "Pell Yards" defence. You hear her on captured radios through the whole campaign. She works out that one of the "horns" behaves differently before anyone else does. |
| **Dov Orl** (New) | Civilian, her younger brother | A radio operator at a civilian relay. Meeting him (or not) is the campaign's quietest moment. |
| **Tonzat** (Canon) | HINR Lynthar, First Squad | Arrives late to investigate the "anomaly". He can disguise himself as a Zeiph, and you, the only Zeiph without the hivemind, can't tell him apart from real ones. |

### 2.5 The Tamri

- One nation-state on one continent: **the Tamri Commonwealth**, capital **Dalsk**. Industrial, rainy, cold coasts, brutalist housing blocks, tram lines, hydro dams in the highlands.
- **The Directorate Army:** conscript infantry, light armour, attack helicopters, drone swarms, and a few heavy anti-armour teams the soldiers call **hammer crews**.
- **Their slang for Zeiph:** "horns". For the Graft, once they notice it: "the quiet one".
- **Language:** a constructed language with a hard, consonant-heavy sound (Dalsk, Orl, Pell, Vesna, Kreb, Tavisk). Subtitled. Radio chatter is a major storytelling channel.
- **Their reaction to the invasion:** panic, then grim organisation. They aren't helpless: they adapt over the campaign, and the enemy design follows that.

---

## 3. Story

### 3.1 Structure

Eight missions, plus a prologue that runs inside the drop pod. Each mission is 45–75 minutes of play, about 8–10 hours in total. It is linear, but with wide combat arenas (Halo-style "valleys" between corridors). No cutscene takes control away for more than about 20 seconds; story happens through the visor, the radio and the world.

**Between missions:** short in-universe documents fill the loading screens (style guide: A Memory Called Empire). These include PROCTOR's evaluation forms with the scores blacked out, Tamri propaganda posters, a Directorate field manual page on "horn" weak points, intercepted civilian messages, and a Zeiphon asset-requisition form listing "GRAFT-14: 1 unit, sentient, Ossari".

### 3.2 Mission list

**Prologue — "Seal"**
Black screen. Breathing. A latch. The helmet closes over the player's view from the inside, and the HUD boots up in pieces. PROCTOR runs a systems check, which doubles as the controls tutorial: look, flex hands (the fingers move on screen), test the voice-to-text log. You're in a launch cradle inside the *Ninth Claim* with a row of standard Zeiph in their own cradles. Their red eyes are all lit and in sync. Yours are amber, reflected in the glass. Aria's recorded briefing plays: precise, dull, terrifying in its indifference. The cradle drops.

**Mission 1 — "Descent"** *(THE VERTICAL SLICE; detailed in Section 6)*
The drop pod, atmospheric entry, Tamri air defence, a crash into a district of tower blocks at the edge of Dalsk, and the first fight: you against a Directorate garrison as the city wakes up to the invasion. The objective is to silence the anti-orbital battery at Pell Yards so the main Zeiph wave can land. It ends with the main wave coming down behind you like black rain, and none of them look at you.

**Mission 2 — "Quiet Channel"**
You're attached to a Zeiph line squad advancing through the industrial district. Mechanic introduced: **the hivemind gap**. The squad reacts to threats you can't see (their overlay shares targets; yours doesn't), so you learn to read *their* movement as your sensor. PROCTOR has to override them to make them cover you, and logs each override as a cost. Captain Orl's voice appears on captured radio for the first time. Set piece: a tram-line bridge collapse.

**Mission 3 — "Census"**
Sweep and hold a residential district. PROCTOR's orders are to clear the blocks. Civilians are sheltering in the stairwells. The game never offers a choice prompt, but you can fire on them, walk past them, or close a door on them. PROCTOR logs it all in the same flat voice ("Noted."). The Zeiph line squads clear what you don't, and you can hear them doing it two floors down. Mechanic introduced: **the Evaluation log** (Section 4.7). No outcome changes the next mission's layout. It changes what PROCTOR says, what Orl says about "the quiet one" on the radio, and what the documents between missions record.

**Mission 4 — "Delta"**
A flooded river district south of Dalsk. The terrain matches Ilku's surveying memories, and the memory suppression starts to fail. Mechanic introduced: **Bleed** (Section 4.6). Overlays of Oss (the same water, different light, Ossari voices) flicker into the fight. Bleed makes some things clearer (she knows where the ground is solid) and some things worse (her aim drifts when the Ossari voices are loud). Ends with Ilku saying, in Ossari, the name of the river she used to map. PROCTOR asks what the word means. She doesn't answer. PROCTOR logs the silence.

**Mission 5 — "The Dam at Tavisk"**
The largest combat space in the game: the Directorate's last highland stronghold and the hydro dam that powers Dalsk. The Tamri have adapted, with hammer crews, EMP mines that blind a Zeiph visor, and drone swarms that go for the life-support spine. A siege set piece with Zeiph line squads. Midway through, you meet **GRAFT-11**, who has been here for three weeks. She talks constantly, she's funny, and she's horrible. She's also the only one who can hear you on the Graft channel. For a mission she's company.

**Mission 6 — "Eleven"**
GRAFT-11 has gone past her orders, wiping out a surrendered garrison for her own enjoyment, and PROCTOR rates her "highest efficiency in the program". Then the *Ninth Claim* orders her retrieved for study, and she refuses. You're sent to bring her in. **Boss fight:** Graft against Graft, in a burning refinery. She fights like you do, because she has the same body. When her shell is breached you see her pilot's hand, which has been in the armour too long. What you do at the end is up to you, through combat alone: finish her or walk away. Either way PROCTOR logs it.

**Mission 7 — "Anomaly"**
The Holy Imperium has noticed. A small Lynthar team led by **Tonzat** lands to study the Graft program, which their doctrine classes as an anomaly. Tonzat can disguise himself as a Zeiph. Every other Zeiph can tell him apart through the hivemind; you can't. Mechanic: **trust nothing red-eyed.** Fake Zeiph wander through allied squads, and the tells are subtle (the gait, a reload a beat too human, a head turning toward a sound a real Zeiph would ignore). Captain Orl, now working with the Imperium, tries to contact "the quiet one" directly on an open frequency. You can answer, using the voice-to-text log from the prologue. PROCTOR can hear everything.

**Mission 8 — "Retrieval"**
Tamra is effectively taken. PROCTOR orders you to the extraction point at the Pell Yards, the place you landed. The walk back through a conquered city is the last level: few fights, lots of aftermath, with Orl's voice, Dov's relay, Bleed and GRAFT-11's channel (alive or silent depending on Mission 6). The last fight is short and messy and against whoever is left. At extraction a pod is waiting. PROCTOR finally shows itself as a construct standing at the pod door. It reads the evaluation summary aloud, and every score is withheld. Aria's voice speaks one line over it.

**The ending (ambiguous, by design):** the pod door is open. The player has control. Walking in ends the game. Walking away ends the game too, after a long walk in which no Zeiph stops you and PROCTOR stops talking. Both endings cut to the same final document: a Zeiphon requisition form. "GRAFT program: status ___." The status field is stamped, and the stamp is smudged so it can't be read. There's no epilogue and no title card that says what it meant.

*(Why both endings stay ambiguous: if she gets in the pod, it's unclear whether that's obedience or exhaustion. If she walks away, nobody stops her, which suggests the Empire wanted to see what she'd do, and so it may still be part of the test. The style guide asks for "open endings over bows", and so does the brief.)*

### 3.3 Threads that stay open

- What happened to Oss. Hinted at, never confirmed.
- Whether PROCTOR's questions were part of its programming.
- What the program's grade was.

### 3.4 Who is (and isn't) in this story

- **Tazkov doesn't know about Project GRAFT.** It's Aria's program, run on her own discretion, the way Tazkov's one order leaves every sub-leader free to act. He's mentioned once or twice at most (the Zeiph's loyalty to him, the "seed"), and never appears or speaks.
- **Aria Nova** is the only sub-leader present, and only as a voice: the recorded briefing in the prologue and one line at the end. She's never seen.
- **No Raymond or Daimonikos cameos.** They're saved for a possible prequel or sequel.

---

## 4. Gameplay systems

### 4.1 Core loop

Move fast → break cover (literally) → overwhelm a position → absorb punishment on the shell → protect the pilot → read the battlefield without a hivemind → push to the next position.

### 4.2 The two-layer body

| Layer | What it is | Behaviour |
|---|---|---|
| **Shell Integrity** | The Zeiph armour | Large pool. Small-arms fire barely dents it. Explosives, anti-armour rounds, EMP and melee from heavy enemies do. It **regenerates slowly while you're in motion** (the shell is a Zeiph body; it doesn't rest, it repairs while working). Standing still stops regeneration, which pushes the player forward. |
| **Pilot Vitals** | Ilku | Small pool. Only takes damage when a hit lands on a **breached** shell section, or from concussive blasts and EMP shocks that rattle her inside. **It does not regenerate** within a combat encounter. Medical stims inside the suit restore it at checkpoints and from Zeiphon supply caches. Low vitals mean blurred vision, muffled hearing, louder breathing, and aim sway. |

**Localised breaches:** the shell has five zones (helmet, torso, spine, left arm, right arm). Breaching one exposes it, so further hits to that zone go to the pilot. A breached right arm adds recoil; a breached helmet cracks the visor and corrupts part of the HUD; a breached spine stops shell regeneration until you reach a cache. Enemies, especially late-game ones, aim for breached zones on purpose.

This is how a soldier "100 times stronger than a human" can still lose: the Tamri can't kill the Zeiph, but they can find the person inside it.

### 4.3 Movement and strength

- **Weight:** heavy and fast, like a tank that sprints. Footsteps shake the camera and chip the floor. Sprinting through thin walls, glass, fences and parked cars is a move, not a glitch (Chaos destruction).
- **Charge:** a sprint into a shoulder-barge that knocks infantry flat and breaches interior walls.
- **Grab:** lift and throw enemies, crates and car doors. Hold a Tamri soldier as a shield. (The game doesn't comment. PROCTOR logs it.)
- **Tear:** rip mounted guns off their tripods and use them (Halo-style), tear doors off APCs, pull a helicopter's skids down from a rooftop.
- **Ground Slam:** jump and slam down to stagger everything around you. On a weak floor you go through it.
- **Vault and climb:** big hands and big reach. Climb ledges two metres up. No wall-running: this body is heavy.
- **No jetpack.** The weight is the identity.

### 4.4 Weapons

**Zeiphon arsenal (New designs that keep the canon silhouette: black, spiked, red-lit; Graft-issued versions have amber lights):**

| Weapon | Role | Feel |
|---|---|---|
| **Thorn Rifle** | Default rifle | Fires heavy needle-slugs that pin bodies to walls. Medium rate of fire. The magazine is a living-looking cartridge that "breathes" between reloads. |
| **Hollowcannon** | Close range | A wrist-mounted shotgun that breaches cover and doors. |
| **Rendline** | Precision | A charged beam that cuts through multiple walls, fed by your shell's power, so firing it pauses shell regeneration. A risk/reward choice. |
| **Spine Lance** | Heavy | A shoulder-fired anti-vehicle launcher. Few rounds. |
| **Talon Blades** | Melee | Retractable forearm blades for finishing moves and for cutting through barricades. |
| **Brand Charges** | Grenades | Adhesive charges that burn through armour. |

**Tamri weapons (pick-ups):** made for human hands, so in Zeiph hands a rifle is handled like a pistol, one-handed, with the stock snapped off. They're weak against armour but useful for ammo and some special rounds (Tamri armour-piercing, incendiary). Picking up a hammer crew's anti-armour rifle is a highlight: it's the one Tamri weapon that hurts Zeiph, and now you have it.

**Loadout:** two primary weapons, one heavy, blades always on, four grenades. Swap at caches.

### 4.5 The Hivemind Gap (signature mechanic)

- Standard Zeiph share a tactical overlay. When a squad is near, you see the results of that overlay (their heads turn as one, they fire at things you can't see) but not the overlay itself.
- **Reading the squad:** their movement is a sensor. If three Zeiph turn left, something is to the left. The game teaches this in Mission 2 and builds on it through Mission 7.
- **Your own sensors** are cruder: a short-range **Echo pulse** (a sonar sweep that shows outlines through walls for two seconds, on a cooldown) and a directional threat ring.
- **PROCTOR overrides:** at key points PROCTOR can force a squad to follow you, cover you or breach for you. Each override is logged, and PROCTOR comments on how often you need one.
- **Mission 7 inversion:** Tonzat's disguised Zeiph exploit the gap. The hivemind squads attack him instantly when they find him, so watching them is how you spot him, which is the lesson from Mission 2 used against you.

### 4.6 Bleed (memory)

- A meter that rises in certain places (water, open sky, terrain like Oss), after taking pilot damage, and when you hear the Ossari language.
- **Low Bleed:** nothing.
- **Medium Bleed:** Oss starts showing through, like a faint double exposure (river light, wooden walkways, shapes of people). Ilku mutters terrain readings, and the game highlights solid ground and safe drops she "remembers". This helps.
- **High Bleed:** the overlays get stronger and voices talk over the radio. Aim sway rises. Sometimes a Tamri soldier briefly looks Ossari. This hurts.
- Bleed falls over time and drops when Ilku names something (a scripted moment or a player-triggered "focus" button that makes her count floors aloud). That's the pilot's coping habit made into a control.
- **Never used for jump scares.** Bleed is quiet and sad, not horror.

### 4.7 The Evaluation (diegetic score)

- PROCTOR logs everything: kills, civilians spared or killed, overrides used, damage taken, time per objective, obedience to orders, surrenders accepted or ignored, what you did with GRAFT-11, whether you answered Orl.
- **The player never sees a number.** No karma meter, no "Ilku will remember that".
- What changes: PROCTOR's lines, Orl's radio chatter about "the quiet one", the documents between missions, GRAFT-11's attitude toward you, and small world details in Mission 8 (which buildings still stand, who's in the streets).
- **Combat Performance** is the only score shown, and only as a Halo-style medal popup in the corner (multikill, through-wall kill, shell-breach recovery). It's for the player's skill, not the story.

### 4.8 HUD (diegetic, inside the helmet)

- The view is through two eye-slits that the visor merges into one image; the frame edges show the inside of the helmet on wide aspect ratios. A setting can turn this off.
- HUD elements are projected on the inner visor with slight parallax: shell zone diagram (bottom left), pilot vitals as a heartbeat line (bottom right, quiet until it matters), ammo on the weapon itself, Bleed as colour bleeding in from the edges.
- **A missing hivemind panel:** the top of the visor has a dead rectangle where standard Zeiph see the shared overlay. It shows static. It's never explained in text.
- Breach damage corrupts the HUD for real: a cracked helmet loses the shell diagram.

### 4.9 Enemy roster (Tamri Directorate)

| Enemy | Threat | Behaviour |
|---|---|---|
| **Conscript** | Low | Panics, flees, sometimes surrenders (hands up, weapon dropped). Fires wildly. |
| **Line Rifleman** | Low–Medium | Uses cover, suppresses, calls positions on the radio (you can hear it). |
| **Hammer Crew** (2-person) | High | Anti-armour rifle plus a spotter. Aims for breached zones. Kill the spotter and the gunner misses more. |
| **EMP Sapper** | Medium | Places EMP mines and throws EMP charges that blind the visor and stop shell regeneration for a few seconds. |
| **Drone Swarm** | Medium | Small quadcopters with shaped charges. They go for the spine. Shoot them or swat them. |
| **APC / Light Tank** | High | Tear off the doors, ride the hull, punch in the hatch. |
| **Attack Helicopter** | High | Spine Lance, a captured anti-air gun, or a rooftop jump onto the skids. |
| **Officer** | Support | Buffs morale. Kill them and nearby conscripts break. Captain Orl is never fought directly. |

**Later enemies:**

| Enemy | Threat | Behaviour |
|---|---|---|
| **Lynthar Operative** (HINR) | Very high | Supernatural ability, stealth. Holds their ground. Some can hurt the pilot directly through the shell. |
| **Tonzat** | Boss-tier presence | Never a straight fight. A hunt in Mission 7 that ends with his withdrawal, not his death (he's canon, so the game doesn't kill him). |
| **GRAFT-11** | Boss | A mirror match. Uses your full moveset plus talon-blade lunges and a scream that spikes your Bleed. |

**AI pillars:** enemies fear you (morale states), adapt over the campaign (the Directorate learns to target breaches and spines), and talk on the radio about what you're doing, so the player hears the AI reason. Use StateTree for individual behaviour, EQS for cover, and a squad-level director for group tactics.

### 4.10 Allies

- **Zeiph Line Squads** don't take orders from you, don't revive you, and don't speak. Their animation is the tell: slow, total, in sync, unbothered by fire. They walk through gunfire the way the Monolith scene describes. They're terrifying to fight beside.
- **GRAFT-11** in Mission 5 is the one ally who talks. Her company is the game's only warmth, and it's ugly warmth.

---

## 5. Art, audio and technical direction

### 5.1 Visual direction

- **Palette:** Tamra is grey-green, wet concrete, sodium streetlights, rust and rain. The Zeiph are pure black with red light. The Graft is black with amber light. Oss (in Bleed) is warm, gold, river-blue.
- **Zeiph design:** follow the wiki exactly: a full helmet with two forehead horns, red eyes, pronounced spiked shoulder pads, a muscular sculpted armour form. The Graft adds the ribbed spine and amber eyes. Make the armour read as organic-mechanical (Aria's tech grown around Tazkov's seed): seams that look like healed tissue.
- **Scale:** a Zeiph stands about 2.4 m tall. Doors, cars and people should feel small against the player's hands.
- **Tamri:** helmeted humans on the UE5 mannequin skeleton (MetaHumans deferred until better hardware), with practical, slightly retro-future military gear. Brutalist housing, tram wires, concrete bus shelters, posters in their own script.
- **Lighting:** Lumen global illumination, heavy volumetric fog and rain, emissive Zeiph eyes casting real light on wet surfaces at night.
- **Destruction:** walls, fences, cars and interiors break apart through Chaos destruction. A fight should leave a mark on the space.

### 5.2 Audio direction

- **The pilot's breathing** is the most important sound in the game. It's always there, quiet and close, a human sound inside an inhuman machine. It speeds up with low vitals and high Bleed. Standard Zeiph make no breathing sound at all.
- **Zeiph sound:** heavy, wet-mechanical footfalls; no voices; a low sub-bass hum when a squad acts in sync through the hivemind (the player hears the sync without knowing what it is).
- **The Tamri** sound panicked and human: radio static, a constructed language, sirens, civil-defence broadcasts.
- **PROCTOR:** close, dry, centred in the mix, as if it's inside your skull.
- **Music:** sparse. Low percussion and processed strings in combat. In Bleed: an Ossari folk melody played on a plucked string instrument, distorted and drifting in and out of tune.
- **Tech:** MetaSounds for procedural layers (breathing, footsteps by surface, shell-damage creaks), audio occlusion, convolution reverb for interiors.

### 5.3 Technical targets

| Target | Spec |
|---|---|
| **Engine** | Unreal Engine 5.8 (installed at `D:\Epic Games\UE_5.8`) |
| **Rendering** | Nanite, Lumen (software everywhere, hardware ray tracing where supported), Virtual Shadow Maps, TSR, with DLSS/FSR/XeSS plugins. Full scalability tiers down to a baked-lighting Low preset. |
| **Performance** | Dev PC (GTX 1650 4 GB): 30 fps at 1080p, Medium, with upscaling. Recommended (RTX 3070 / RX 6800 class): 60 fps at 1440p with upscaling. High-end PCs: a 120 fps mode. See 7.5. |
| **Worlds** | A persistent level per mission plus one streamed sublevel per beat. No visible loading inside a mission. (World Partition is overkill for linear levels and hard for several agents to share.) |
| **Animation** | Slice: first-person arms plus a full-body shadow mesh, montages for grabs and tears. Later: full-body first person, Motion Matching, Control Rig hand IK |
| **Gameplay framework** | Gameplay Ability System (GAS) for abilities, damage and effects; Enhanced Input; StateTree for AI; EQS for cover. Later: Mass AI for crowds and distant battles |
| **Destruction** | Chaos Geometry Collections with performance budgets per arena |
| **VFX** | Niagara |
| **Platforms** | PC (Windows) first. PS5 / Xbox Series later. |

### 5.4 Accessibility

Remappable controls, toggle or hold for every hold action, subtitles (with speaker names and a background panel), colourblind options (red and amber must stay distinguishable: give amber a shape cue on the HUD as well), a reduced camera-shake option, a reduced Bleed-distortion option, an aim-assist slider, and a field-of-view slider.

---

## 6. Vertical slice: "Descent" (the first thing to build)

This is the part of the game that gets built first and polished to final quality. It should take 20–30 minutes to play.

### 6.1 Beat sheet

| # | Beat | Player does | What it proves |
|---|---|---|---|
| 1 | **Seal** | In the cradle aboard the *Ninth Claim*. The helmet closes, the HUD boots, PROCTOR runs systems checks. Look around at the row of red-eyed Zeiph, flex hands, see your own amber reflection in the glass. | Full-body first person, the diegetic HUD, PROCTOR's voice, the breathing |
| 2 | **Drop** | The cradle falls into the pod. Launch. A view of Tamra through the pod's slit window, dozens of other pods streaking down around you. | Scale, atmosphere, and the Zeiphon invasion as a spectacle |
| 3 | **Entry** | Heat glow, buffeting, a PROCTOR countdown. Tamri flak blooms. A neighbouring pod is hit and breaks apart. The player can look around and brace (a button press that reduces the impact shake). | Interactive tension without taking control away |
| 4 | **Hit** | Your pod is clipped. It spins, the HUD glitches, PROCTOR recalculates aloud, and you're off target. | Unscripted-feeling chaos (it's fully scripted) |
| 5 | **Impact** | The pod hits the roof of a tower block in Pell Yards and crashes through three floors (you see each one flash past). Silence. Breathing. Dust. | Chaos destruction, sound design |
| 6 | **Break out** | The pod door is jammed. Punch it out (the first strength input). Step into a ruined apartment. A family's dinner is on the table, still warm. Nobody's there. | The world is real and inhabited; the tone |
| 7 | **First contact** | Down a stairwell. A Tamri conscript rounds the corner, freezes, fires a full magazine into your chest (it does nothing) and runs. You can let him go or not. PROCTOR: "Noted." | Shell power, the Evaluation, no prompt |
| 8 | **The courtyard** | The first real arena: a housing courtyard, riflemen in windows, an APC arriving. Teaches cover-breaking, charge, grab, Thorn Rifle, tearing the APC's door off. | The core combat loop |
| 9 | **Breach** | A hammer crew on a rooftop breaches your torso. The pilot takes damage for the first time. The heartbeat line appears, the breathing gets louder, and PROCTOR says it in numbers. Find the hammer crew, kill the spotter, then the gunner. | The two-layer body |
| 10 | **Tram yard** | A wide arena: drones, an EMP sapper, a helicopter overhead. Pick up the hammer crew's anti-armour rifle. Bring the helicopter down. | Enemy variety and set pieces |
| 11 | **The battery** | The anti-orbital battery at Pell Yards: four big guns, hardened bunkers, Captain Orl's voice on the radio rallying her troops. Destroy the guns one by one (a Spine Lance, brand charges, tearing out a firing control). | The mission climax |
| 12 | **Black rain** | The last gun goes down. Silence. Then hundreds of pods streak down over Dalsk behind you. A Zeiph line squad lands nearby, steps out, walks past you without turning its head, and moves into the city. PROCTOR: "Phase one complete, Fourteen. You may stand down." The pilot's breathing, alone. Fade. | The emotional hook and the hivemind gap |

### 6.2 Slice deliverables

- A playable level from beat 1 to beat 12 with final-quality lighting, audio and destruction in the key spaces. Placeholder art is allowed anywhere the player doesn't look closely.
- Every core system working in a basic form: the two-layer body, zone breaches, movement and strength (charge, grab, tear, slam), three Zeiphon weapons plus Tamri pick-ups, Conscript, Rifleman, Hammer Crew, Drone and APC enemies, the diegetic HUD, PROCTOR's voice system and the Evaluation logger.
- A performance capture: 30 fps at 1080p, Medium, TSR, on the GTX 1650 dev PC.
- The slice's milestone order, cuts and deferrals are in `Docs/BUILD-PLAN.md` (it builds the fun first and the drop-pod spectacle last).

---

## 7. Production notes

### 7.1 Who does what (solo, zero budget)

GRAFT is a solo project. An AI coding agent (Claude Code) does the heavy lifting in Unreal: all C++ and Blueprints, systems, AI, the HUD, the level greybox, materials, Niagara effects, sound wiring and tests. The author directs, makes the art with free AI tools, listens, plays and decides.

The author's tools: **Gemini Pro, SuperGrok, ChatGPT Go**, plus free software and free tiers. Everything below is free or has a free tier.

> **Licence note.** Many free tiers are for non-commercial use only, or ask for credit. That's fine while GRAFT is a hobby project. If it might ever be sold, check each tool's current terms before release, and keep every asset's source and licence in `Docs/LICENSES.md` from day one. Terms change often, so check them rather than trusting this list.

### 7.2 The free asset pipeline

| Need | Free route | Notes |
|---|---|---|
| **Concept art** (Zeiph, Graft, Tamri, Dalsk) | **Gemini** image generation, **Grok Imagine**, ChatGPT image generation | Make turnaround sheets (front, side, back on a plain background). They feed straight into the image-to-3D step. Ready-made prompts are in 7.4. |
| **3D models from images** | Free tiers of **Meshy** (100 credits/month) and **Tripo**; **Hunyuan3D 2.1** web demo | Meshy and Tripo free outputs are public **CC BY 4.0** (credit them). Hunyuan3D uses Tencent's community licence, which **doesn't apply in the EU, UK or South Korea**, so skip it if you live there. TRELLIS needs about 24 GB of VRAM, so it can't run on this PC. Expect cleanup. |
| **Model cleanup** | **Blender** (free) | Decimate, fix normals, split the armour into pieces, make UVs. The agent can write Blender Python scripts for repetitive steps. |
| **Rigging and animation** | **Mixamo** (free with an Adobe ID; in maintenance mode, so grab what you need), Epic's free **Game Animation Sample** (updated for 5.8), the **IK Retargeter** built into Unreal | The Zeiph is humanoid, so Mixamo and Epic's skeleton both work. Scale the rig up to 2.4 m. Don't redistribute raw Mixamo files. |
| **Your own mocap** | Free tiers of webcam/phone mocap tools (for example Rokoko Vision), and **MetaHuman Animator** for faces if you have an iPhone | Optional. Useful for the grab and tear moves. |
| **Tamri humans** | **MetaHuman** (free, built into recent Unreal versions) | Realistic soldiers and civilians. Keep the count low on a 4 GB GPU. |
| **Environments** | Fab's free assets (the permanently free filter, plus the monthly free picks), Epic's free sample projects (City Sample for building pieces), **Poly Haven** and **ambientCG** (CC0 textures, HDRIs, models) | Brutalist housing blocks and tram yards can be kitbashed from modular pieces. Megascans pricing on Fab has changed, so check what's currently free. |
| **Voices** | **ElevenLabs** (free tier: a small monthly allowance, attribution required, non-commercial). Local open-source TTS that's free and unlimited: **Chatterbox** (emotion control, voice cloning), **Kokoro** (fast and clean), **Piper** (light, slightly robotic) | ElevenLabs Voice Design can create a voice from a description, which suits PROCTOR and GRAFT-11. Use local TTS for the hundreds of Tamri radio barks so the free credits go to the main cast. |
| **Voice treatment** | **Audacity** (free), or Unreal's MetaSounds and submix effects | PROCTOR: a dry, close mix with a slight digital edge. Radio: band-pass, crackle. Helmet breach: distortion. |
| **Sound effects** | **Sonniss GDC bundles** (free and royalty-free), **Freesound** (check each file's licence), the ElevenLabs sound-effect generator | Use real recordings for impacts and footsteps; AI generation for odd organic-mechanical Zeiph sounds. |
| **Music** | Free AI music tiers (non-commercial), Pixabay Music, or free DAWs (LMMS, Waveform Free) | The score is sparse, so a few loops and stingers go a long way. The Ossari folk melody can be a simple plucked line. |
| **Constructed languages** | Gemini or ChatGPT to make word lists and grammar rules; TTS reads the lines | Keep a names-and-words file per culture (style guide: one sound palette per culture). |

### 7.3 What the author does

**Before the agent can start:**

1. **Let the Unreal Engine 5.8 install finish.** As of this writing, `D:\Epic Games\UE_5.8` has only the launcher's download marker in it, so it's still downloading. `C:\Program Files (x86)\Epic Games` holds Epic Online Services, which isn't the engine. **The engine is the one on D:.**
2. **Install Visual Studio 2022 Community** (free) with the "Game development with C++" workload, or whichever version Epic's 5.8 release notes ask for. Without it, the project can't compile C++. It isn't on this PC yet.
3. **Free up space on C:.** It has about 13 GB free. Visual Studio needs a lot of that even when installed to D:, and Unreal's shader cache defaults to C:. Aim for at least 40 GB free on C:, and put the project and its Derived Data Cache on D: (the build prompt tells the agent how).
4. **Claim free content on Fab** (a free Epic account): the Game Animation Sample, City Sample, and any brutalist or industrial kits you like.

**During the build:**

- Make the concept art (prompts in 7.4) and the 3D models from it. **The Zeiph/Graft armour is the most important asset in the game.** Spend the most time on it.
- Approve voices. Pick a voice for PROCTOR, Ilku, Captain Orl and GRAFT-11.
- Play each milestone build and say what feels wrong. The agent can't feel whether the Zeiph is heavy enough or the breathing is too loud. Only a person can.
- Approve every lore decision the agent logs in `Docs/DECISIONS.md`.

**How the AI subscriptions split up:**

- **Claude Code:** builds the game.
- **Gemini Pro:** concept art and turnarounds; a second opinion on design questions; constructed-language word lists.
- **SuperGrok (Grok Imagine):** more concept art and short video references for motion (how a 2.4 m armoured soldier should walk, how a drop pod tumbles).
- **ChatGPT Go:** extra image generation when the others run out; proofreading dialogue against the style guide.

### 7.4 Concept-art prompts (paste into Gemini, Grok or ChatGPT)

**The Graft (hero asset), turnaround:**
> Character turnaround sheet, front view, side view and back view, plain light grey background, full body, neutral A-pose. A 2.4-metre-tall alien super-soldier in sleek black armour with a muscular, sculpted, organic-mechanical form, like armour grown over a body, with seams that look like healed tissue. A full helmet covering the entire head with two short horns on the forehead and two glowing amber eye slits. Large prominent spiked shoulder pads. Spiked forearms. A ribbed, segmented life-support spine running down the back from the base of the helmet to the waist, with small vents. No visible skin. Realistic game-asset style, high detail, even studio lighting, no text.

**A standard Zeiph:** the same prompt, with **glowing red eye slits** and **no ribbed life-support spine** (a smooth back).

**Tamri Directorate rifleman:**
> Character turnaround sheet, front, side and back, plain light grey background, A-pose. A conscript soldier of a cold, rainy, industrial human nation, technology a little ahead of today. Grey-green wet-weather fatigues, a soft cap under a simple helmet, worn webbing, a short bullpup rifle, a radio handset on the shoulder. Tired, young, ordinary face. Realistic game-asset style, no text.

**Pell Yards (environment mood):**
> Night, heavy rain, sodium streetlights. Brutalist concrete tower blocks around a courtyard, tram wires overhead, a concrete bus shelter, propaganda posters in an unknown alphabet. In the sky, dozens of black drop pods streaking down with red-orange heat trails through low clouds. Anti-aircraft fire. Cinematic, realistic, wide shot, no text.

### 7.5 Hardware reality

This PC has a **GTX 1650 (4 GB VRAM), a Ryzen 3 3200G and 16 GB of RAM**. Unreal 5.8 will run, but it's well below what Epic recommends for development with Lumen and Nanite. In practice:

- **The editor will be slow** with big levels open, and C++ compiles will take minutes, not seconds. That's workable.
- **The GTX 1650 has no ray-tracing hardware**, so only software Lumen is available, and it will be heavy at high settings.
- **The plan:** develop with a scalable lighting setup. Software Lumen at low/medium on this PC, a baked-lighting fallback for low-end PCs, and the high-end settings in place for better machines. The game still has a "best quality" mode; this PC just won't run it at full frame rate.
- **The dev-machine performance target** for the slice is **30 fps at 1080p with upscaling at Medium settings** on this PC. The 60 fps at 1440p target (Section 5.3) is for an RTX 3070-class GPU.
- **Upgrade priority if money ever appears:** RAM to 32 GB first (the cheapest big improvement for the editor), then a GPU with 8 GB+ VRAM and ray tracing.

### 7.6 Roadmap

1. **Pre-production:** this GDD, the art bible, the Zeiph character design, greybox of "Descent".
2. **Vertical slice:** "Descent" to final quality. Playtest. Decide whether the two-layer body is fun before building anything else.
3. **Production:** Missions 2–8 in order, with each mission's new mechanic prototyped in greybox first.
4. **Polish and release.**

---

## 8. Lore decisions (approved by the author, 2026-10-25)

1. **No seed, no hivemind:** approved. Project GRAFT's premise stands.
2. **Tazkov doesn't know about the program.** He's mentioned once or twice and has almost no involvement. The sub-leaders carry the weight of the lore (because of him, but that's another matter).
3. **Tonzat in Mission 7:** approved.
4. **The Ossari:** approved as a new conquered people. Keep them.
5. **No Raymond or Daimonikos cameos.** Saved for a possible prequel or sequel. Aria stays voice-only.
6. **Production:** solo and zero budget. Free tools and AI voices only (Section 7).
