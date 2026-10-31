# Free assets and licensing research

Researched 2026-10-28 for GRAFT. Purpose: make it easy to fill `Docs/LICENSES.md` one asset at a time, and to spot obligations (credit lines, engine-only limits, non-commercial clauses) before an asset goes into the build.

This is research, not legal advice. Several vendor terms pages (Fab EULA, Tripo terms, Adobe Mixamo FAQ, the Unreal tech blog) blocked automated fetching, so some points below come from search excerpts, vendor help pages and secondary write-ups. Where that matters, the entry says "unverified" and names what to check by hand. Terms change; re-check the source page on the day you download an asset and record that date in `LICENSES.md`.

## Quick reference

| Source | License of what we download | Credit required? | Engine-locked? | Commercial OK? | Risk |
|---|---|---|---|---|---|
| Fab, free Standard License listings | Fab Standard License | No | No (any engine or tool) | Yes | Low |
| Fab, listings marked "UE-only" / legacy UE Marketplace License | Epic content / legacy license | No | Yes, Unreal-based products only | Yes | Low (we ship in UE) |
| Fab, CC-BY listings | CC BY 4.0 | **Yes** | No | Yes | Low, but credit line needed |
| Megascans claimed on Fab | Fab Standard License | No | No | Yes | Low |
| Megascans claimed long ago on Quixel.com/Bridge | Legacy Epic Content License | No | Yes, Unreal only | Yes | Low |
| Poly Haven | CC0 | No (appreciated) | No | Yes | Very low |
| ambientCG | CC0 1.0 | No (appreciated) | No | Yes | Very low |
| Mixamo | Adobe terms, royalty-free | No | No | Yes | Low; no raw-file redistribution |
| Game Animation Sample Project | Fab listing, "UE-only content" | No | Yes, Unreal-based products only | Yes | Low |
| Meshy, free plan | CC BY 4.0, you own the output | **Yes, credit Meshy** | No | Yes, with credit | Low-medium |
| Tripo, free plan | Public, CC BY 4.0; Tripo terms say Tripo keeps rights in free outputs | **Yes** at minimum | No | **Unclear, conflicting sources** | **High; avoid for shipped assets** |
| Hunyuan3D, self-hosted open weights | Tencent Hunyuan 3D Community License | Notice file only if you redistribute the model | No | Yes, under 1M MAU, **outside EU/UK/South Korea** | Medium; territory clause |
| Hunyuan3D, hosted web app | Tencent web service terms (not found) | Unknown | No | **Unknown** | Medium-high until checked |

Practical rule for GRAFT: prefer CC0 (Poly Haven, ambientCG) and Fab Standard License first. Use Mixamo and the Game Animation Sample for motion. Use Meshy free plan or self-hosted Hunyuan3D for AI meshes. Keep Tripo free-plan outputs out of the shipped build unless the terms are confirmed by hand.

---

## 1. Fab (Epic's marketplace)

Fab replaced the Unreal Engine Marketplace, the Quixel Megascans store, the ArtStation marketplace and the Sketchfab store (launched October 2024).

### License types on Fab
Per Epic's Fab documentation ("Licenses and pricing in Fab"):
- **Standard License.** Can be free or paid. The only license with price tiers.
  - Paid listings have a **Personal** tier (buyer has not earned more than $100,000 USD gross revenue in the last 12 months) and a **Professional** tier (above that). Epic's summary says both tiers grant the **same scope of rights**; the tier is about eligibility and price, not what you can do.
  - Free Standard listings show no tier choice. Forum answers from Epic staff and users agree the revenue threshold does not matter for free items. GRAFT is a zero-budget solo project, so it would fall under Personal anyway.
- **Creative Commons Attribution (CC-BY).** Always free. Requires a credit line (see below).
- **Legacy UE Marketplace License.** Some products moved over from the old UE Marketplace still carry it. Epic is phasing it out and no new products can use it. Content under it was licensed for Unreal Engine-based products.

