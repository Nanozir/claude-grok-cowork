# RuleBreakers, Chapter 1: Grok video output (2026-10-31)

Source prompt: `prompts/rulebreakers-video-prompt.md` (v2, ~98 s, 8 shots).

## The main limitation
Grok Imagine (GenerateVideo) makes **one clip of 1-15 s per call**, at up to 720p when reference images are used. The 98 s piece can't come out of one call. What I did instead:

1. Made **character reference stills** (Leon + Smokky; Eris + Jeremy).
2. Rendered **three key-shot clips** with them: shot 1 (Warehouse), shot 3 (Chase) and shot 7 (The Rule).
3. Wrote down the exact prompts below so shots 2, 4, 5, 6 and 8 can be rendered the same way and cut together.

No video or image binaries are committed (AGENTS.md: no large assets). The files are on Grok's box; the tool returned only local paths, no https URLs.

## Model / settings (all clips)
- Model: Grok Imagine (GenerateVideo), reference-to-video mode
- 1280x720 (720p), 16:9, 24 fps (the prompt asks for 30 fps; this mode outputs 24), H.264 + AAC audio
- Not native 2.39:1: letterbox it in the edit
- References: `leon-smokky-ref.jpg` (<IMAGE_0>), `eris-jeremy-ref.jpg` (<IMAGE_1>)

## Reference images (box paths, not committed; ~250-275 KB each)
| File | What it shows |
|---|---|
| `/workspace/rulebreakers/leon-smokky-ref.jpg` | Leon (curly dirty-blond hair, olive jacket, grey tee, jeans, boots, cracked phone, holding a chain leash) and Smokky (white hair, black hoodie, collar with the leash, feral grin) on a foggy dusk street beside a black sedan |
| `/workspace/rulebreakers/eris-jeremy-ref.jpg` | Eris (short black hair, black suit and tie, pistol held low) and Jeremy (combed black hair, black suit, cigarette, big grin) beside a black sedan under a sodium lamp |

Image prompt (Leon + Smokky): *"Character reference, stylized-realistic 3D cinematic CG style, sodium-orange street lamp light against cold blue dusk fog, teal shadows and warm highlights, film grain. Two characters standing in an empty evacuated town street at dusk beside a black sedan. Left: Leon, tall young man with curly dirty-blond hair falling over one side of his face, an old burn scar running down to his chin, permanent frown, olive jacket over a grey t-shirt, jeans, boots, holding a cracked smartphone in one hand and a chain leash in the other. Right: Smokky, pale-skinned young man with messy pale hair, black hoodie, a metal collar with a ring (the leash clipped to it), feral grin. Cinematic 16:9, full body, no text."*

Image prompt (Eris + Jeremy): *"Character reference, stylized-realistic 3D cinematic CG style, sodium-orange street lamp light against cold blue dusk fog, teal shadows, film grain. Two agents in matching black suits, white shirts and black ties standing by a black sedan on an empty foggy town street at dusk. Left: Eris, a young woman with short black hair, composed but tense expression, holding a pistol pointed at the ground. Right: Jeremy, a young man with neatly combed black hair, cheerful clueless smile, a cigarette between his fingers. Cinematic 16:9, full body, no text."*

Note: Leon's burn scar barely shows in the reference or the clips. Add "prominent" to the scar wording if it matters.

## Clips
| # | File (box path) | Shot | Duration | Size |
|---|---|---|---|---|
| 1 | `/workspace/rulebreakers/rb-01-warehouse.mp4` | 1. Warehouse | 15.04 s | 7.7 MB |
| 2 | `/workspace/rulebreakers/rb-02-chase.mp4` | 3. Chase | 13.04 s | 8.8 MB |
| 3 | `/workspace/rulebreakers/rb-03-the-rule.mp4` | 7. The Rule | 12.04 s | 7.1 MB |

### Clip 1: Warehouse (15 s)
**What it shows:** In a dusty warehouse lit by hanging bulbs, Smokky crouches beside a dead Newling with a glowing crimson grid across its head while Leon photographs it. Smokky stands with purple veins sparking at his leg. Leon hands him something, and the body bursts into red dust.
**Notes:** The 45 CREDITS phone readout isn't readable (add it as a UI overlay). The leash click isn't clearly visible. The purple veins came out as a glowing purple burst on the leg.

