# Guide for Heroes, Chapter 1: Grok video output (2026-10-31)

> **Pass 2 (full scene coverage) supersedes pass 1.** Pass 1 (commit 659b8c9, 18:25 UTC) rendered only 3 key scenes (2, 4, 10). Pass 2 renders **all 10 scenes** with fresh reference sheets and builds a rough cut. Pass 1 is listed at the bottom for reference.

Sources: `prompts/guide-for-heroes-video-prompt.md` (~3:15 timed shot list) and `prompts/guide-for-heroes-scene-prompt.md` (untimed, 4–6 min, Queen outline-only). Both share the same 10 scenes, so I rendered **one clip per scene** and followed the **scene-prompt** variant where they differ (Queen shown only as a backlit outline; leisurely pacing).

Tool: Grok Imagine (`GenerateVideo` with reference images, 720p, 16:9, 24 fps, AAC audio generated with the clip). Character reference sheets were generated first with `GenerateImage` and passed as references to every clip for consistency.

**Large files are NOT committed** (AGENTS.md). They live on the shared box at `/workspace/videos/guide-for-heroes/`.

## Assets

| File (box: /workspace/videos/guide-for-heroes/) | Scene | Length | Refs |
|---|---|---|---|
| `ref-erdan.jpg` | Erdan reference sheet (front, 3/4, face close-up) | image | – |
| `ref-mernel-kina.jpg` | Mernel + Kina reference sheet | image | – |
| `gfh-s01-home.mp4` | 1 Home | 12 s | Erdan |
| `gfh-s02-darkness.mp4` | 2 Darkness / magic circle | 15 s | Erdan |
| `gfh-s03-summoners.mp4` | 3 The summoners | 15 s | Erdan, Mernel/Kina |
| `gfh-s04-sunlight.mp4` | 4 Sunlight | 15 s | Erdan, Mernel/Kina |
| `gfh-s05-unique-appearance.mp4` | 5 "Unique appearance" | 15 s | Erdan, Mernel/Kina |
| `gfh-s06-the-name.mp4` | 6 The name | 15 s | Erdan, Mernel/Kina |
| `gfh-s07-veiled-queen.mp4` | 7 The veiled Queen, take 1 (**rejected**: Queen's face and red hair visible through the sheer veil) | 15 s | Erdan, Mernel/Kina |
| `gfh-s07-veiled-queen-v2.mp4` | 7 The veiled Queen, take 2 (**used**: opaque curtain, pure shadow silhouette) | 15 s | Erdan, Mernel/Kina |
| `gfh-s08-guidebook.mp4` | 8 The guidebook | 15 s | Erdan, Mernel/Kina |
| `gfh-s09-home.mp4` | 9 Home? | 12 s | Erdan |
| `gfh-s10-core-seal.mp4` | 10 The Core Seal | 12 s | Erdan, Mernel/Kina |
| `gfh-roughcut.mp4` | All 10 scenes concatenated with s07 v2 (ffmpeg, hard cuts) | 2:21 | – |

## Reference image prompts

- **ref-erdan:** "Character reference sheet, stylized-realistic 3D animated film style … Erdan Kernt: a young Black man in his early twenties, dark-toned skin, slim hands, 170 cm, unassuming self-conscious slouched build. Short afro hair with a low taper fade, messy and unbrushed. Rectangular black glasses. Red polo shirt, grey cargo pants, sneakers … front full body, three-quarter, face close-up pushing glasses up. Neutral grey background, no text."
- **ref-mernel-kina:** "… Mernel, elderly court mage, greying hair and grey beard, wrinkled kind face, slightly hunched back, dark blue scholarly robe with hood lowered. Kina, a woman in her late twenties, blonde hair peeking out of a hood, freckles, energetic teasing grin, matching hooded mage robe …"

## Video prompts (exact text sent; <IMAGE_0> = ref-erdan, <IMAGE_1> = ref-mernel-kina)

Every prompt began with "Stylized-realistic 3D animated film, cinematic 16:9, soft global illumination, film grain."

1. **s01 Home (12 s):** Night bedroom lit by the monitor; Erdan slouched at his PC watching a fantasy anime, screen reflected in glasses; slow push-in, faint smile, pushes glasses up; muffled anime audio; hard cut to black and silence.
2. **s02 Darkness (15 s):** Near-black; Erdan blinks, pushes glasses, squints; headache wince; golden glow pulses under his ribs, he clutches his chest, gasps in relief; slow tilt down to a glowing magic circle revealing polished floor, pillars, crystal statues. V.O. "Huh? Where the hell am I?" … "Yes, a magic circle." Low hum, heartbeat thrum.
3. **s03 Summoners (15 s):** Boot scuffs; five hooded robed figures step into the light and surround him; one hugs another — "We did it! The summoning… the summoning was a success!" — and is shoved off; push-in on Erdan: "Summoning?"
4. **s04 Sunlight (15 s):** Kina grabs his hands — "O brave hero! Please, save our world from destruction!"; curtain slides open, sunlight and dust, statues shimmer, freckles/blonde hair revealed; Mernel lowers hood — "Great hero… would you lend us your strength for the sake of the world?"; Erdan: "Huh?"; hold on face; wistful strings.
5. **s05 Unique appearance (15 s):** Mernel blinks in surprise, Kina lets go, Erdan looks at his hands; Mernel: "I was simply surprised by your… unique appearance…" / "I didn't mean it that way!"; Kina smacks his head — "Mernel, watch your words! You're speaking to the hero!"; both bow; Erdan: "I-it's fine, please raise your heads."
6. **s06 The name (15 s):** Tracking shot in a sunlit corridor; nervous man: "Hero, might I ask for your name?"; Erdan: "Uhh… my name? It's A…"; another mage hisses; private grin: "Erdan… Erdan Kernt. That's my name."
7. **s07 Veiled Queen (15 s):** Take 1: throne room, red carpet, kneeling court; red veil with only a backlit seated outline, no face. Take 2 (used) changed this to: "a heavy, OPAQUE deep-red curtain veil … casts only a solid black shadow silhouette of a seated figure … no face, no hair color, no skin, no clothing detail visible at all". Both takes: Erdan kneels clumsily copying Mernel and Kina, peeks up; Queen: "Welcome to the Kingdom of Elysandria, 32nd Hero of Aleria. I am the Queen… Elisabeth Bernt Ravenshield the Third." Erdan's eyes widen.
8. **s08 Guidebook (15 s):** Servant brings a thick red book with gold lettering; Japanese inside; Erdan and Mernel both puzzled; servant swaps books; blank pages, book grows thicker as he flips; snaps shut, shrinks back.
9. **s09 Home? (12 s):** "Will I be able to return home after I finish my mission?" — pause — "…Yes, it is possible." He lowers his eyes; dissolve to a warm, soft-focus family dinner table; V.O. "I just wish I could've told them I wasn't dead in a ditch somewhere."
10. **s10 Core Seal (12 s):** Black-stone circular chamber, blue sigil veins, rune-pulsing Core Seal with handprint; Kina: "It'll sting a little. But you're a strong boy, aren't you?"; Erdan: "Yeah… thanks for the warning."; hand on imprint; beat of silence; light and symbols surge up his arm; white-out.

## Differences from the spec (and why)

- **Clip length cap.** The generator makes at most 15 s per clip, so the 3:15 / 4–6 min film is 10 separate clips (2:21 total). Every scene is covered, but scenes are compressed: the spec's "let every beat breathe" pacing could not fit.
- **Dropped lines to fit 15 s:** s03 "What was I, a fucking zoo animal?"; s04 "I didn't want to do anything… back to my family" V.O.; s05 "Are they surprised that I'm black?" and "Wow, nicely put, old man" V.O.; s07 everything after the Queen's introduction (Lumenari, "Fuck nah!", Doomsday, "Do I get some kind of ability?", Mernel relaying, "Thank you for the save"); s08 the book page text and Queen/Erdan exchange; s09 "What a pain in the ass." These need extra clips or an edit pass with recorded V.O.
- **No subtitles, no title card, no letterbox.** The generator can't render reliable text, so italic V.O. subtitles, the book's first-page text, "Ingleesh" and the **A GUIDE FOR HEROES (WHO'D RATHER NOT BE)** title card must be added in an editor. Output is plain 16:9, not letterboxed to 2.39:1.
- **Audio is the model's own:** voices, SFX and music were generated with each clip. I have not listened to every clip, so line accuracy, V.O. vs. spoken distinction and voice consistency between clips are **unverified**.
- **Visual spot-check (middle frame of each clip):** Erdan stays consistent (red polo, glasses, dark skin, curly hair), though his hair reads as a full curly top rather than a strict low taper fade. Mernel and Kina match their refs. s07 take 1 showed the Queen (red hair, red gown, face) through the veil, which breaks the scene-prompt rule, so I re-rolled it. Take 2 shows only a black silhouette on an opaque curtain (checked at 3 s, 8 s and 13 s). Kina in s10 looks darker-haired than in the ref.
- **Rough cut** is plain hard cuts with no transitions or audio mixing.

## Pass 1 (earlier, kept for reference; not used in the rough cut)
On the box at `/workspace/guide-for-heroes/`: `erdan-ref.jpg`, `mernel-kina-ref.jpg`, `gfh-01-darkness-magic-circle.mp4` (scene 2, 15 s), `gfh-02-sunlight.mp4` (scene 4, 15 s), `gfh-03-core-seal.mp4` (scene 10, 12 s), plus frame grabs `*-f1/f6/f11.jpg`. Its exact prompts are in this file's previous version (commit 659b8c9). These are alternate takes for scenes 2, 4 and 10 if an editor prefers them; pass 1's scene 2 chest glow came out as an ECG-style line.