### What the Standard License allows
From Fab's non-binding license summary (the full Fab EULA at fab.com/eula is the binding text; it blocked automated fetching, so check it by hand):
- Commercial and private use, and modification.
- Use with **any compatible engine or tool**. It is not limited to Unreal Engine.
- No reselling or redistributing the asset itself on a standalone basis (free or paid), and no letting others extract it. Shipping it baked into a game is fine.
- No seat or per-project limit was found for Standard License content. Licenses are tied to the Epic account that claimed them.

### "UE-only content"
Some listings, especially Epic's own samples (City Sample, Game Animation Sample Project), say "UE-Only Content - Licensed for Use Only with Unreal Engine-based Products". For GRAFT this changes nothing, because we ship in UE 5.8. Do not export such assets to other engines or sell/share them outside a UE product. Record "UE-only" in `LICENSES.md` so this is never forgotten.

### Free content cadence
- Epic gives away a rotating set of **limited-time free** listings (CG Channel reported a two-week cadence at launch). Once claimed, the asset stays in your library under the listing's license.
- Many listings are **permanently free** (Standard or CC-BY).

### NoAI tag
Fab lets sellers mark Standard License assets with a **NoAI** tag, meaning the asset "must not be used for generative AI data collection". Gray area worth avoiding: do not feed Fab assets (or renders of them) as input images into Meshy, Tripo or Hunyuan3D. Use our own concept art from `Docs/Concept/` as AI input instead.

### Quixel Megascans now
- Megascans moved into Fab. Free-for-everyone access to the whole library ended on **31 December 2024**. Anything claimed on Fab during that window is yours under the **Fab Standard License** (any engine, commercial OK).
- Since 2025 Megascans are mostly paid on Fab, with some kept free. In January 2025 Epic released a free **Megascans starter set** (1,500+ assets) under the Standard License; its 5 tree packs and 11 scenes were marked Unreal-only.
- In **July 2026** Quixel announced **Megaplants** are on Fab and free under the Fab Standard License.
- Assets claimed long ago on Quixel.com or Bridge under the free UE plan stay under the **legacy Epic Content License (Unreal-only)**. Those entitlements were not moved to Fab and that legacy library gets no updates. Log in to Fab with the same Epic account used for Quixel to see what was carried over.
- Megascans no longer carry their own separate "Quixel license"; on Fab they are just Standard License listings.

### For LICENSES.md
- License: "Fab Standard License" (or "Fab CC BY 4.0", or "UE-only / legacy UE Marketplace License", copy the exact label from the listing page).
- Source URL: the `fab.com/listings/...` URL.
- Record the seller name and date claimed. A screenshot of the listing's license line is cheap insurance.
- Credit: none for Standard; for CC-BY use: "<Asset name> by <seller>, from Fab, licensed under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)". Note any modifications.

---

## 2. Poly Haven (polyhaven.com)

### License
- **All HDRIs, textures and 3D models are CC0** ("effectively public domain"), confirmed on polyhaven.com/license.
- Use for any purpose, commercial included. Redistribution is allowed, including inside sold products. **No credit required** (credit is appreciated; optional Patreon support).
- The site itself (logos, renders, text) is not CC0, and scraping the site needs permission. Use the normal download pages or the official API under its API terms.

### Asset types
- **HDRIs**: unclipped, up to 16K+, in .hdr and .exr.
- **Textures**: PBR sets, typically up to 8K. Maps include diffuse, normal (both GL and DX variants), roughness, AO, displacement, sometimes metal, plus a packed **ARM** map (AO in R, Roughness in G, Metallic in B).
- **Models**: real-world-scale props and plants, available as .blend, glTF, FBX and others, with texture sets.

