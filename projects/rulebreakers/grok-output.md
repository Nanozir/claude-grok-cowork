# RuleBreakers, Chapter 1: Grok video output (2026-10-31)

> **Pass 2 (all 8 shots) supersedes pass 1.** Pass 1 (commit 3808155, 18:25 UTC) rendered only shots 1, 3 and 7. Pass 2 renders **all 8 shots**, adds a Flannel Shirt reference, and builds a 1:36 rough cut. Pass 1 is listed at the bottom.

Source: `prompts/rulebreakers-video-prompt.md` (v2, ~98 s, 8 shots).

Tool: Grok Imagine (`GenerateVideo` with reference images, 720p, 16:9, AAC audio generated with the clip). Character reference sheets were generated first with `GenerateImage` and passed as references.

**Large files are NOT committed** (AGENTS.md). They live on the shared box at `/workspace/videos/rulebreakers/`.

## Assets

| File (box: /workspace/videos/rulebreakers/) | Shot | Length | Spec length |
|---|---|---|---|
| `ref-leon-smokky.jpg` | Leon + Smokky reference sheet | image | – |
| `ref-eris-jeremy-flannel.jpg` | Eris + Jeremy + Flannel Shirt reference sheet | image | – |
| `rb-s01-warehouse.mp4` | 1 Warehouse | 15 s | 18 s |
| `rb-s02-outside.mp4` | 2 Outside | 10 s | 8 s |
| `rb-s03-chase.mp4` | 3 Chase | 13 s | 12.6 s |
| `rb-s04-car-dies.mp4` | 4 The car dies, take 1 (**rejected**: Smokky and Jeremy end up sprawled on the *outside* of the hood) | 8 s | 6.9 s |
| `rb-s04-car-dies-v2.mp4` | 4 The car dies, take 2 (**used**: interior camera, everyone stays in the car) | 8 s | 6.9 s |
| `rb-s05-standoff.mp4` | 5 Standoff | 15 s | 14.5 s |
| `rb-s06-the-grid.mp4` | 6 The Grid | 10 s | 10 s |
| `rb-s07-the-rule.mp4` | 7 The Rule | 10 s | 9 s |
| `rb-s08-coda.mp4` | 8 Coda | 15 s | 19 s |
| `rb-roughcut.mp4` | All 8 shots concatenated with s04 v2 (ffmpeg, hard cuts) | 1:36 | ~98 s |

## Reference image prompts

- **ref-leon-smokky:** "Leon, tall young man, curly dirty-blond hair falling over one side of his face, old burn scar running down to his chin, permanent frown, olive jacket over grey t-shirt, jeans, boots, holding a cracked smartphone. Smokky, pale skin, messy pale whitish hair, black hoodie, metal collar with a ring at his throat, feral grin …"
- **ref-eris-jeremy-flannel:** "Eris, short black hair, black suit, white shirt, black tie, composed but tense. Jeremy, neatly combed black hair, same black suit and tie, cigarette, cheerful clueless smile. Flannel Shirt, shaved head, red plaid flannel shirt, dirty grey cargo pants, hands in pockets, eerily natural smile …"

## Video prompts (exact intent; <IMAGE_n> = the refs passed for that clip)

Every prompt began with "Stylized-realistic 3D cinematic, 16:9, teal shadows/warm highlights or dusk fog + sodium-orange lamps, film grain."

