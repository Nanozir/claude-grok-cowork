# Performance and scalability research (UE 5.8.4, GTX 1650 / Ryzen 3 3200G)

Research date: 2026-10-28. Target: Medium preset, 30 fps at 1080p with TSR, on a GTX 1650 (4 GB), Ryzen 3 3200G (4 cores, 4 threads), 16 GB RAM.

## How to read this doc

Each claim carries one of three tags:

- **[5.8 local]**: checked directly against the installed engine at `D:\Epic Games\UE_5.8` (`Engine/Config/BaseScalability.ini`, `Engine/Config/BaseEngine.ini`, or engine source). This is the strongest evidence. The file and line are given where it matters.
- **[5.8 web]**: from a 5.8-era web source (Epic's 5.8 docs or 5.8 release coverage).
- **[older UE5]**: from 5.0 to 5.7 docs or forum posts and not re-checked for 5.8. Test before you rely on it.

Any number here that says "ms" or "fps" is an estimate. Nothing in this doc was measured on the dev PC. Profile before you ship a setting (Section 8).

---

## 0. Findings that change BUILD-PLAN assumptions (read this first)

1. **Stock "Medium" GI in 5.8 is no longer screen-probe Lumen. It is Lumen Lite.** [5.8 local] `[GlobalIlluminationQuality@1]` sets `r.Lumen.FinalGatherMethod=0` (Irradiance Field Gather, "Lumen Lite"). Engine help text for that cvar says it is "Targeted at mid range PC and Switch 2". Epic's 5.8 Lumen performance guide says Medium targets "60 fps on Switch 2 and medium-spec PCs" and that each level costs about half the level above it. [5.8 web]
   - **Consequence:** BUILD-PLAN's Medium cvar `r.Lumen.ScreenProbeGather.ScreenTraces 1` belongs to the Screen Probe Gather path (`FinalGatherMethod=1`). Under stock 5.8 Medium it probably does nothing. Either (a) accept Lumen Lite as Medium GI (recommended; it is Epic's purpose-built tier for this hardware class), or (b) force `r.Lumen.FinalGatherMethod=1` on Medium, which is the old, roughly 2x more expensive path. The lead should log the choice in `Docs/DECISIONS.md`.
   - Lumen Lite is still labelled **Beta** in 5.8 per release coverage. [5.8 web]
2. **Stock Medium reflections already turn Lumen Reflections off.** [5.8 local] `[ReflectionQuality@1]` sets `r.Lumen.Reflections.Allow=0` and `r.SSR.Quality=2`. BUILD-PLAN's `r.Lumen.Reflections.Allow 0` matches the stock setting, so you do not need to override it.
3. **Stock Medium shadows already use one CSM cascade at 1024.** [5.8 local] `[ShadowQuality@1]` sets `r.Shadow.CSM.MaxCascades=1`, `r.Shadow.MaxCSMResolution=1024`, `r.Shadow.DistanceScale=0.7`, and `r.Shadow.Virtual.MaxPhysicalPages=512`. **No scalability level sets `r.Shadow.Virtual.Enable`.** That is a project or renderer setting, so BUILD-PLAN's "CSM on Medium/Low, VSM on High/Epic" must be added to our own `DefaultScalability.ini` (Section 5).
4. **Stock Low GI turns off DFAO too.** [5.8 local] `[GlobalIlluminationQuality@0]` sets `r.DistanceFieldAO=0` and `r.Lumen.DiffuseIndirect.Allow=0`. BUILD-PLAN wants "no Lumen + DFAO" on Low, so Low needs `r.DistanceFieldAO=1` and `r.AOQuality=1` added in our override. Stock Medium (Lumen Lite) keeps DFAO on.
5. **Stock Medium texture pool is 600 MB, not 1000.** [5.8 local] `[TextureQuality@1]` sets `r.Streaming.PoolSize=600` and `r.Streaming.LimitPoolSizeToVRAM=1`. BUILD-PLAN pins `r.Streaming.PoolSize 1000` in-game. On a 4 GB card, 1000 MB of texture pool plus the 512 MB Nanite streaming pool (Section 4), Lumen surface cache, TSR history and render targets is tight. Section 2.3 has a VRAM budget. Measure with `stat streaming` and `rhi.DumpMemory` before keeping 1000.
6. **`UE-ZenSubprocessDataPath` is an internal variable. Do not set it.** [5.8 local] The engine sets it itself so that child processes inherit the parent's Zen path. With `UE-LocalDataCachePath=D:\Claude\UE_DDC` set, Zen data should already go to `D:\Claude\UE_DDC\Zen`. If you want an explicit user-facing override, the variable is `UE-ZenDataPath`. Section 6 has the full resolution order from source.
7. **On a 4-core box, shader compiling defaults to one ShaderCompileWorker.** [5.8 local] `NumUnusedShaderCompilingThreads=3` applies below 12 cores, which leaves 4 - 3 = 1 worker. Section 7 has the override.

---

## 1. TSR (Temporal Super Resolution)

### 1.1 What stock Medium gives you [5.8 local]

`BaseScalability.ini`, `[AntiAliasingQuality@1]`:

```ini
r.TSR.History.R11G11B10=1
r.TSR.History.ScreenPercentage=100
r.TSR.History.UpdateQuality=1
r.TSR.ShadingRejection.Flickering=0
r.TSR.RejectionAntiAliasingQuality=1
r.TSR.ReprojectionField=0
r.TSR.Resurrection=1
```

High (`@2`) turns on `r.TSR.ShadingRejection.Flickering=1` and `r.TSR.ReprojectionField=1`. Epic (`@3`) raises `r.TSR.History.ScreenPercentage` to 200, which is expensive, and `UpdateQuality` to 3.

Resolution presets in `[ResolutionQuality]`: Performance 50, Balanced 58.328, Quality 66.662, Native 100. BUILD-PLAN's `r.ScreenPercentage 67` is the "Quality" preset, which renders 1280x720 internally at 1080p output. [5.8 local]

### 1.2 Cvar reference (defaults from `TemporalSuperResolution.cpp`) [5.8 local]