### Importing into UE5 (5.8)
- **Resolution.** On a 4 GB GTX 1650, download 2K (hero props up to 4K) rather than 8K. Set texture LOD bias or Max Texture Size if bigger files sneak in.
- **Normal map.** Download the **DX (DirectX)** normal. UE uses DirectX-style normals. If only GL is available, tick **Flip Green Channel** on the texture asset. Inverted bumps (dents that should be ridges) mean the wrong one was used.
- **Packed ARM map.** Import with **sRGB off** and compression **Masks (no sRGB)**. In the material wire R to Ambient Occlusion, G to Roughness, B to Metallic. One texture sample replaces three.
- **Color/diffuse:** sRGB on, default compression.
- **Roughness / AO / metal / displacement as separate files:** sRGB off, compression **Masks** or **Grayscale**.
- **Displacement.** Skip for most surfaces at our budget, or use it only on Nanite meshes with Nanite displacement enabled. Parallax occlusion mapping costs GPU time we do not have on Medium.
- **Build one master material** with parameters (tiling, roughness multiplier, normal strength) and make material instances per texture set. This keeps shader compile time and memory down.
- **HDRIs.** Import .hdr/.exr as a **Texture Cube** for a Sky Light (Specified Cubemap) or the HDRI Backdrop actor. 2K-4K is enough for lighting; the sky itself is better from the sky atmosphere or a painted dome.
- **Models.** glTF imports through the Interchange framework in UE 5.x and brings materials along; FBX also works. Check scale (Poly Haven uses meters; UE uses centimeters but the importers convert). Enable Nanite for dense rock and prop meshes.

### For LICENSES.md
- License: CC0 1.0. Credit: none required (optional "from Poly Haven"). Source URL: `https://polyhaven.com/a/<asset_id>`.

---

## 3. ambientCG (ambientcg.com)

### License
- **All assets are CC0 1.0 Universal**, confirmed on docs.ambientcg.com/license. This covers downloaded files and preview renders.
- Commercial use, modification and redistribution are allowed, including raw files inside a video game. **No credit required.** Suggested optional credit: "Created using <asset name> from ambientCG.com, licensed under the Creative Commons CC0 1.0 Universal License."

### Asset types
- PBR materials (the bulk of the library), HDRIs, some 3D models, decals, terrain/height maps, imperfection/grunge maps and Substance (.sbsar) files.
- Materials come in 1K to 8K, in JPG or PNG zips.

### Importing into UE5: gotchas
- **Two normal maps ship in every set:** `_NormalGL` and `_NormalDX`. Use **`_NormalDX`** for Unreal. Using GL gives inverted lighting on bumps.
- **File naming:** maps are suffixed `_Color`, `_Roughness`, `_AmbientOcclusion`, `_Metalness`, `_Displacement`, `_Opacity`. There is no packed ARM map, so either sample separate textures or pack them yourself (a small Python/Pillow or Blender script can produce AO/Rough/Metal packs; we already plan Blender Python tooling).
- **sRGB off** for every non-color map. UE usually guesses from the `_Normal` suffix but not from `_Roughness`; set it by hand or with an import script.
- **PNG vs JPG.** PNG height/displacement maps can be 16-bit, which is what you want for displacement but bigger on disk. JPG is fine for color and roughness.
- Many materials have no AO or metal map. Treat a missing metal map as 0 (non-metal).
- The library mixes scanned and procedurally made materials. Tiling quality varies; check for visible repetition at game camera distance and use macro variation in the master material if needed.

### For LICENSES.md
- License: CC0 1.0. Credit: none required. Source URL: `https://ambientcg.com/view?id=<AssetID>`.

---

## 4. Mixamo (mixamo.com, Adobe)

### License and account
- **Free with an Adobe ID**; no Creative Cloud subscription needed.
- Adobe's FAQ: characters and animations can be used **royalty-free in personal, commercial and non-profit projects, including video games**. No separate license is needed to ship a commercial game.
- The one main restriction: **do not distribute the raw character or animation files** on their own (for example as a downloadable pack or as the product itself). Baked into a game build is fine. Do not include raw Mixamo FBX files in any public source repo or mod kit.
- Adobe's community FAQ also says Mixamo content must not be used to **train machine-learning models**.
- Account limits: not available to Enterprise or Federated Adobe IDs, and not available to users with a China country code. Use a personal Adobe ID.
- The auto-rigger and library are for **bipedal humanoids** only.