1. **s01 Warehouse:** Push-in through a dusty, flickering warehouse; Smokky crouched over a mangled creature with a crimson grid of gashes on its head, blood round his grin; Leon frowns, pinches his nose, photographs it with the cracked phone; Smokky stands, purple veins around a leg gash; Leon flicks a white pill, Smokky chews, spasms, wound closes; leash clicks; corpse breaks into rising red dust.
2. **s02 Outside:** Jeremy on the sedan hood tapping the windshield, "forty-two times two…"; Eris yells through the glass; Leon tosses Jeremy the phone; Jeremy sniffs, recoils, "A hell of a ton of them."; everyone scrambles in.
3. **s03 Chase:** Sedan through an evacuated town (shuttered shops, restricted-area barrier, metro entrance), tracking shot; a ghoul lands on the roof; knife punches through the ceiling near Eris; Jeremy fires up through the roof, tinnitus; body rolls off smearing blood on the rear window.
4. **s04 Car dies:** Take 2 (used) added "Camera INSIDE a black sedan, everyone stays inside the car the whole time, seatbelts on" and staged Smokky lurching from the back seat. Both takes: brakes slam on their own, skid past a lamppost, Smokky thrown into the radio; lights die like a switched-off TV; Jeremy out cold with a bloody nose; Leon slips out behind a dumpster; airbag pops in Eris's face.
5. **s05 Standoff:** Through the windshield, hollow-eyed grinning puppets plus Flannel Shirt at the front; he points back and forth, all four doors fly open; Eris steps out aiming, legs shaking; "Who the hell are you?" — "No." — "English is a difficult language. Tell your friend to stop sneaking around."
6. **s06 The Grid:** Leon lunges, Flannel catches his wrist without looking; Leon grips back, a glowing white 3×3 grid etches onto Flannel's hand; Flannel shoves him off and scrubs it; Eris shoots; he screams, sweeps his arm forward, the puppets surge.
7. **s07 The Rule:** Leon steps forward, one finger to the sky, other hand on chest; silence; snap; grid turns red and the hand falls apart into even cubes; every puppet drops like cut strings; Eris fires two shots and Flannel falls face-down.
8. **s08 Coda:** Eris checks Leon, slaps the back of his head, "Don't ever do that again, you idiot."; crushes a white pill into Flannel's mouth; crane up over the foggy street; stinger: Flannel's remaining eye snaps open, glowing red.

## Differences from the spec (and why)

- **Clips, not one film:** max 15 s per generation, so 8 clips concatenated into a 1:36 rough cut, very close to the spec's ~98 s.
- **Frame rate:** the generator outputs 24 fps, not the spec's 30 fps.
- **Softened gore in prompts:** I described the warehouse kill and the shootout less graphically (no "wet chewing", "headshot", or "throat shot"; s06 says "fires… he reels" instead of "shoots him in the eye", and s07 uses "two shots" instead of headshot/throat shot) to avoid refusals. No generation was actually refused.
- **Cut from prompts to fit clip length:** s01 "Wanna have e'bite?", Leon counting injuries on his fingers, the phone spinning to **45 CREDITS**; s06 the bullet *plinking* on the asphalt; Jeremy's foam at the mouth.
- **No title card, no letterbox:** **RULEBREAKERS** and the 45 CREDITS screen need an editor; output is plain 16:9.
- **Audio is the model's own** and is **unverified** (lines, gunshot tinnitus, D-minor drone).
- **Visual spot-check (middle frame of each clip):** Leon, Smokky, Eris, Jeremy and Flannel match their refs well. Leon's burn scar is faint on the ref and probably in the clips. s04 take 1 had Smokky and Jeremy lying across the outside of the hood, so I re-rolled it. Take 2 stays inside the car, but Eris seems to drop out of frame mid-clip (driver seat looks empty at ~4 s), and the airbag/Leon-exit beats need a proper watch. In s08 the kneeling figure is in a black suit with short dark hair (reads as Eris); Jeremy and Smokky stand in the background.

## Pass 1 (earlier, kept for reference; not used in the rough cut)
On the box at `/workspace/rulebreakers/`: `leon-smokky-ref.jpg`, `eris-jeremy-ref.jpg`, `rb-01-warehouse.mp4` (shot 1, 15 s), `rb-02-chase.mp4` (shot 3, 13 s), `rb-03-the-rule.mp4` (shot 7, 12 s; puppets came out zombie-like), plus frame grabs. Its exact prompts are in this file's previous version (commit 3808155).