| Cvar | Code default | Notes for us |
|---|---|---|
| `r.TSR.History.ScreenPercentage` | 100 | Keep 100 on Medium. 200 is an Epic-tier cost. |
| `r.TSR.History.SampleCount` | 16 | Higher means more stability and more ghosting on VFX. The minimum is 8. Lower it toward 8 to cut ghosting on muzzle flash, sparks and Zeiph energy effects. |
| `r.TSR.History.UpdateQuality` | 3 (scalability sets 1 on Medium) | Shader permutation choice. Leave it to scalability. |
| `r.TSR.History.R11G11B10` | 1 | Saves bandwidth. Keep it at 1. |
| `r.TSR.ShadingRejection.Flickering` | 1 (Medium sets 0) | Anti-flicker heuristic. Its period auto-adjusts below `...Flickering.FrameRateCap` (60). Consider turning it on (1) if thin geometry such as grates, wires and railings shimmers at 720p internal. It costs a little GPU time. |
| `r.TSR.ShadingRejection.SampleCount` | 2.0 | Samples kept after a full shading rejection. Lower gives a sharper, less stable image. |
| `r.TSR.ShadingRejection.Mode` | 1 | 0 = more responsive, less ghosting, more blocky artifacts. |
| `r.TSR.RejectionAntiAliasingQuality` | 3 (Medium sets 1) | Spatial AA used when history is rejected. It matters more at a low internal resolution. Try 2 if disocclusions look jaggy. |
| `r.TSR.Resurrection` | 0 (Medium sets 1) | Brings back details from many frames ago. Adds history memory (`...PersistentFrameCount`, default 2). Set it to 0 on Low to save VRAM. |
| `r.TSR.ReprojectionField` | 0 (High+ sets 1) | Better reprojection on fast edges. Leave it off on Medium. |
| `r.TSR.ThinGeometryDetection` | 0 | An extra pass for sub-pixel geometry such as foliage, wires and fences. Test it on the rooftop and fence scenes if they shimmer. |
| `r.TSR.Velocity.WeightClampingSampleCount` | 4.0 | Higher gives more stability in motion and more blur. |
| `r.TSR.AsyncCompute` | 2 | Leave as is. |
| `r.TSR.Visualize` | -1 | Debug view. Use it before you tune anything (see 1.3). |

### 1.3 Ghosting at low internal resolution: practical fixes

Order of attack:

1. **Diagnose first.** Run `r.TSR.Visualize` and check whether TSR is accepting history in the ghosting area. A 5.x forum thread on volumetric-cloud ghosting found that `r.TSR.ShadingRejection.SampleCount` and `r.TSR.History.ScreenPercentage` made no difference because TSR was rejecting nothing there. [older UE5]
2. **Missing motion vectors are the most common cause in an FPS.** Viewmodel arms and weapon, skinned enemies, WPO materials and translucent VFX all need velocity:
   - Opaque materials with World Position Offset need "Output velocity" or project setting `r.Velocity.EnableVertexDeformation` (verify the name in Project Settings > Rendering; [older UE5]).
   - Translucent VFX (muzzle flashes, tracers): turn on "Output Velocity" on the translucent material, or render it after TSR ("After DOF" / separate translucency). In 5.8, `r.Translucency.EarlyVelocityPass` defaults to 2. [5.8 web]
   - In 5.8, Niagara sprite VFX that ghost should either write velocity or use responsive AA.