### Service status (flag)
- No official shutdown notice was found. A June 2025 outage drew forum replies from support staff calling Mixamo "not supported anymore", and Adobe's own Blender add-on was last built for Blender 3.6. A third-party guide updated September 2026 says it still works. Treat Mixamo as **unmaintained but available**: download what we need early, keep local copies (in a git-ignored folder, since raw redistribution is not allowed), and do not plan around it lasting.

### Retargeting to UE5 (free path, no paid plugins)
Note: the popular "Mixamo Animation Retargeting 2" plugin on Fab is a **paid** listing, so it is out under the project rule.

1. **Download from Mixamo.** Characters: FBX, "With Skin". Animations: FBX, "Without Skin", 30 fps, keyframe reduction off. For locomotion, download both the normal and the **In Place** version.
2. **Root bone problem.** Mixamo skeletons have no root bone; the hips carry the motion. For root motion in UE, add a root bone in Blender first. Free options: a Blender script/add-on that inserts a root bone and transfers the hips' horizontal motion to it (several free GitHub tools exist; record whichever one we use in `DECISIONS.md`), or write our own as part of the Blender Python toolchain. If we only need in-place loops driven by the character's movement component, skip root motion and use the In Place downloads.
3. **Import into UE.** Import the skinned character first to create its skeleton. Import animations against that skeleton. Watch for a 100x scale mismatch (Mixamo armatures sometimes import at 0.01); fix in Blender by applying scale before export, or set the import uniform scale.
4. **IK Rig for the Mixamo skeleton.** Create an IK Rig asset on the Mixamo skeletal mesh. In UE 5.4 and later, use the IK Rig editor's auto setup (auto-create retarget chains and full-body IK). Check the chains: spine, neck, head, each arm, each leg, fingers.
5. **IK Retargeter.** Source = Mixamo IK Rig, target = UE5 Manny/Quinn IK Rig (shipped with the engine and the Game Animation Sample). Adjust the retarget pose so the arms match (Mixamo T-pose versus Manny A-pose is the most common source of bad shoulders). Then use "Export selected animations" or right-click animations > Retarget Animations.
6. **Custom skeleton.** The same method works for our own Zeiph or Tamri skeletons: make an IK Rig for the custom skeleton with matching chain names, then retarget Mixamo or Manny animations onto it.

GRAFT note: Mixamo animations are full-body third-person clips. They suit enemy soldiers and cutscene bodies. First-person arm animations will mostly come from elsewhere or be hand-keyed.

### For LICENSES.md
- License: "Adobe Mixamo terms, royalty-free, no raw redistribution". Credit: none required. Source URL: `https://www.mixamo.com/` plus the character/animation name exactly as shown on Mixamo.

---

## 5. Game Animation Sample Project (GASP, Epic)

### What it is
A free Epic sample project on Fab (first released for UE 5.4, May 2024). It is a separate project from Lyra, not part of it.

### Contents
- **500+ game-ready animations** at launch from Epic's mocap, and the **UE 5.7 update (December 2025) added about 400 more**. All are authored on the UE5 mannequin skeleton (Manny/Quinn) and work on Manny/Quinn via runtime retargeting.
- **Third-person, capsule-driven locomotion powered by Motion Matching** (the Pose Search plugin): walk, run, sprint, starts, stops, pivots, turns in place, jump and fall.
- **Chooser tables** to pick animation databases, plus (5.7) an experimental Pose Search column in Choosers.
- **Traversal** actions (vaulting, hurdling, mantling) using motion warping.
- Animation Blueprints, IK Rigs and IK Retargeters for Manny/Quinn and the UEFN mannequin, and example retargeting setups.
- The 5.7 version adds an experimental **Mover plugin** character setup alongside the standard Character Movement Component.

### License
- The Fab listing says **"UE-Only Content - Licensed for Use Only with Unreal Engine-based Products."** You can migrate its animations, blueprints and rigs into another UE project, including a commercial one, and ship them inside a UE-built game. You cannot export them for use in another engine or redistribute them as a standalone pack.
- Free. No credit required.
- Unverified: the exact Fab license text for this listing could not be fetched. Copy the license line from the listing page into `LICENSES.md` when claiming it.

