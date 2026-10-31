# Guide for Heroes, Chapter 1: Grok video output (2026-10-31)

Source prompts: `prompts/guide-for-heroes-video-prompt.md` (timed, ~3:15) and `prompts/guide-for-heroes-scene-prompt.md` (untimed, 4-6 min). They describe the same 10 scenes; the scene prompt only differs in pacing and in hiding the Queen completely.

## The main limitation
The generator (Grok Imagine via GenerateVideo) makes **one clip of 1-15 s per call**, with audio, at up to 720p when reference images are used. A 3-6 minute film with lip-synced dialogue can't come out of one call. What I did instead:

1. Made **character reference stills** for Erdan and for Mernel + Kina, so the characters look the same in every clip.
2. Rendered **three key-scene clips** with those references: scene 2 (Darkness / magic circle), scene 4 (Sunlight) and scene 10 (Core Seal). Together they cover the opening, the main reveal and the ending.
3. Wrote down the exact prompts below, so the other scenes can be rendered the same way and cut together in an editor.

No video or image binaries are committed (AGENTS.md: no large assets). The files are on Grok's box; the owner can get them from Grok in chat. The tool returned only local file paths, no https URLs.

## Model / settings (all clips)
- Model: Grok Imagine (GenerateVideo), reference-to-video mode
- Resolution 1280x720 (720p), 16:9, 24 fps, H.264 + AAC audio track
- Not native 2.39:1: letterbox it in the edit if needed
- References: `erdan-ref.jpg` (<IMAGE_0>), `mernel-kina-ref.jpg` (<IMAGE_1>)

## Reference images (box paths, not committed; ~240-350 KB each)
| File | What it shows |
|---|---|
| `/workspace/guide-for-heroes/erdan-ref.jpg` | Erdan: red polo, grey cargo pants, black rectangular glasses, short afro, pushing his glasses up, standing on a gold magic circle in the crystal-statue hall |
| `/workspace/guide-for-heroes/mernel-kina-ref.jpg` | Mernel (grey beard, blue robe, hood down) and Kina (freckles, blonde curls, light-blue hooded robe, hands on hips) in a sunlit hall with crystal statues |

Image prompt (Erdan): *"Character reference, stylized-realistic 3D animated feature film style (high-end CG animation, soft global illumination, gentle film grain). Full-body and face of Erdan Kernt: a young Black man in his early twenties with dark-toned skin and slim hands, about 170 cm, unassuming self-conscious slouched posture. Short afro hair with a low taper fade, slightly messy and unbrushed. Rectangular black-framed glasses. Plain red polo shirt and grey cargo pants, dark sneakers. Shy expression, avoiding eye contact, one finger pushing his glasses up his nose. Standing on a softly glowing intricate golden-blue magic circle on a polished dark stone floor in a vast dim fantasy hall with tall pillars and crystal statues in alcoves in the background. Cinematic 16:9 framing, character centered, no text."*

Image prompt (Mernel + Kina): *"Character reference, stylized-realistic 3D animated feature film style (high-end CG animation, soft global illumination, warm sunlight with dust motes, gentle film grain). Two fantasy court mages side by side in a sunlit stone hall with crystal statues. Left: Mernel, an elderly court mage with greying hair and a grey beard, wrinkled kind face, slightly hunched back, wearing a deep blue scholarly robe with the hood lowered, awkward polite smile. Right: Kina, a woman in her late twenties with freckles and blonde hair peeking out from under her raised hood, wearing a similar lighter robe, energetic teasing grin, hands on hips. Cinematic 16:9, both full body, no text."*

## Clips
| # | File (box path) | Scene | Duration | Size |
|---|---|---|---|---|
| 1 | `/workspace/guide-for-heroes/gfh-01-darkness-magic-circle.mp4` | 2. Darkness | 15.04 s | 4.9 MB |
| 2 | `/workspace/guide-for-heroes/gfh-02-sunlight.mp4` | 4. Sunlight | 15.04 s | 8.5 MB |
| 3 | `/workspace/guide-for-heroes/gfh-03-core-seal.mp4` | 10. Core Seal | 12.04 s | 5.4 MB |

### Clip 1: Darkness / magic circle (15 s)
**What it shows:** Erdan in the dark pushes up his glasses and looks scared. A red glow pulses on his chest and he clutches it. The camera pulls back to show him standing on the glowing gold circle in the pillared hall with crystal statues.
**Notes:** Erdan matches his reference. The chest glow came out as an ECG-style heartbeat line instead of a soft glow under the ribs; it reads fine, but re-roll if you want it subtler. Check the voice-over lines by ear.