Prompt:
> Stylized-realistic 3D cinematic look, dusty flickering warehouse lit by a buzzing bulb, teal shadows and warm highlights, film grain, 2.39:1 feel. Slow push-in through the dust. The pale young man in a black hoodie and metal ring collar from <IMAGE_0> (Smokky) crouches beside the defeated body of a dark monstrous creature with a glowing crimson grid scored across its head, grinning feral, a smear of dark red at the corner of his mouth. The tall curly dirty-blond man in the olive jacket from <IMAGE_0> (Leon) pinches the bridge of his nose, then photographs the creature with his cracked smartphone; the phone screen spins and reads 45 CREDITS. Smokky stands, purple veins crawling around a gash on his leg. Leon flicks him a small white pill; Smokky chews it, shudders hard, and the wound seals. Leon clicks a chain leash onto Smokky's collar. The creature's body breaks apart into rising red dust. Smooth dolly, cut on action. Sound: buzzing bulb, phone pling, leash click, dark D-minor drone.

### Clip 2: Chase (13 s)
**What it shows:** The black sedan drives through an empty town under an overpass past a restricted-area barrier. A figure drops onto the roof, the camera moves to the windshield showing all four inside (Eris driving, Jeremy grinning), and Jeremy fires his pistol upward.
**Notes:** Jeremy shoots from the passenger seat at an angle rather than straight up. The knife through the ceiling and the red smear on the rear window are only partly visible. Cast consistency is good.

Prompt:
> Stylized-realistic 3D cinematic action, sodium-orange street lamps against cold blue dusk fog, teal shadows, motion blur, film grain. A black sedan tears through an evacuated town at dusk: shuttered shops, a restricted-area barrier, a metro entrance, camera tracking alongside the car on a smooth spline. Inside, the short-black-haired woman in a black suit from <IMAGE_1> (Eris) grips the wheel; the cheerful black-suited man from <IMAGE_1> (Jeremy) rides shotgun; in the back sit the curly-blond man in an olive jacket and the pale man in a black hoodie and collar from <IMAGE_0>. A hooded figure leaps from a rooftop and lands on the car roof with a heavy thud, denting it; a knife blade punches down through the ceiling inches from Eris. Jeremy fires his pistol straight up through the roof with a deafening bang and a high ringing tone. The figure rolls off the back, leaving a red smear across the rear window. Sound: engine roar, tyres, roof thud, metal screech, gunshot then tinnitus, driving pulse music.

### Clip 3: The Rule (12 s)
**What it shows:** On a foggy lamp-lit street, Flannel Shirt stands with a glowing white grid on his hand while puppets close in. Leon raises a finger to the sky with a hand on his chest, and the grid turns red. Every puppet collapses onto the asphalt as Eris aims her pistol.
**Notes:** The puppets came out as grey, zombie/alien-like humanoids rather than ordinary townspeople with black eyes. Re-roll with "normal-looking civilians in everyday clothes, human skin" if that matters. The hand breaking apart reads as a red glow rather than clean cubes. Flannel's fall happens off-focus.

Prompt:
> Stylized-realistic 3D cinematic, foggy empty street at night under sodium-orange street lamps, teal shadows, film grain. A crowd of eerie townspeople with hollow black eyes and fixed grins twitch forward like puppets. Facing them, a bald man in a red plaid flannel shirt and grey cargo pants with an unnervingly calm smile clutches his right hand, on the back of which a glowing white 3x3 grid is etched. The tall curly dirty-blond man with a burn scar in an olive jacket from <IMAGE_0> (Leon) steps forward, raises one finger to the sky and places his other hand on his chest. A breath of total silence. Snap. The grid on the flannel man's hand flashes blood red and the hand comes apart into neat glowing cube fragments that dissolve into light. Instantly every puppet collapses at once like cut strings. The short-black-haired woman in a black suit from <IMAGE_1> (Eris) fires two shots and the flannel man falls face-down onto the asphalt. Slow push-in on Leon, then cut on action. Sound: glassy shimmer, silence, finger snap, deep bass impact, heartbeat.

## Content toned down (noted per AGENTS/task rules)
- **Shot 1:** "eating a mangled Newling" and "wet chewing" became Smokky *crouched beside the defeated body* with *a smear of dark red at the corner of his mouth*. That keeps the implication without on-screen gore.
- **Shot 7:** "Headshot; throat shot" became "fires two shots and the flannel man falls face-down", with no wound detail.
- **Shot 7:** "the hand falls apart into even pieces" became *neat glowing cube fragments that dissolve into light* (stylized, not dismemberment gore).
- The blood smear on the rear window (shot 3) was kept.

## Not rendered yet
Shot 2 (Outside / Jeremy on the hood), shot 4 (The car dies), shot 5 (Standoff), shot 6 (The Grid / Eris shoots Flannel's eye; tone this to a flash and recoil), and shot 8 (Coda + red-eye Imposter stinger). Use the same template and references, <=15 s each. A Flannel Shirt reference still would help with consistency across shots 5-8.