### Practical notes for GRAFT
- Check Fab for a 5.8 build of the project. If only 5.7 exists, open it in 5.7 and **Migrate** the needed assets, or open a copy in 5.8 and let it upgrade. Do not open it in-place in the GRAFT project.
- It is third-person. GRAFT is first-person, so its main use is **enemy and NPC locomotion** and full-body animations for any cutscene bodies.
- Motion matching costs CPU. On a 4-core Ryzen 3 3200G, profile with several enemies on screen; fall back to a simple blend space for distant or background characters.

### For LICENSES.md
- License: "Fab, UE-only content". Credit: none. Source URL: the Fab listing URL for the Game Animation Sample Project.

---

## 6. AI 3D generators

General note for all three: in the US, purely AI-generated output is likely **not copyrightable** without meaningful human authorship (US Copyright Office report on copyrightability, Part 2, January 2025). This matters less for using the assets and more for protecting them: someone else could reuse an unedited AI mesh. Our Blender cleanup (retopology, splitting, UV work, hand texture edits) adds human work; log what was done per asset.

### 6a. Meshy (meshy.ai)

**Free plan limits (current docs):**
- 100 credits per month, resetting at 00:00 UTC on the first of the month.
- Downloads on the free plan are limited. Meshy's help center describes about 10 free downloads per month, for models made with the "Meshy 6 Lite" model; models made with other models need an upgrade to download. Treat exact numbers as changeable.

**License of free-plan outputs:**
- Meshy's own pricing docs: Free plan output is licensed **CC BY 4.0**, **commercial use allowed with attribution**, and **you own the output**.
- Paid plans (Pro and up): private license, full commercial use, no attribution needed.
- Free users can even sell models, as long as the CC BY 4.0 credit is kept.

**Obligations if we use free-plan Meshy models:**
- Credit Meshy in the game credits, for example: "Some 3D models were generated with Meshy (meshy.ai) and are licensed under CC BY 4.0." Plus a per-asset line in `LICENSES.md`. CC BY 4.0 also asks to note that changes were made.
- Free-plan generations may be public in Meshy's community gallery. Do not use free Meshy for anything that spoils story reveals. (Unverified; check your Meshy account settings.)
- Unverified: whether a model made on the free plan stays CC BY after a later upgrade. Assume the license at generation time sticks.

**For LICENSES.md:** License "CC BY 4.0 (Meshy free plan)". Credit "Generated with Meshy (meshy.ai), CC BY 4.0, modified". Source URL: the Meshy workspace/model link, plus the generation date and the prompt or input image used.

### 6b. Tripo (tripo3d.ai)

**Free plan limits:** about **300 credits per month** (third-party sources), and free-plan models are **public**.

**License of free-plan outputs: conflicting, so treat as not cleared.**
- Tripo's Terms (last updated 11 July 2025, as quoted by third parties) say **Tripo retains all rights in the inputs and outputs of Free Users**, while Paid Users "generally have all rights".
- Free-plan models are published publicly under **CC BY 4.0**.
- Tripo's pricing table (as reported) lists free-plan commercial use as "with attribution" while giving IP to Tripo.
- Tripo's own blog says free-tier models can be used commercially with attribution. Several third-party guides say the free tier gives **no commercial rights**.
- Paid plans: private models, full commercial rights, no attribution, with a license back to Tripo to run the service.

**Recommendation:** Do not ship Tripo free-plan outputs in GRAFT, even in a free release, until someone reads the current Terms at tripo3d.ai/terms and the pricing page by hand and records the exact wording in `DECISIONS.md`. They are fine as blockout or reference meshes that get replaced. The official pages blocked automated fetching during this research.

**For LICENSES.md (if one ever ships):** License "Tripo free plan: CC BY 4.0, public, Tripo retains rights per ToS". Credit "Generated with Tripo (tripo3d.ai), CC BY 4.0". Flag it as "needs review".

### 6c. Hunyuan3D (Tencent)

There are two different routes with different terms.