3. **Responsive AA** on the material (Translucency > Responsive AA) stops TSR from keeping history on that pixel. Use it on small bright VFX and HUD-in-world elements.
4. **Lower `r.TSR.History.SampleCount`** toward 8 for a less sticky history on fast-moving bright effects. This trades stability on static highlights.
5. **Lumen-related ghosting** (temporal lag in GI on moving lights such as the player's flashlight or muzzle light) is not a TSR issue. It is Lumen's own temporal accumulation. Lumen Lite's irradiance-field path has no temporal filter for ShortRangeAO, per the comment in `BaseScalability.ini` line 347. [5.8 local]
6. **Camera cuts:** call `PlayerCameraManager` camera cut or `SetGameCameraCutThisFrame()` on cinematic cuts and teleports so TSR drops history. 5.8 fixed a TSR memory spike on camera cuts. [5.8 web]

### 1.4 Dynamic resolution (new on PC in 5.8)

5.8 release coverage says dynamic resolution is now supported on PC with DX12 and Vulkan. [5.8 web] Dynamic resolution is a better fit for a hard 30 fps target than a fixed 67% screen percentage, because heavy combat beats can drop to roughly 58% and calm corridors can rise toward 75%. The cvar names below are [older UE5] and not checked in 5.8 source:

```ini
r.DynamicRes.OperationMode=2          ; 2 = always on
r.DynamicRes.FrameTimeBudget=33.3     ; ms, for 30 fps
r.DynamicRes.MinScreenPercentage=50
r.DynamicRes.MaxScreenPercentage=75
```

Recommendation: ship the M1 slice with a fixed 67%, and test dynamic resolution as a later polish item.

---

## 2. Software Lumen, Lumen Lite, or no Lumen on a 4 GB card

### 2.1 The three real options in 5.8

| Tier | GI | Cost (Epic's rule) | Memory |
|---|---|---|---|
| High (`sg.GlobalIlluminationQuality=2`) | Screen Probe Gather, 32x downsample, surface cache atlas 3584 | 1x | Surface cache 3584² atlas |
| **Medium (`=1`) = Lumen Lite** | Irradiance Field Gather + DFAO; `r.Lumen.TraceMeshSDFs.Allow=0` (global SDF only) | about 0.5x High | Surface cache atlas **2048** (`r.LumenScene.SurfaceCache.AtlasSize=2048`, `CardMaxResolution=256`) |
| Low (`=0`) | No Lumen, unshadowed skylight, `r.SkylightIntensityMultiplier=0.8` (docs suggest 0.7 to match Medium) | about 0.25x | None |

All values are from `BaseScalability.ini` lines 318 to 414. [5.8 local] The cost ratios come from the 5.8 Lumen performance guide. [5.8 web]

**Recommendation:** use stock Lumen Lite for Medium. It was built for exactly this tier, and its memory settings are already trimmed (the 2048 atlas carries the comment "Reduce memory for Lumen Surface Cache"). Keep Low as "no Lumen + DFAO" per BUILD-PLAN, with the DFAO re-enable noted in Section 0.

### 2.2 Cvars to squeeze Lumen Lite further (if Medium misses 30 fps)

Irradiance Field Gather cvars and their code defaults, from `LumenIrradianceFieldGather.cpp`: [5.8 local]

```ini
r.Lumen.IrradianceFieldGather.NumClipmaps=4                 ; fewer = less distant GI. Try 3 for interiors.
r.Lumen.IrradianceFieldGather.ClipmapWorldExtent=5000       ; first clipmap extent (cm)
r.Lumen.IrradianceFieldGather.GridResolution=64             ; probe grid per clipmap. 48 or 32 cuts probe count.
r.Lumen.IrradianceFieldGather.ProbeResolution=16            ; rays per probe = this squared. 12 cuts trace cost by about 44%.
r.Lumen.IrradianceFieldGather.NumProbesToTraceBudget=100    ; probe updates per frame. Lower = cheaper, more lag.
r.Lumen.IrradianceFieldGather.InterpolateDownsampleFactor=2 ; interpolation/shading downsample
r.Lumen.IrradianceFieldGather.ProbeAtlasResolutionInProbes=128 ; memory of the probe atlas. Overflow renders wrong.
r.Lumen.IrradianceFieldGather.RadianceCache.Stats=1         ; GPU print of update stats (debug)
```

Shared Lumen scene cvars (Medium values already shown): `r.LumenScene.DirectLighting.UpdateFactor=128`, `r.LumenScene.Radiosity.UpdateFactor=128`, `r.LumenScene.DirectLighting.MaxLightsPerTile=4`. Raising the update factors further spreads surface-cache lighting updates over more frames, which is cheaper but makes lighting changes lag. [5.8 local]

Other levers:

- `r.Lumen.AsyncCompute 0` to profile Lumen in isolation. [5.8 web] Async compute gains on Turing (GTX 16xx) are modest and are not verified for this card.
- In 5.8, `r.Lumen.HeightFog` defaults to 1 and `r.Lumen.HeightFogOnGI` defaults to 0. Leave both. [5.8 web]
- 5.8 lowered `r.LumenScene.SurfaceCache.CardMinResolution` from 4 to 2 on Epic/High, which adds detail and memory. Medium was already at 2. [5.8 web, 5.8 local]
- Mesh-level: keep Lumen-relevant meshes simple. Set "Affect Distance Field Lighting" off on small props, since DFAO and the global SDF cost memory too.

### 2.3 VRAM budget on a 4 GB GTX 1650 (estimate, not measured)

Windows plus the desktop compositor typically keep about 300 to 500 MB. A working budget for the game is about **3.3 GB**.

| Item | Rough size | Source of the number |
|---|---|---|
| Texture streaming pool | 600 MB (stock Medium) / 1000 MB (BUILD-PLAN) | cvar value |
| Nanite streaming pool | 512 MB default plus root pages | `r.Nanite.Streaming.StreamingPoolSize` default [5.8 local] |
| Lumen surface cache (2048² atlas, several layers) | on the order of 100 MB | estimate |
| Global distance field and mesh SDFs (Lumen Lite + DFAO) | 100 to 300 MB, scene-dependent | estimate |
| GBuffer, TSR history and post targets at 720p internal / 1080p output | 200 to 350 MB | estimate |
| CSM (1 cascade, 1024) | under 10 MB | estimate |
| Meshes, skeletal, Niagara, PSOs, misc | 300 to 600 MB | estimate |

**Conclusion:** 1000 MB texture pool + 512 MB Nanite pool + the rest is right at the edge of 4 GB. Recommend `r.Streaming.PoolSize=700` to `800` and `r.Nanite.Streaming.StreamingPoolSize=256` on Medium (Section 4). Confirm with:

```
stat streaming          ; pool usage, "over budget" warnings
stat rhi                ; total GPU memory
rhi.DumpMemory          ; per-category breakdown
memreport -full         ; offline report in Saved/Profiling/MemReports
```

The "texture streaming pool over budget" or "video memory exhausted" errors that 4 GB users report on UE5 are the symptom to watch for. [older UE5]

5.8 adds `D3D12.ResourcesStartResident` (default off), which keeps unreferenced resources out of VRAM. [5.8 web] Leave it at the default.

---

## 3. Cascaded shadow maps on low-end GPUs

### 3.1 Stock values [5.8 local]

| Cvar | Low (@0) | Medium (@1) | High (@2) |
|---|---|---|---|
| `r.ShadowQuality` | 0 | 3 | 5 |
| `r.Shadow.CSM.MaxCascades` | 1 | 1 | 4 |
| `r.Shadow.MaxCSMResolution` | 512 | 1024 | 2048 |
| `r.Shadow.MaxResolution` (local lights) | 512 | 1024 | 1024 |
| `r.Shadow.DistanceScale` | 0.6 | 0.7 | 0.85 |
| `r.Shadow.CSM.TransitionScale` | 0 | 0.25 | 0.8 |
| `r.Shadow.RadiusThreshold` | 0.06 | 0.05 | 0.04 |
| `r.DistanceFieldShadowing` | 0 | 0 | 1 |
| `r.VolumetricFog` | 0 | 0 | 1 |
| `r.CapsuleShadows` | 0 | 1 | 1 |
| `r.LightMaxDrawDistanceScale` | 0.5 | 0.5 | 1 |

### 3.2 Recommendations for an FPS with one cascade

- A single 1024 cascade over the full dynamic shadow distance looks soft and blocky up close in first person. **The usual FPS fix is 2 cascades with a short distance**, not 1 cascade with a long one. Set it on the directional light (Dynamic Shadow Distance MovableLight about 3000 to 5000 cm, Num Dynamic Shadow Cascades 2, Cascade Distribution Exponent about 3), and on Medium override `r.Shadow.CSM.MaxCascades=2`. Cost: one extra depth pass over nearby geometry, usually cheap at 1024. This is an inference from standard CSM practice and has not been measured on the 1650.
- **Far shadows:** for outdoor Tamra vistas, use Far Shadow cascades only on hero landmarks, or use distance field shadows on High+ only (stock already does this).
- **CSM caching:** `r.Shadow.CSMCaching` defaults to **0** in 5.8 code, even though its help text says "1: ... (default)". [5.8 local] Turning it on (`r.Shadow.CSMCaching=1`) caches static-geometry CSM depth and is worth testing on Medium. Budget the cache with `r.Shadow.WholeSceneShadowCacheMb` (ECVF_Scalability). [5.8 local, behavior older UE5]
- **Local light shadows** are the real cost in interiors. Cap shadow-casting point and spot lights per view. Mark most fill lights "Cast Shadows" off. With `r.LightMaxDrawDistanceScale=0.5` on Medium, set sensible Max Draw Distance on each light.
- `r.Shadow.CSMDepthBias` defaults to 10. [5.8 local] Raise it per light (Shadow Bias) rather than globally if you see acne at 1024.
- **Contact shadows** (per-light "Contact Shadow Length", for example 0.02) are a cheap screen-space way to restore small-object grounding that the coarse cascade loses. [older UE5]

### 3.3 Switching VSM ↔ CSM per tier

`r.Shadow.Virtual.Enable` has a code default of 0 and an on-change delegate, so it can change at runtime. [5.8 local] The project's renderer setting "Shadow Map Method = Virtual Shadow Maps" writes it as 1 in `DefaultEngine.ini`. Put `r.Shadow.Virtual.Enable=0` in our `[ShadowQuality@0]` and `[ShadowQuality@1]` overrides, and `=1` in `@2`/`@3`. **Verify in-game** that changing scalability at runtime switches cleanly and does not hitch on first switch due to PSO and shader warm-up.

---

## 4. Nanite on a 4 GB card (environment kit pieces only)

### 4.1 Fixed costs you pay once Nanite is on at all

- **GPU time:** Nanite has a per-frame base cost (instance and cluster culling, visibility buffer raster, material classification and resolve) that exists even with few Nanite meshes. On low-end GPUs this base cost can exceed the cost of drawing a modest kit with classic LODs. No published GTX 1650 benchmark was found. **Measure it yourself:** capture `stat gpu` with `r.Nanite 1` and `r.Nanite 0` in the same view.
- `r.Nanite` (default 1) can be toggled at runtime. It recreates render state, and Nanite meshes then draw their **fallback mesh**. [5.8 local, `StaticMeshSceneProxy.cpp:110`] So a Low-tier "Nanite off" path is possible without duplicate assets, as long as fallback meshes are decent. Set "Fallback Relative Error" / "Fallback Target" on kit meshes so fallbacks aren't 2-triangle blobs.
- **Hardware:** a forum claim says Nanite needs mesh shaders and that the 16-series (Turing) is the first with support. [older UE5, user claim] Nanite in practice needs DX12 SM6 and uses compute raster for small triangles. The GTX 1650 (Turing TU117) supports DX12 SM6.x, so Nanite runs. Stay on **DX12**, because DX11 disables Nanite.

### 4.2 Memory overhead cvars [5.8 local, code defaults]

| Cvar | Default | Recommendation (Medium, 4 GB) |
|---|---|---|
| `r.Nanite.Streaming.StreamingPoolSize` | **512** MB (excludes root pages). Help text warns not to set it near the GPU resource limit. | **256** on Medium/Low. Raise only if `stat nanitestreaming` (verify name) shows constant thrash. |
| `r.Nanite.Streaming.NumInitialRootPages` | 2048 (read-only, grows dynamically) | Leave |
| `r.Nanite.Streaming.DynamicallyGrowAllocations` | 1 (read-only) | Leave |
| `r.Nanite.MaxCandidateClusters` | 16M (16 * 1048576) | Buffers are sized from these. Lowering them saves VRAM for a small kit: try 4M / 1M / 512K, and watch for culled-geometry holes and log warnings. |
| `r.Nanite.MaxVisibleClusters` | 4M | see above |
| `r.Nanite.MaxNodes` | 2M | see above |
| `r.Nanite.MaxPixelsPerEdge` | 1.0 | **The main GPU-cost knob.** 2.0 on Medium, 4.0 on Low, for fewer triangles with little visible loss at 720p internal. |

Lowering the Max* cluster budgets is an inference from what the buffers size, not an Epic recommendation. Test it in the biggest M1 room.

### 4.3 Asset-side rules that matter more than cvars

- Nanite + **masked or WPO materials** take the programmable raster path, which is much slower. Kit pieces must be opaque with no WPO. (This also enforces BUILD-PLAN's "no foliage".)
- Pixel Programmable Distance and WPO disable distance exist on foliage and skinned meshes in 5.8. They don't apply to us under BUILD-PLAN, but note them if foliage policy changes. [5.8 web]
- Nanite plus VSM is the pairing Nanite was built for. Nanite plus CSM works but loses the VSM culling advantage. That is fine for our kit.
- Disk and memory: Nanite meshes keep the full-detail data plus the fallback. Trim high-poly imported kit pieces, and use "Keep Triangle Percent" / "Trim Relative Error" in the Nanite settings so the on-disk size and streaming pages stay small.

---

## 5. Custom Medium tier: scalability and device profile setup

### 5.1 Where to put overrides

- **`Config/DefaultScalability.ini`** in the project overrides `BaseScalability.ini` section by section. Put tier changes here, using the same `[Group@Level]` syntax. Changes apply wherever `sg.*` is set (settings menu, `scalability N`, device profile).
- **`Config/DefaultDeviceProfiles.ini`** pins the starting levels and any per-device cvars. The Windows profile is `[Windows DeviceProfile]`, and the syntax is `+CVars=name=value`. BaseScalability's header says to use the device profile for per-platform overrides, and to "watch out for the different syntax". [5.8 local, line 6]
- **`Config/DefaultEngine.ini` `[SystemSettings]`** applies to all tiers and is a bad place for tier-specific values.
- **`GameUserSettings`** (`Saved/Config/Windows/GameUserSettings.ini`) holds the player's chosen `sg.*` levels and overrides the device profile on later runs. Delete it when testing defaults.

### 5.2 Proposed `DefaultScalability.ini` overrides (starting point, untested)

Only lines that differ from stock 5.8 are shown. Everything else inherits.

```ini
; ---- Shadows: CSM on Low/Medium, VSM on High/Epic (BUILD-PLAN) ----
[ShadowQuality@0]
r.Shadow.Virtual.Enable=0

[ShadowQuality@1]
r.Shadow.Virtual.Enable=0
r.Shadow.CSM.MaxCascades=2          ; FPS near-field quality (test vs 1)
r.Shadow.CSMCaching=1               ; test; code default is 0 in 5.8

[ShadowQuality@2]
r.Shadow.Virtual.Enable=1

[ShadowQuality@3]
r.Shadow.Virtual.Enable=1

; ---- GI: Low = no Lumen but keep DFAO (BUILD-PLAN); Medium = stock Lumen Lite ----
[GlobalIlluminationQuality@0]
r.DistanceFieldAO=1
r.AOQuality=1
r.SkylightIntensityMultiplier=1.0   ; DFAO on, so skylight is not suppressed (matches stock @1 comment)

[GlobalIlluminationQuality@1]
; stock = Lumen Lite (r.Lumen.FinalGatherMethod=0). Do not add ScreenProbeGather cvars here;
; they are inert under FinalGatherMethod=0.

; ---- Textures / Nanite memory for a 4 GB card ----
[TextureQuality@1]
r.Streaming.PoolSize=800            ; BUILD-PLAN says 1000; measure before raising

; ---- Anti-aliasing at 67% internal ----
[AntiAliasingQuality@1]
r.TSR.ShadingRejection.Flickering=1 ; only if thin geometry shimmers; costs a little

[AntiAliasingQuality@0]
r.TSR.Resurrection=0                ; already 0 at stock @0; listed for clarity
```

Nanite cvars are not part of a scalability group. Put them in the Windows device profile or apply them from code when the user picks a tier:

```ini
; DefaultDeviceProfiles.ini
[Windows DeviceProfile]
+CVars=r.Nanite.Streaming.StreamingPoolSize=256
+CVars=r.Nanite.MaxPixelsPerEdge=2
```

`r.ScreenPercentage` is set per tier through `sg.ResolutionQuality`, and `[ResolutionQuality]` maps the value directly to percent. [5.8 local] Set Medium's resolution quality to 67 in the settings code, or with `+CVars=sg.ResolutionQuality=67` in the device profile.

### 5.3 Other stock Medium values worth knowing [5.8 local]

- `[PostProcessQuality@1]`: `r.MotionBlurQuality=3`, `r.DepthOfFieldQuality=1`, `r.Tonemapper.Quality=2`, `r.Bloom.ScreenPercentage=35.355`, `r.LensFlareQuality=0`. If GPU-bound, the first cut is `r.MotionBlurQuality=0`; many players turn it off in an FPS anyway.
- `[EffectsQuality@1]`: `r.MaterialQualityLevel=2` (Medium), `fx.Niagara.QualityLevel=1`, `r.EmitterSpawnRateScale=0.25`, `r.RefractionQuality=0`, `r.Fog.SeparateComposition=0` (5.8's new Fog Screen Space Scattering is disabled below Epic). Make sure Zeiph and Tamri materials have a sane Medium quality-switch branch.
- `[ViewDistanceQuality@1]`: `r.ViewDistanceScale=0.6`, `r.SkeletalMeshLODBias=1`.
- `[FoliageQuality@1]`: `foliage.DensityScale=0.4`.
- Auto-detect: `PerfIndexThresholds_*="GPU 18 42 115"`. `scalability auto` prints the CPU and GPU index. Run it once on the dev PC and record where the 1650 and 3200G land, because Shadow, ViewDistance and Effects use `Min` of CPU and GPU, so the weak CPU may drag those groups to Low.

---

## 6. DDC and Zen storage: keeping them off C:

### 6.1 What the 5.8 source actually does [5.8 local]

`BaseEngine.ini` lines 2719 to 2730:

```ini
[Zen]
AutoLaunch=true

[Zen.AutoLaunch]
DataPath=%ENGINEVERSIONAGNOSTICINSTALLEDUSERDIR%Zen/Data
LocalDataCachePathEnvOverride=UE-LocalDataCachePath
LocalDataCachePathCommandLineOverride=LocalDataCachePath
LocalDataCachePathEditorOverrideSetting=LocalDerivedDataCache
ExtraArgs=--http asio --gc-cache-duration-seconds 1209600 --gc-interval-seconds 21600 --gc-low-diskspace-threshold 2147483648 ...
```

`%ENGINEVERSIONAGNOSTICINSTALLEDUSERDIR%` resolves to `<UserSettingsDir>/UnrealEngine/Common/`, which is `%LOCALAPPDATA%\UnrealEngine\Common\` on Windows (`GetLocalZenRootPath()`, `ZenServerInterface.cpp:162`).

**Zen data path resolution order** (`DetermineDataPath`, `ZenServerInterface.cpp:985-1105`). The first valid entry wins:

1. Command line `-ZenDataPath=<path>`
2. Env var **`UE-ZenSubprocessDataPath`**. The engine sets this itself at Zen startup ("Ensure that the zen data path is inherited by subprocesses", line 2550), and the editor clears it before a self-restart (`UnrealEdMisc.cpp:1177`). **It is internal plumbing. Do not set it by hand.** A stale manual value would override everything below it.
3. Registry `HKCU\Software\Epic Games\Zen` value `DataPath`
4. Env var **`UE-ZenDataPath`**, the explicit user-facing override
5. **The local DDC path, if it is outside the engine root:** `<LocalDataCachePath>\Zen`. The local DDC path comes from `DetermineLocalDataCachePath` (lines 922-982). Later sources overwrite earlier ones:
   - env `UE-LocalDataCachePath`
   - registry `HKCU\Software\Epic Games\GlobalDataCachePath` value `UE-LocalDataCachePath`
   - command line `-LocalDataCachePath=`
   - **Editor Preferences** `LocalDerivedDataCache` Path in `EditorSettings.ini`. This beats the env var.
6. Config default: `%LOCALAPPDATA%\UnrealEngine\Common\Zen\Data`

### 6.2 What this means for GRAFT

- With `UE-LocalDataCachePath=D:\Claude\UE_DDC`, and since `D:\Claude` is outside `D:\Epic Games\UE_5.8\`, **Zen data should land in `D:\Claude\UE_DDC\Zen`**. No second env var is needed.
- If you want belt and braces, set `UE-ZenDataPath=D:\Claude\UE_DDC\Zen` (user-level env var), which is step 4. **Never set `UE-ZenSubprocessDataPath`.**
- Things that would silently send it back to C: or elsewhere:
  - an Editor Preferences > Global > Local Derived Data Cache path set to a C: folder (it overrides the env var);
  - the env var not being visible to the process. Env vars are inherited at process start, so restart the Epic Launcher, Visual Studio and any terminal after `setx`. A forum user reported `setx` "not working" for exactly this reason. [older UE5]
- **Zen binaries are always on C:.** `Zen\Install` (`%LOCALAPPDATA%\UnrealEngine\Common\Zen\Install`, `ZenServerInterface.cpp:254`) holds zenserver.exe and is small. Only `Zen\Data` is the cache.

### 6.3 How to verify after the first editor launch

1. Search the editor log (`Saved/Logs/Graft.log`) for `LogZenServiceInstance`. You want one of these:
   - `Found environment variable UE-LocalDataCachePath=D:\Claude\UE_DDC` and then `Found local data cache path=D:\Claude\UE_DDC`, or
   - `Found environment variable UE-ZenDataPath=...`

   If you see `Found Zen config default=...AppData/Local/UnrealEngine/Common/Zen/Data`, the override failed.
2. Check sizes:

   ```powershell
   "{0:N2} GB" -f ((Get-ChildItem "$env:LOCALAPPDATA\UnrealEngine\Common\Zen\Data" -Recurse -File -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum / 1GB)
   "{0:N2} GB" -f ((Get-ChildItem "D:\Claude\UE_DDC" -Recurse -File -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum / 1GB)
   ```

   The C: `Zen\Data` should stay empty or absent and not grow. Forum users report it reaching 20+ GB when not redirected. [older UE5]
3. If an old `Zen\Data` already exists on C: from before the env var, close all Unreal processes (zenserver.exe too) and delete it. It is a cache and rebuilds on demand. [older UE5 forum advice]

### 6.4 Known Zen gotchas [older UE5 / 5.5+ forum reports]

- Editing `[Zen.AutoLaunch] DataPath` in `BaseEngine.ini` to a per-project folder causes a bug: opening a second project with a different DataPath can delete the first project's local Zen DDC. The env-var route avoids it. Do not edit engine config.
- Zen GC from the stock ExtraArgs: entries unused for 14 days are evicted, GC runs every 6 hours, and GC is aggressive below 2 GiB free disk. [5.8 local]
- The cooker in 5.x can also write cooked output to a Zen store. If D: space matters, check `Saved/Cooked` vs the Zen store after the first cook. [older UE5]

---

## 7. Ryzen 3 3200G: 4-core CPU guidance

### 7.1 Thread layout on this CPU

- 3200G = 4 cores / **4 threads (no SMT)**. In 5.8, `FWindowsPlatformMisc::NumberOfWorkerThreadsToSpawn()` returns `NumberOfCores - 1` when there is no hyperthreading, so **3 task-graph workers** (minimum 2), plus the game thread, render thread and RHI thread. [5.8 local, `WindowsPlatformMisc.cpp:2719`] That is 6+ busy threads on 4 cores, so oversubscription is normal and the game thread competes with workers.
- `-corelimit=N`, `-physicalcorelimit=N` (experimental), `-usehyperthreading`, `-onethread` and `-norenderthread` are the 5.8 command-line knobs. [5.8 local, `GenericPlatformMisc.cpp:1929`] There is **no `-NumWorkers`** switch in core. Don't change thread counts on this box; the defaults are already minimal. Use `-corelimit` only to simulate weaker CPUs.
- A developer quoted in press coverage summed up the 4-thread case: game, render, RHI and animation threads use the CPU well, and extra cores add little. [older UE5, anecdotal]

### 7.2 Game-thread budget (33.3 ms frame, aim for GT ≤ 20 ms)

Common causes of game-thread bottlenecks on 4-core CPUs, and fixes:

- **Tick:** turn off Tick on actors that don't need it. Use tick intervals (0.1 to 0.2 s) for AI perception and UI updates. Use timers instead of tick. Check with `stat game` and `stat ticks` (verify) or Insights.
- **Animation:** use URO (Update Rate Optimizations) on enemy skeletal meshes. Use the Animation Budget Allocator plugin (built in) to cap anim GT cost. Turn on "Visibility Based Anim Tick Option = Only Tick Pose When Rendered". Enemies have `r.SkeletalMeshLODBias=1` on Medium already. [5.8 local]
- **AI:** EQS queries are expensive on the GT. Throttle them. Keep the enemy count per encounter in line with GDD beats, and profile the worst encounter.
- **Physics:** avoid many simulating bodies. Keep ragdolls short-lived and cap concurrent ragdolls (2 to 3).
- **Blueprint:** heavy per-frame BP logic is the usual culprit. Move hot loops to C++.
- **Niagara:** prefer GPU sim for large emitters. On Medium, `r.EmitterSpawnRateScale=0.25` already applies. [5.8 local]
- **Garbage collection:** 5.8 adds an optional GC mode that runs based on pending actors to unload (`s.ContinuouslyIncrementalGCWhileActorsPendingPurge`, off by default). [5.8 web] Default incremental GC is fine for a linear slice, so watch for GC hitches at streaming transitions.
- **Streaming hitches:** a linear FPS with level streaming is sensitive to async loading on 4 cores. Stream sub-levels early during corridors, and keep each streamed chunk small.
- **PSO hitches** hit harder on slow CPUs. Use PSO precaching (default on in 5.x) plus a bundled PSO cache from a recorded playthrough for packaged builds. 5.8 lets PSO precache fail gracefully when shader data isn't ready. [5.8 web]
- 5.8 makes MallocBinned3 the default allocator on Windows. Nothing to do; just don't override it. [5.8 web]

### 7.3 Integrated Vega 8 vs the discrete 1650

- In Windows Settings > Display > Graphics, set `UnrealEditor.exe`, `UnrealEditor-Cmd.exe` and the packaged `Graft-Win64-*.exe` to **High performance (GTX 1650)**. Confirm in the log (`LogD3D12RHI: ... Chosen adapter`) or with `stat rhi`.
- If the iGPU is enabled in BIOS, it reserves system RAM as UMA frame buffer, which takes it from the 16 GB. If the monitor is plugged into the 1650, consider disabling the iGPU or setting UMA to its minimum. This is the human's call, because it is a BIOS change.
- Not UE-specific: the 3200G is sensitive to RAM speed and dual-channel. Make sure XMP/DOCP is on (human task).

### 7.4 Build, cook and shader compile parallelism on 4 cores

- **Compile:** `BuildConfiguration.xml` `MaxParallelActions=3` is right. It leaves one core for the OS and editor. Each MSVC instance can use 1 to 2 GB, so 3 is also memory-safe at 16 GB.
- **Shader compiling:** stock `[DevOptions.Shaders]` sets `NumUnusedShaderCompilingThreads=3` below `ShaderCompilerCoreCountThreshold=12`. On 4 cores that means **1 ShaderCompileWorker**, so first-open shader compiles will be very slow. `NumUnusedShaderCompilingThreadsDuringGame=4` (during PIE) means a minimum of 1 as well. [5.8 local, `BaseEngine.ini:2176-2202`] Optional override in the project's `Config/DefaultEngine.ini`:

  ```ini
  [DevOptions.Shaders]
  NumUnusedShaderCompilingThreads=1   ; 3 SCWs while editing; editor UI gets laggy during big compiles
  ```

  Each SCW uses about 0.4 GB (the BaseEngine comment estimates `MemoryUsedPerSCWProcessInGB = 0.4`), so 3 is fine on 16 GB. Revert to 2 if the editor becomes unusable during compiles. `WorkerProcessPriority=-1` (below normal) is already set.
- **Cooking:** keep single-process cooking (do not pass `-cookprocesscount=N>1`). Multi-process cook duplicates memory and gains nothing on 4 cores. [older UE5]
- **"Only one Unreal process at a time"** (CLAUDE.md) also matters for Zen. Each editor launch can start its own zenserver, and two editors share the data path.

---

## 8. Profiling: packaged Development build vs editor `-game`

### 8.1 Why editor and `-game` numbers mislead

Running `UnrealEditor.exe Graft.uproject -game` is still an **editor-target binary** (`WITH_EDITOR=1`):

- **Uncooked assets.** Content loads through the editor path (DDC/Zen lookups, on-demand shader compiles, no IoStore). Loading and streaming timings are unrealistic, usually slower and more hitchy. Once things are warm, steady-state CPU numbers can look *better* than a packaged build, because some packaged-only costs (PSO creation on first use, IoStore decompression) are hidden or moved. Forum reports go both ways, including a packaged build about 30% slower than PIE. [older UE5]
- **Extra editor modules and memory.** The editor binary loads editor-only modules and keeps editor-only data on UObjects. Memory numbers are inflated, and that matters on a 16 GB / 4 GB system.
- **Scalability differences.** The editor has "Monitor Editor Performance", which can auto-lower scalability in PIE. A packaged build reads the device profile and `GameUserSettings`. If neither is set, scalability can default to auto-detect or Epic. [older UE5]
- **Shader and PSO state.** In the editor, missing shaders compile on demand (stall, or default material). In packaged builds, only cooked shaders exist, and PSO precache or bundled caches decide the hitches.
- **Same GPU work, different CPU work.** GPU-bound scenes (lighting, Lumen Lite, TSR) usually read about the same in both. GT/RT-bound numbers are the ones that differ, and on a 3200G we will often be CPU-bound.

Tom Looman's checklist says to profile packaged builds, and that standalone is "convenient" but has inaccurate memory and some timings. [older UE5 web]

### 8.2 Recommended procedure

1. Package **Development** (stats and console available) or **Test** (closer to Shipping with some profiling hooks; use it for final numbers). Shipping cannot be profiled. [older UE5]
2. Launch with fixed conditions:

   ```
   Graft.exe -dx12 -windowed -ResX=1920 -ResY=1080 -nosound(optional) -trace=default,gpu,memory -statnamedevents
   ```

   In-game console: `r.VSync 0`, `t.MaxFPS 0`, `scalability 2` (or the Medium preset via settings), then `stat unit`, `stat unitgraph`, `stat gpu`, `stat rhi`, `stat streaming`.
3. The bottleneck is the thread with the highest ms in `stat unit` (Game, Draw = render thread, RHIT, GPU). Re-run after each change. [web, 2026 guide]
4. For GPU detail use `ProfileGPU` (single frame), or Insights with the `gpu` channel. For CPU use Unreal Insights (`-trace=default`) and open the `.utrace` in `UnrealInsights.exe`.
5. CSV profiler for repeatable runs: `-csvprofile` or `csvprofile start/stop`, then compare the median and 1% low frame time across builds on the same route through the level.
6. Before profiling: build lighting if any static lighting exists, fix map errors, and close the editor (one Unreal process at a time, per `gpu.lock`).
7. 5.8 additions: `stats.UnitTimestamp` adds timestamps to `stat unit`, and `r.ProfileGPU.TableFormatting` changes the `ProfileGPU` output layout. [5.8 web]

---

## 9. Quick checklist for agents implementing the Medium tier

- [ ] Decide: stock Lumen Lite on Medium (recommended) or force `r.Lumen.FinalGatherMethod=1`. Log it in DECISIONS.md and fix BUILD-PLAN's ScreenTraces line accordingly.
- [ ] Add a `DefaultScalability.ini` with the VSM/CSM split and Low DFAO re-enable (5.2).
- [ ] Device profile: Nanite pool 256, MaxPixelsPerEdge 2, ResolutionQuality 67.
- [ ] Texture pool: start at 800, measure, then decide on 1000.
- [ ] TSR: velocity on WPO, VFX and viewmodel; Responsive AA on small bright VFX; camera-cut calls on cinematics.
- [ ] Confirm the Zen path from the log line, and C: `Zen\Data` size stays at about 0.
- [ ] Shader worker override (optional) in `DefaultEngine.ini`.
- [ ] Windows GPU preference: discrete 1650 for the editor and the packaged exe.
- [ ] Profile only packaged Development/Test builds for go/no-go numbers.

---

## Unverified for 5.8 specifically

- `r.DynamicRes.*` names and defaults (from older UE5 memory). The 5.8 PC dynamic resolution support is from release coverage only.
- `r.Velocity.EnableVertexDeformation` exact name and location.
- `stat nanitestreaming` / `stat ticks` command names.
- Whether runtime switching of `r.Shadow.Virtual.Enable` through scalability is hitch-free.
- All VRAM figures in 2.3 and ms estimates. None were measured on the dev PC.
- Lumen Lite's "Beta" status and "2x faster than High" figure come from 5.8 release coverage and Epic's guide, not from our own measurements.
- Behavior of CSM caching (`r.Shadow.CSMCaching=1`) in 5.8. The cvar exists with default 0, but the quality and cost trade-off is not checked.
- Forum-sourced Zen gotchas (6.4) are from 5.4 to 5.6-era threads.

## Sources

Local engine files (strongest evidence):
- `D:\Epic Games\UE_5.8\Engine\Config\BaseScalability.ini`
- `D:\Epic Games\UE_5.8\Engine\Config\BaseEngine.ini` (`[Zen.AutoLaunch]`, `[DevOptions.Shaders]`)
- `D:\Epic Games\UE_5.8\Engine\Source\Developer\Zen\Private\ZenServerInterface.cpp`
- `D:\Epic Games\UE_5.8\Engine\Source\Editor\UnrealEd\Private\UnrealEdMisc.cpp`
- `D:\Epic Games\UE_5.8\Engine\Source\Runtime\Renderer\Private\Lumen\Lumen.cpp`, `LumenIrradianceFieldGather.cpp`
- `D:\Epic Games\UE_5.8\Engine\Source\Runtime\Renderer\Private\PostProcess\TemporalSuperResolution.cpp`
- `D:\Epic Games\UE_5.8\Engine\Source\Runtime\Renderer\Private\ShadowSetup.cpp`, `ShadowRendering.cpp`, `VirtualShadowMaps\VirtualShadowMapArray.cpp`
- `D:\Epic Games\UE_5.8\Engine\Source\Runtime\Renderer\Private\Nanite\NaniteShared.cpp`, `NaniteCullRaster.cpp`
- `D:\Epic Games\UE_5.8\Engine\Source\Runtime\Engine\Private\Rendering\NaniteStreamingManager.cpp`, `StaticMeshSceneProxy.cpp`
- `D:\Epic Games\UE_5.8\Engine\Source\Runtime\Core\Private\Windows\WindowsPlatformMisc.cpp`, `GenericPlatform\GenericPlatformMisc.cpp`

Web:
- [Epic: Lumen Performance Guide (5.8 docs)](https://dev.epicgames.com/documentation/en-us/unreal-engine/lumen-performance-guide-for-unreal-engine)
- [Tom Looman: Unreal Engine 5.8 Performance Highlights](https://tomlooman.com/unreal-engine-5-8-performance-highlights/)
- [Guru3D: UE 5.8 debuts Lumen Lite and production-ready MegaLights](https://www.guru3d.com/story/unreal-engine-58-debuts-lumen-lite-and-productionready-megalights/)
- [80.lv: Unreal Engine 5.8 is out](https://80.lv/articles/unreal-engine-5-8-is-out-today-with-big-optimization-improvements-and-mesh-terrain)
- [Unreal forums: UE 5.8 released](https://forums.unrealengine.com/t/unreal-engine-5-8-released/2729274)
- [Unreal forums: How do I set Zen DDC location to the project folder?](https://forums.unrealengine.com/t/how-do-i-set-zen-ddc-location-to-the-project-folder/2017286)
- [Unreal forums: How do I change/move the Zen cache?](https://forums.unrealengine.com/t/how-do-i-change-move-the-zen-cache/2326842)
- [Unreal forums: Is there a way to move the Zen folder?](https://forums.unrealengine.com/t/is-there-a-way-to-move-the-zen-folder/1895168)
- [Unreal forums: Zen AutoLaunch DataPath deletes local Zen DDC (JP)](https://forums.unrealengine.com/t/zen-autolaunch-datapath-local-zen-ddc/2735146)
- [Unreal forums: TSR ghosting against a VolumetricCloud](https://forums.unrealengine.com/t/tsr-ghosting-against-a-volumetriccloud-the-player-stands-inside-every-rejection-knob-measured-none-help/2837437)
- [Unreal forums: TSR feedback thread](https://forums.unrealengine.com/t/tsr-feedback-thread/883977/3)
- [Unreal forums: Problem with performance with GTX 1650 Ti](https://forums.unrealengine.com/t/problem-with-performance-with-gtx-1650-ti/726966)
- [Unreal forums: Nanite performance options](https://forums.unrealengine.com/t/nanite-performance-options/2687737)
- [Unreal forums: GTX 960 / 1060 as min spec](https://forums.unrealengine.com/t/what-are-the-implications-of-picking-gtx-960-or-gtx-1060-as-min-spec-for-gpu-on-pc/1954428)
- [Unreal forums: Editor vs Build performance](https://forums.unrealengine.com/t/editor-vs-build-performance/384948)
- [Unreal forums: Why does packaged game run more slowly?](https://forums.unrealengine.com/t/why-does-packaged-game-run-more-slowly/693817)
- [Tom Looman: Unreal Engine Game Optimization on a Budget](https://tomlooman.com/unreal-engine-optimization-talk/)
- [Outlook Respawn: UE optimization, profiling and fixing common bottlenecks](https://respawn.outlookindia.com/gaming/gaming-guides/unreal-engine-optimization-profiling-and-fixing-common-bottlenecks)
- [Multiplayer.it: UE5 and PC optimization problems](https://multiplayer.it/articoli/unreal-engine-5-causa-problemi-ottimizzazione-giochi-pc.html)