Prompt:
> Stylized-realistic 3D animated feature film look, soft global illumination, gentle film grain, natural motion blur, light comedic tone. The young man from <IMAGE_0> (Erdan: dark-toned skin, short messy afro with low taper fade, rectangular black glasses, red polo shirt, grey cargo pants) stands in near-total darkness. He blinks, nervously pushes up his glasses with one finger and squints, afraid to move. A warm soft glow pulses beneath his ribs like a second heartbeat; he clutches at his chest in panic, then the glow fades and he exhales in relief. The camera slowly tilts down: he is standing in the center of an intricate softly glowing golden magic circle on a polished dark stone floor, its light gradually revealing tall pillars and crystal statues in alcoves of a vast dark hall. Slow, steady camera, long held shot, his face shows dawning disbelief. Sound: dead silence, a soft heartbeat thrum, then a low hum from the magic circle with big stone-hall reverb. Quiet dry male voice-over: "Huh? Where the hell am I?" ... later: "Yes, a magic circle." No fast cuts, no morphing face, consistent skin tone and hair.

### Clip 2: Sunlight (15 s)
**What it shows:** Hooded Kina grabs Erdan's hands and pleads with him. Sunlight pours in behind them, Mernel steps forward with his hood down, and the shot ends close on a stunned Erdan with Kina holding his hands.
**Notes:** All three characters stay consistent. A third hooded summoner is in the background at the start. The curtain opening is only hinted at by the light pouring in, not shown as a clear action.

Prompt:
> Stylized-realistic 3D animated feature film look, soft global illumination, warm sunlight and dust motes against cool polished stone, gentle film grain. In a dim summoning hall, the hooded young woman from <IMAGE_1> (Kina) suddenly grabs both hands of the shy young man from <IMAGE_0> (Erdan, red polo, glasses, short afro); he flinches. She pleads theatrically: "O brave hero! Please, save our world from destruction!" Behind them a heavy curtain slides open and golden sunlight floods in through drifting dust, making crystal statues shimmer and revealing her freckles and blonde hair under the hood. The elderly grey-bearded mage from <IMAGE_1> (Mernel) lowers his hood and says gently: "Great hero... would you lend us your strength for the sake of the kingdom, no, the world?" Erdan, dumbfounded: "Huh?" Hold on his stunned face. Slow push-in, few cuts, unhurried pacing. Sound: curtain rumble, warm swell of soft strings and woodwinds, stone-hall reverb.

### Clip 3: Core Seal (12 s)
**What it shows:** In the black-stone chamber with blue veins of light, Kina leans on the rune pillar and teases Erdan. He puts his palm on it, and blue-white lightning-like runes race up his arm and flood the frame.
**Notes:** The pillar has fake rune text on it ("RNR"-like letters); this is a known text artifact. The ending is a bright blue-white flare rather than a full whiteout, so add a white fade and the title card **A GUIDE FOR HEROES (WHO'D RATHER NOT BE)** in the edit (the generator can't render reliable title text).

Prompt:
> Stylized-realistic 3D animated feature film look, gentle film grain. A circular testing chamber with black stone walls and faint blue sigils running through the floor like glowing veins. At the center stands the Core Seal: a stone pillar-altar etched with runes that pulse like a heartbeat, with a circular handprint imprint on top. The blonde freckled hooded woman from <IMAGE_1> (Kina) leans in teasing: "It'll sting a little. But you're a strong boy, aren't you?" The shy young man from <IMAGE_0> (Erdan, red polo, glasses, short afro) mutters "Yeah... thanks for the warning," and presses his palm into the imprint. One beat of silence, then bright light and glowing blue-white rune symbols race up his arm into his head, his glasses flare, and the whole frame whites out. Slow push-in, then the surge. Sound: heartbeat rune pulse, rising magical surge.

## Content changes
No explicit or graphic content needed toning down. I kept the profanity in the voice-over lines. I left the f-bombs out of these three clips only because their scenes (3 and 7) weren't rendered.

## Not rendered yet (scenes 1, 3, 5, 6, 7, 8, 9)
To render them, use the same template: a style line + a character tag (<IMAGE_0>/<IMAGE_1>) + one story beat + the dialogue in quotes + sound, at <=15 s each. Two longer scenes (5 "Unique appearance" and 7 "Veiled Queen") need 2-3 clips each so beats aren't stacked. For scene 7, the Queen should be a backlit seated silhouette behind a red veil with no detail (as the scene prompt says). For scene 8, the book page text will need an overlay in the edit.