**Self-hosted open weights (Hunyuan3D 2.0, 2.1, 2mini, Omni, and so on; GitHub / Hugging Face):**
- License: **Tencent Hunyuan 3D 2.0 (or 2.1) Community License Agreement**. It is open-weights, not an OSI open-source license.
- **Outputs:** "Tencent claims no rights in Outputs You generate." No attribution is required in the game for outputs.
- **Commercial use** is allowed (non-exclusive, royalty-free grant) unless your products have **more than 1 million monthly active users**, in which case you must get a separate license from Tencent. Not a concern for GRAFT.
- **Territory: worldwide excluding the European Union, the United Kingdom and South Korea.** Use in those places is unlicensed. **Action: the human must confirm GRAFT's developer is not based in the EU, UK or South Korea before using Hunyuan3D.** It is unclear whether players in those regions downloading a game that contains Hunyuan outputs is affected; the license restricts the licensee's use of the model, and Tencent claims no rights in outputs, but this is a gray area.
- **Acceptable Use Policy** forbids, among other things, military-purpose use and use outside the territory. Making a shooter game is not "military purposes", but note it.
- You may not use the model or its outputs **to improve any other AI model** (other than Hunyuan3D derivatives).
- Notice file and license copy are only required if we **redistribute the model weights**, which we will not.
- Hardware: the models need a lot of VRAM (shape generation is often quoted around 6-16 GB, texture generation more). A 4 GB GTX 1650 is likely not enough for local runs; a free cloud GPU (for example a free Hugging Face Space or Colab tier) would be needed. If a Hugging Face Space is used, the Space host's terms also apply.

**Hosted web app (Hunyuan3D 3.0 / "Hunyuan 3D Engine", 3d.hunyuanglobal.com):**
- Reported free allowance: about **20 generations per day** for individuals (secondary sources).
- The output terms for the hosted service were **not found**. Do not assume the open-weights license applies to the web app. Check its terms of service by hand before shipping its outputs.

**For LICENSES.md:** License "Tencent Hunyuan 3D 2.x Community License (self-hosted); outputs unrestricted by Tencent". Credit: none required (optional "Powered by Tencent Hunyuan"). Source URL: the model repository URL and version. Record where the model ran.

---

## 7. Gray areas and recent changes to flag

1. **Megascans are no longer all free.** The free claim window closed at the end of 2024. Do not assume a Megascans asset is free; check the Fab listing price and license each time. Older Bridge claims are Unreal-only.
2. **Fab "UE-only" and legacy licenses.** Fine for GRAFT. Never export those assets to another engine or a public repo.
3. **Fab NoAI tag and feeding assets to AI.** Do not use Fab assets (or renders of them) as input to AI generators. Use our own concept art as input.
4. **Input images to AI generators.** Only use images we own (our concept art) or CC0 images as inputs to Meshy/Tripo/Hunyuan. A third-party image as input can carry that image's copyright into the result.
5. **Tripo free-plan ownership.** Conflicting sources; treat as not cleared (see 6b).
6. **Hunyuan3D territory clause.** Excludes EU, UK and South Korea (see 6c). The human must confirm location.
7. **Mixamo is unmaintained.** Still free and still royalty-free as far as found, but support statements in 2025 suggest Adobe is not maintaining it. Download early. Never redistribute raw files.
8. **AI output copyright.** Purely AI-generated meshes are likely not protectable by copyright in the US. Record the human edits.
9. **Steam AI disclosure (changed 16 January 2026).** If GRAFT ever goes on Steam, the Content Survey now asks only about AI content players see or hear: pre-generated assets (AI meshes, AI voices) and live in-game generation. Tools used only during development (coding assistants) need no disclosure. Meshy/Tripo/Hunyuan meshes and AI voices that ship **must be disclosed**. `LICENSES.md` should have an "AI-generated: yes/no" column so this is easy to fill out.
10. **Non-commercial and attribution licenses.** The brief already flags the ElevenLabs free tier as non-commercial with attribution (not re-researched here). Anything non-commercial keeps GRAFT from ever being sold without replacing that asset. Mark such rows clearly.
11. **Creative Commons BY 4.0 credit format.** A valid credit names the work (or says "models generated with ..."), the creator or source, links the license, and says if it was changed. A single "Third-party assets" credits screen plus `LICENSES.md` shipped as a text file in the build covers this.

