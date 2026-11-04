# Goblin Territory Manager: visual assets

All SVGs are self-contained, hand-authored, flat 2D, no text inside icons. Palette follows the game CSS (bg #15171c, panel #1e2129, accent green #7bc96f, blue #5aa1e6, warn #e6b450, bad #e5534b, war #d46be0).

| File | Use in game |
|---|---|
| `char-manager-oh.svg` (300x360) | Advisor/memo portrait, intro card, dialogue box. Bust with clipboard. |
| `char-goblin-gatherer.svg`, `-builder.svg`, `-scout.svg`, `-fighter.svg` (240x300; fighter 256x300) | Role portraits for assign cards, roster, goal cards. Each has an ID lanyard. |
| `icons.svg` | Sprite of 14 `<symbol id="i-NAME" viewBox="0 0 24 24">`: meat, fruit, wood, stone, morale, points, pop, war, intel, build, research, assign, overtime, memo. Inline it once in the page, then `<svg width="20" height="20"><use href="#i-meat"/></svg>`. (External `<use>` from a file only works over http, not file://.) |
| `icons-preview.html` | Quick review page for the sprite at 16/24/48px. |
| `territory-overview.svg` (1200x800) | Clickable-map background. Groups have ids: `zone-valley`, `zone-forest`, `zone-river`, `zone-spider`, `enemy-border`, `paths`, `lord-hut`, `lord-desk`, `node-*`, `war-marker`; each zone also has a `*-area` path usable for hit-testing. Spider Forest is fogged (unexplored); reveal by hiding the fog group content. |
| `first-session-flow.html` | 6-panel storyboard of the guided first session (memo, food goal, reveal wood, construction, war room scout, calm speed + checklist). Uses the SVGs above. |
| `render-previews.js` | `node render-previews.js` writes PNG previews (storyboard and a character/icon contact sheet) to `previews/`, which git ignores to keep large binaries out of the repo. |
| `image-prompts.md` | Prompts for richer AI-generated versions (key art, portraits, icon set, map, splash). |
