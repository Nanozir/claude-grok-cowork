# Image generation prompts

Shared style block (append to every prompt, adjust per tool): `corporate satire meets dark fantasy, stylized 2D digital illustration, clean confident linework, flat cel shading with soft rim light, limited palette of deep charcoal #15171c, goblin green #7bc96f, warning amber #e6b450, accent blue #5aa1e6, war purple #d46be0, danger red #e5534b, readable silhouettes, slightly desaturated, subtle grain`

Shared negative: `photorealistic, 3D render, text, letters, watermark, signature, logo, extra fingers, deformed hands, blurry, low contrast, cluttered background, anime screenshot, copied character, celebrity likeness, nsfw`

Original archetypes only. Do not reference any artist or existing characters by name.

## 1. Manager Oh key art (3:4, 1536x2048)
`Half-body illustration of a worn-out Korean office worker in his early thirties, sharp jaw, messy black hair, deep eye bags, tired but determined stare, white dress shirt with loosened dark navy tie, suit jacket slung over one shoulder, clutching a clipboard, standing at a crude wooden desk in the middle of a muddy goblin camp at dusk, torches and a violet demon-realm sky behind him, goblins peeking from the edges, low-angle heroic framing, strong rim light, [shared style block]` 
Aspect: --ar 3:4. Negative: shared + `smiling, glamorous, muscular hero`.

## 2. Goblin role portraits (1:1, 1024x1024 each, same seed/style reference for consistency)
Common: `cute-but-scrappy green goblin, short, huge pointed ears, tiny fangs, oversized head, wearing a tiny employee ID lanyard, chest-up portrait, plain dark charcoal background, soft rim light`
- Gatherer: `carrying a woven basket overflowing with red and yellow forest fruit, leaf headband, orange tunic, cheerful greedy grin`
- Builder: `yellow hard hat, holding a stone-headed hammer and a rough wooden plank, blue tunic, sawdust, focused squint`
- Scout: `dark green hood and short cloak, brass spyglass raised to one eye, slingshot on belt, grey tunic, cautious sideways glance`
- Fighter: `battered pot helmet, spiked wooden club on shoulder, round plank shield with iron boss, red-brown tunic, brave but nervous scowl`
Negative: shared + `orc, ogre, tall, realistic skin, gore`.

## 3. Icon set (1:1 sheet, 2048x2048, 4x4 grid)
`Game UI icon set on a dark charcoal background, 14 icons in a 4x4 grid with even spacing: meat drumstick, red apple, stacked logs, grey stone, smiling morale face, gold contribution coin with star, group of goblin heads, hourglass with crossed sword, eye, hammer, green chemistry flask, person with plus badge, clock with lightning bolt, paper memo with red seal. Chunky bold outline, flat colors with one highlight, consistent 2px-equivalent stroke, centered, large padding, readable at 24px, [shared style block]`
Negative: shared + `text labels, numbers, gradients everywhere, photoreal, inconsistent style`.

## 4. Territory map (3:2, 1800x1200)
`Stylized top-down isometric-lite fantasy map for a strategy game: a green valley at lower left with fruit trees and a tiny crude hut containing an office desk and lamp, a dark pine Forest Edge to the north with logs and a deer, a winding blue Riverbank to the south east with grey boulders and a fish, a fog-covered purple Spider Forest to the north east with faint webs, dirt paths connecting zones, a red-lit hostile border with banners and spikes along the east edge, empty space around nodes for UI icons, moody dusk lighting, [shared style block]`
Negative: shared + `text, labels, compass, grid lines, characters in foreground, realistic satellite look`.

## 5. Title / splash screen (16:9, 1920x1080)
`Wide title screen illustration: a tired office worker silhouette in a loosened tie sitting behind a tiny desk on a hill, facing a crowd of hundreds of small green goblins holding clipboards, lanterns and hammers, a huge violet moon and a distant red enemy fortress on the horizon, large empty area at upper center for a game logo, cinematic depth, volumetric mist, dark humor mood, [shared style block]`
Aspect: --ar 16:9. Negative: shared + `readable logo text, title text, crowd faces in photoreal detail`.

## Tool notes
- Midjourney: add `--style raw --s 150 --no text, watermark`; use `--sref` of your own approved SVG renders for consistency.
- SDXL/Flux: use the negative as the negative prompt (Flux: fold into positive as "no text"). CFG 5-7 SDXL.
- DALL-E: drop `[shared style block]` placeholders by pasting the style block text; drop weight syntax.