---

## Suggested LICENSES.md columns

| Column | Notes |
|---|---|
| Asset name | As used in the project (UE asset path) |
| Original name | As named at the source |
| Source | Fab / Poly Haven / ambientCG / Mixamo / GASP / Meshy / Tripo / Hunyuan3D / other |
| Source URL | Listing or model page |
| Date obtained | YYYY-MM-DD |
| License | Exact label: CC0 1.0, Fab Standard, Fab UE-only, CC BY 4.0, Adobe Mixamo, Tencent Hunyuan 3D 2.x CLA |
| Credit required | Exact credit line, or "none" |
| Engine-locked | yes (UE-only) / no |
| Commercial OK | yes / no / unclear |
| AI-generated | yes / no (for Steam disclosure) |
| Modified | What we changed (decimation, retopo, UVs, retexture) |
| Flags | NC, needs review, territory, no raw redistribution |

---

## Sources

Fab and Megascans
- Fab, Licenses and pricing in Fab (Epic docs): https://dev.epicgames.com/documentation/fab/licenses-and-pricing-in-fab
- Fab Standard License / EULA (binding text; check by hand): https://www.fab.com/eula
- Quixel to Fab transition FAQs: https://support.fab.com/s/article/Fab-Transition-FAQs?language=en_US
- Epic forums, Quixel to Fab Transition FAQs: https://forums.unrealengine.com/t/quixel-to-fab-transition-faqs/2033839
- Epic forums, Megascans update, March 2025: https://forums.unrealengine.com/t/megascans-update-march-2025/2419561
- Epic forums, Megascans starter content on Fab: https://forums.unrealengine.com/t/megascans-starter-content-on-fab/2255322
- Epic forums, Access legacy Megascans on Bridge and Quixel.com: https://forums.unrealengine.com/t/access-legacy-megascans-on-bridge-and-quixel-com/2142664
- Epic forums, Free assets now Standard License on Fab: https://forums.unrealengine.com/t/all-free-assets-including-ue-ones-are-now-standard-license-on-fab-meaning-no-commercial-use/2080626
- Epic forums, Fab UE-only content licensing: https://forums.unrealengine.com/t/fab-ue-only-content-licensing/2082870
- Quixel, Discover the latest Megascans and free Megaplants: https://quixel.com/news/discover-the-latest-quixel-megascans-and-free-megaplants
- CG Channel, Epic made Megascans free until end of 2024: https://www.cgchannel.com/2024/10/epic-games-has-made-megascans-free-to-all-but-only-until-the-end-of-2024/
- CG Channel, new free assets on Fab every two weeks: https://www.cgchannel.com/2024/11/epic-games-to-share-new-free-assets-on-fab-every-two-weeks
- Unreal Engine EULA (Fab assets are not "Licensed Technology"): https://www.unrealengine.com/eula/unreal

Poly Haven
- Poly Haven license: https://polyhaven.com/license
- Poly Haven home: https://polyhaven.com/

ambientCG
- ambientCG license: https://docs.ambientcg.com/license/
- Normal map conventions (green channel flip): https://www.renderhub.com/3d-toolbox/normal-map-channel-inverter
- Blender normal map node docs: https://docs.blender.org/api/5.1/bpy.types.ShaderNodeNormalMap.html

Mixamo
- Adobe, Mixamo common questions: https://helpx.adobe.com/be_en/creative-cloud/faq/mixamo-faq.html
- Adobe community, Mixamo FAQ: licensing, royalties, ownership, EULA and TOS: https://community.adobe.com/t5/mixamo-discussions/mixamo-faq-licensing-royalties-ownership-eula-and-tos/td-p/13234775
- Adobe community, Mixamo characters for commercial games: https://community.adobe.com/t5/mixamo-discussions/mixamo-characters-for-commercial-games/td-p/11815020
- Adobe community, Mixamo down (June 2025): https://community.adobe.com/t5/mixamo-discussions/mixamo-down/m-p/15377556
- Cinevva, Mixamo to Blender 2026: https://app.cinevva.com/hi/guides/mixamo-to-blender-2026
- Fab, Mixamo Animation Retargeting 2 (paid, excluded): https://www.fab.com/listings/5eaf2746-1891-435a-837c-67c9f7a847f4
- Epic forums, IK retarget issues Mixamo X Bot to Manny: https://forums.unrealengine.com/t/ik-retarget-issues-with-upper-body-mixamo-x-bot-ue5-manny/655488

Game Animation Sample Project
- Unreal Engine blog, Get over 500 free animations: https://www.unrealengine.com/en-US/blog/game-animation-sample
- Unreal Engine tech blog, GASP updated for UE 5.7: https://www.unrealengine.com/en-US/tech-blog/explore-the-updates-to-the-game-animation-sample-project-in-ue-5-7
- Fab listing (short link): https://fab.com/s/46a85e1ef0c5
- 80.lv, 500 free character animations: https://80.lv/articles/unreal-engine-offers-500-character-animations-completely-for-free

Meshy
- Meshy docs, Pricing and credits: https://docs.meshy.ai/en/webapp/pricing
- Meshy pricing page: https://meshy.ai/pricing
- Meshy help, What is included on the free plan: https://intercom.help/meshy/en/articles/15696428-what-is-included-on-the-free-plan
- Meshy help, Can I use Meshy assets commercially: https://intercom.help/meshy/en/articles/16102098-can-i-use-meshy-assets-commercially

Tripo
- Tripo terms (check by hand): https://www.tripo3d.ai/terms
- Tripo pricing and credits: https://www.tripo3d.ai/product-doc/getting-started/pricing-credits
- Tripo help, Can you use Tripo models commercially: https://www.tripo3d.ai/help/privacy-policy/can-i-use-models-commercially
- Tripo help, Commercial use rights: https://www.tripo3d.ai/help/privacy-policy/how-to-use-tripo-models-commercially
- Tripo blog, Commercial use of AI 3D models: https://www.tripo3d.ai/blog/commercial-use-ai-3d-models
- AssetForgeIndex, Tripo commercial use (2026): https://assetforgeindex.com/guides/tripo-commercial-use
- Costbench, Tripo pricing 2026: https://costbench.com/software/ai-3d-generation/tripo-ai/

Hunyuan3D
- Hunyuan3D-2 LICENSE (Hugging Face): https://huggingface.co/tencent/Hunyuan3D-2/blob/main/LICENSE
- Hunyuan 3D 2.1 LICENSE mirror: https://gitserver.onethingai.com/ai-models/Hunyuan3D-2.1/raw/branch/main/LICENSE
- ScanCode LicenseDB, Tencent Hunyuan 3D 2.0 CLA: https://scancode-licensedb.aboutcode.org/tencent-hunyuan-3d-2.0-cla.html
- DeepWiki, Hunyuan3D-2 license and terms: https://deepwiki.com/Tencent/Hunyuan3D-2/9-license-and-terms
- Pandaily, Hunyuan 3D 3.0 with free access: https://pandaily.com/tencent-unveils-hunyuan-3d-3-0-ai-model-tripling-modeling-accuracy-with-free-access
- 3D AI Studio, Best free AI 3D generators 2026: https://www.3daistudio.com/blog/best-free-ai-3d-model-generators-2026

Policy and gray areas
- Gigazine, Steam updates AI disclosure guidelines (Jan 2026): https://gigazine.net/gsc_news/en/20260120-steam-updates-ai-disclosure-guidelines
- Notebookcheck, Steam AI disclosure form: https://www.notebookcheck.net/Steam-updates-AI-disclosure-form-requiring-developers-to-report-visible-and-in-game-AI-but-not-background-tools.1206103.0.html
- Promise Legal, AI game assets in 2026: https://blog.promise.legal/ai-game-assets-copyright-steam-disclosure-2026/
- US Copyright Office, Copyright and AI reports: https://www.copyright.gov/ai/
- Creative Commons BY 4.0: https://creativecommons.org/licenses/by/4.0/
