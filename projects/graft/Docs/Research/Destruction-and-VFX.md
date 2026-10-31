# Destruction and VFX research (UE 5.8.4)

Research date: 2026-10-28. Target: GTX 1650 (4 GB), Ryzen 3 3200G (4 cores), 30 fps at 1080p Medium with TSR.

How to read the tags in this file:

- **[5.8 verified]**: confirmed on a page that says "Unreal Engine 5.8" (the API reference, the 5.8 docs or the 5.8 release notes).
- **[older docs]**: confirmed in 5.0 to 5.7 docs or forum posts. Likely still true, but check in the editor.
- **[unverified]**: from general engine knowledge or community posts. Check in the 5.8.4 editor before relying on it.

A key point for this hardware: Chaos destruction runs on the CPU. On a 4-core 3200G, the physics thread will hit its limit long before the 4 GB of VRAM does. Budget destruction by **active rigid bodies at once**, not by VRAM. VRAM matters for Niagara translucency and the render cost of geometry collections.

---

## 0. What changed in 5.8 (summary)

From the official 5.8 release notes [5.8 verified]:

- **Dataflow is production-ready.** New Geometry Collection assets get a **default Dataflow template**. Fracturing is now nondestructive and graph-driven (see Section 1). Fracture Mode still exists as the entry point.
- **Geometry Collection component:** per-transform linear and angular damping; new Blueprint functions `GetCurrentTransforms` and `GetCurrentTransformsFromIndices`; a **GyroscopicTorque** option; new render settings for renderable types.
- **Fixes:** the Niagara Destruction data interface no longer spawns some particles at the world origin. Collision response on a GC component now sets correctly. Traces now work on partial clusters that use remove on break or remove on sleep.
- **Chaos Fields:** a crash fix when a field processes a partial cluster. There are **no new field APIs**.
- **Chaos Caching:** **per-component caching in Sequencer**, for both editor-side baking and runtime playback. The cache asset can act as a meta-asset that points to more optimized formats. There are new tools for cache versioning, trimming and invalidation. A crash on EndPlay with a **Spawnable `ChaosCacheManager`** in Sequencer is fixed.
- **Chaos Core:** `ImplicitObjectScaled` is **removed** in favor of per-shape scale. This matters only if GRAFT C++ touches implicit objects directly. Island generation is now thread-safe, there is sleeping control, and work continues toward moving off the monolithic physics thread.
- **Niagara:** the full 5.8 release notes have no Niagara section that I could find. See Section 6 for community-reported 5.8 issues.

---

## 1. Geometry Collection authoring in 5.8

### 1.1 Workflow (Dataflow-first) [5.8 verified]

The 5.8 "Dataflow for Destruction Quickstart" uses this flow:

1. Place the static mesh. Open **Fracture Mode**, then under **Generate** click **New**. Create a **DataflowAsset**, then **Create Geometry Collection**.
2. Open the GC asset. The **Dataflow Graph** panel holds the fracture graph. The nodes used in the quickstart are:
   - `Static Mesh To Collection`
   - `Bounding Box`
   - `Uniform Scatter Points` (Min/Max Number of Points, Random Seed)
   - `Voronoi Fracture`
   - `Auto Cluster`
   - `Geometry Collection Terminal`
3. The quickstart does two passes: 10 points, then 25 points with a fixed seed, then `Auto Cluster`. It sets **Damage Threshold** to `[5000, 500, 50]` (one value per cluster level).

Recommendations for GRAFT:

- **Always set the Random Seed** on scatter nodes. The graph then rebuilds to the same pieces, which also keeps a Chaos Cache valid (Section 2).
- The **classic Fracture Mode tools** (Uniform, Cluster, Radial, Planar, Slice, Brick, Mesh, plus the Cluster/Auto Cluster, Proximity, Convex and Removal utilities) are still in Fracture Mode. They have not been checked against 5.8 because the 5.8 Fracture Mode doc page did not render. **[unverified]** The Dataflow graph is the route Epic now documents. Pick one route per asset, since mixing them invites rebuild surprises.

### 1.2 Hitting ~300 pieces

- Use **two levels** (level 1: 8 to 15 chunks, level 2: about 20 to 30 per chunk), then `Auto Cluster`. That gives roughly 250 to 350 leaves with a shallow tree. Deep trees (3+ levels) multiply the cost of strain evaluation and connection graphs. **[unverified, standard practice]**
- Set **Max Cluster Level** / **Max Simulated Level** on the asset so tiny leaves don't become rigid bodies of their own. **[older docs; property names to check in 5.8]**
- For walls the player only chips, consider **one GC per wall section** (about 100 to 150 pieces each) instead of one 300-piece GC per room. Community users splitting large GCs report better control. [older docs, forum]

### 1.3 Debris lifetime of 5 seconds

The asset properties are [older docs, Python API]:

| Property | Meaning |
|---|---|
| `remove_on_max_sleep` ("Remove On Sleep") | Remove a particle and dissolve its render geometry once the sleep threshold is passed |
| Max sleep time (min/max range) | How long a piece must sleep before removal starts |
| `removal_duration` | How long the shrink-out takes, in seconds |
| `scale_on_removal` | Shrink pieces while they are removed (on by default) |
| Remove on break | Set per piece with the Fracture Mode **Removal** utility ("Set removal-on-break parameters") |

To cap debris at 5 seconds:

- Use **remove on break** with a post-break timer of about 3 to 4 s plus a removal duration of 1 s, so the total is 5 s or less.
- Add **remove on sleep** as a backstop.

Caveats:

- **UE-358545:** if a GC is partly destroyed and its removal timers expire, the rest still renders, but the player **can't collide** with it. Epic reproduced the bug with very short timers (below 1 s) and said related fixes are targeted at 5.8. **Don't use timers below 1 s**, and test this in 5.8.4. [forum and issue tracker; 5.8 status unverified]
- "Remove On Sleep doesn't stop frame drops" (forum, no answer). Pieces that jitter on the floor never sleep, so they never get removed. **Fix: also set a hard cap in gameplay code.** Bind `OnChaosBreakEvent`; 5 s after the first break, call `SetDynamicState`/hide, or destroy the GC actor (or swap to a static rubble mesh). **[unverified, forum practice]**

### 1.4 Settings for a 4-core CPU / 4 GB GPU

- **Collision:**
  - Set the **Implicit Type** to **Box** or **Convex**. Avoid **Level Set**, which is the most expensive.
  - Set the **Collision Type** to **Particle-Implicit** only on the large size bucket, and Implicit-Implicit for the rest.
  - The **Size Specific Data** array lets small pieces use cheap shapes (a Box or Sphere) while large ones use Convex.

  [older docs, Houdini integration doc lists: Box, Sphere, Capsule, Level Set, None, Convex]
- **Damage:**
  - Turn off **`bEnableDamageFromCollision`** (`SetEnableDamageFromCollision(false)`) on GCs that should break only from abilities. That also saves cost: falling pieces stop breaking other pieces.
  - Use per-level **`DamageThreshold`** (a `TArray<float>`) and `bUseSizeSpecificDamageThreshold`.

  [5.8 verified, API]
- **Clustering:** keep `EnableClustering` on. Start un-hit walls as **Kinematic**/**Sleeping** (`ObjectType`) or anchored, so they cost nothing until hit. [5.8 verified property names]
- **Rendering:**
  - Since 5.5, a GC supports a **Root Proxy** mesh, which renders as a plain static mesh until the first break. It also supports a **Custom Renderer** (`custom_renderer_type`, ISM pool via `UGeometryCollectionISMPoolComponent`). That keeps intact walls as cheap as a static mesh and keeps Lumen working until break.
  - **Caveat:** in 5.6.1, root proxy broke Chaos Cache recording. Epic said the fix landed in 5.7. For the cached drop-pod GCs, test recording first; if it fails, disable **Use Root Proxy** on those GCs. [forum, 5.5+]
- **Nanite:** the GTX 1650 (Turing) supports Nanite, and GCs can render with Nanite. Broken GC pieces have **no LODs**, so Nanite is the LOD answer if the project uses Nanite. Epic said there is no distance-field support for GCs, which means no Lumen distance-field shadowing from debris. [forum; 1650 support unverified for 5.8]
- **Physics thread:**
  - Expect about 300 active pieces to be fine **once**. Several 300-piece GCs breaking in the same second will spike the frame on a 3200G.
  - Stagger the breaks, keep `Max Simulated Level` low, and have collision profiles ignore debris vs debris where possible ("Abandoned particle collision profile" / per-level collision profile names). **[unverified names]**
- **Cvars:** I could not verify a list of `p.Chaos.*` / `p.GeometryCollection.*` cvars against 5.8. To get the real list on the dev PC, run `DumpConsoleCommands p.Chaos` and `DumpConsoleCommands p.GeometryCollection` in the editor console. Use **Chaos Visual Debugger** (ChaosVD) and `stat Chaos*` / Unreal Insights to profile. **[unverified]**

---

## 2. Deterministic playback for the drop-pod impact (three floors)

**Recommendation: record with the Chaos Cache Manager, then play back from Sequencer.** Live Chaos isn't bit-for-bit repeatable run to run. A cache plays back the same transforms every time and costs far less CPU than live simulation, because pieces are driven, not solved.

### 2.1 The API [5.8 verified: `AChaosCacheManager`, plugin path `Engine/Plugins/Experimental/ChaosCaching`]

- Properties:
  - `CacheMode` (`ECacheMode`: None / Play / Record)
  - `StartMode` (`EStartMode`: timed from BeginPlay, or Triggered)
  - `StartTime`, which is exposed to Sequencer
  - `CacheCollection` (`UChaosCacheCollection`)
  - `bStartOnBeginPlay`
  - `bCreateNewCacheCollectionAssetOnRecord`
  - `bReplayEventsInStaticPoseMode`, which replays break and collision events through the Chaos Event Relay. That keeps Niagara break VFX and sounds firing during cached playback.
- Functions:
  - `TriggerAll()`, `TriggerComponent(UPrimitiveComponent*)`, `TriggerComponentByCache(FName)`
  - `Start(float)`, `Stop()`
  - `SetCacheMode`, `SetStartTime`
  - `ResetAllComponentTransforms()`
  - `FindOrAddObservedComponent` (Blueprint name: `UpdateOrAddObservedComponent`)
- The plugin is still under **Experimental**. Enable the **ChaosCaching** plugin.

### 2.2 Workflow [forum and tutorial, older versions]

1. Build three GCs (floor 1, 2, 3), each with a **fixed fracture seed**. The pod is a **kinematic** actor animated in Sequencer, so its path is identical every take.
2. Place a **Chaos Cache Manager**. Add the three GC components to **Observed Components**, give each a **Cache Name** (it won't store without one), and set `CacheMode = Record`.
3. Drive the break with the pod's collision, or with a Field System actor keyed in Sequencer. Then **Simulate** to record. Repeat until a take looks right, then keep it.
4. Set `CacheMode = Play`. In the Level Sequence, add the cache manager and a **Chaos Cache** track. Key **Start Time**, or use the 5.8 per-component Sequencer caching.
5. At runtime, the gameplay sequence (the pod landing) plays the Level Sequence, which drives the cache.

### 2.3 Known issues to test early

- **UE-356044:** a crash during Sequencer playback of Chaos caches, introduced in 5.7. The 5.8 notes fix a *Spawnable* cache manager EndPlay crash. Whether UE-356044 itself is fixed in 5.8.4 is **unverified**. **Use a placed (possessable) cache manager, not a spawnable one.**
- Some users report the manager's Sequencer track misbehaves on Play or Record. Their workaround is a separate **Chaos Cache Player** set to **Static Pose** mode with Start Time keyed. [forum, 5.x]
- Pauses between destruction phases don't survive baking. Split each floor into its own GC (which the plan already does) and trigger each one separately (`TriggerComponent`). [forum, 5.4]
- Root proxy plus caching: see Section 1.4.

### 2.4 Fallback if caching is unstable in 5.8.4

Bake the fall outside Chaos and import it as animation:

- **Blender** (free): rigid body sim, then bake to bones, then export a **skeletal mesh + anim sequence**, or export as an **Alembic Geometry Cache**.
- Play that in Sequencer. It is fully deterministic and cheap on the CPU, but it has no physics interaction. That is fine for a cutscene-style beat.
- Don't use paid Fab "cache to skeletal mesh" plugins, because the project has zero budget.

---

## 3. Ability-triggered, tag-filtered destruction

### 3.1 Recommended approach: per-component strain, filtered in code

Physics **fields** affect every GC in their volume, regardless of gameplay tags. For `Graft.Breakable.Light` vs `Graft.Breakable.Floor`, filter in C++ first, then apply strain only to the components that match.

1. In the GAS ability (shoulder charge or ground slam), run an overlap query: `OverlapMultiByObjectType` (a sphere for the slam, a capsule or box along the charge path), then a cone test with a dot product against the facing direction.
2. For each hit actor, read its tags. Use `IGameplayTagAssetInterface` or a small `UGraftBreakableComponent` with a `FGameplayTag BreakableType`. Keep only actors whose tag matches the ability: Light for the charge, Floor for the slam.
3. On each matching `UGeometryCollectionComponent`, call these [5.8 verified signatures]:
   - `ApplyExternalStrain(int32 ItemIndex, const FVector& Location, float Radius, int32 PropagationDepth, float PropagationFactor, float Strain)`. Pass `ItemIndex` from a hit result, or `GetRootIndex()`.
   - Then `ApplyBreakingLinearVelocity(ItemIndex, Velocity)` / `ApplyLinearVelocity` to push the pieces away from the player.
   - Or, for "this whole thing goes": `CrumbleCluster(ItemIndex)` / `CrumbleActiveClusters()`.
4. Strain must be greater than the `DamageThreshold` for that level. Tune it per breakable type:
   - Give Light walls low thresholds.
   - Give Floor GCs thresholds that only the slam's strain value passes.
   - Turn off damage from collision on both, so bullets and debris don't break them.
5. The 5.8 quickstart values are a starting point: Radius 100, Propagation Depth 1, Propagation Factor 1, Strain 50000 against thresholds `[5000, 500, 50]`.
   - **Caveat:** a forum report says strain with a radius of about 100 or less had little effect. Start with 150 to 300 for abilities.

### 3.2 Alternative: transient Physics Fields [5.8 verified docs]

Use this for big, area-wide effects like the pod impact take or an explosion.

- Use `AFieldSystemActor` / `UFieldSystemComponent`. `UGeometryCollectionComponent::ApplyPhysicsField(bool Enabled, EGeometryCollectionPhysicsTypeEnum Target, UFieldSystemMetaData* MetaData, UFieldNodeBase* Field)` shows in Blueprint as "Add Physics Field".
- Physics types (5.8 doc):
  - Integer: Dynamic State, Activate Disabled, Collision Group
  - Scalar: External Strain, Internal Strain, Disabled Threshold, Sleeping Threshold, Kill Particles
  - Vector: Linear Force, Linear Velocity, Angular Velocity, Angular Torque
- Field nodes:
  - Scalar: Uniform Scalar, Wave Scalar, **Radial Falloff**, Plane Falloff, **Box Falloff**, Noise Field
  - Vector: Uniform Vector, Radial Vector, Random Vector
  - Operators: Operator Field, To Integer/Float Field, **Culling Field**
- Metadata filters: State (Dynamic, Kinematic, Static, Sleeping, Disabled, All), **Object (Rigid, Cloth, Destruction, Character, All)**, Position, Resolution. A metadata filter with Object = Destruction keeps a field from shoving ragdolls and props.
- A typical blast is **External Strain** from a Radial Falloff (or Uniform Scalar culled by a sphere) plus **Linear Velocity** from a Radial Vector. Epic's engine content `FS_MasterField` Blueprint is the reference. [forum]
- **Downside:** you can't filter by gameplay tag. Fields are good for scripted moments; per-component strain is better for gameplay abilities.

### 3.3 Anchors for "only part of it breaks"

- Floors and walls should be **anchored** at the edges, so the slam opens a hole instead of dropping the whole floor. Use an Anchor Field at init, or at runtime call `SetAnchoredByBox(FBox, bool, MaxLevel)`, `SetAnchoredByTransformedBox`, `SetAnchoredByIndex` or `RemoveAllAnchors()`. [5.8 verified]
- Anchor fields are init-only. Runtime changes go through those functions. [forum]

### 3.4 Events for VFX, SFX and AI

Turn on `bNotifyBreaks` / `SetNotifyBreaks(true)` and bind `OnChaosBreakEvent`. Also available are `OnChaosRemovalEvent` and `OnChaosCrumblingEvent` with `SetNotifyCrumblings`. [5.8 verified] Trailing events are reported missing from Blueprint (5.0 to 5.6). The Niagara Chaos data interface exposes collision, break and trailing data, and its origin-spawn bug is fixed in 5.8.

---

## 4. `IGraftTearable`: tearing off an APC door or mounted gun

### 4.1 Recommendation: art-authored separate parts, not GC pieces

An APC door or a gun is a single designed part, not random fracture. The simplest reliable route is:

- The owner actor has the part as its own `UStaticMeshComponent` (or a socket-attached child actor), and is **not simulating**.
- On the montage `AnimNotify` ("TearRelease"):
  1. Hide the original component, or call `DetachFromComponent(FDetachmentTransformRules::KeepWorldTransform)`.
  2. **Spawn** a small `AGraftTornPart` actor at the same transform, with the same mesh.
  3. Call `SetSimulatePhysics(true)` and `AddImpulse` along the pull direction.
- Spawning a separate actor (instead of simulating the attached component) avoids the rule that simulated bodies can't live inside an attachment hierarchy, which GC `BeginPlay` also works around. [older docs]
- During the montage, before release, attach the part to the player's hand socket. Either use a two-bone IK target at the grip points, or attach it to `hand_r` at a notify. Then release it into physics.

An interface sketch (C++, `UINTERFACE(BlueprintType)`):

- `bool CanBeTorn(const AActor* Instigator) const`
- `FTransform GetTearGripTransform(int32 HandIndex) const` (two hands)
- `UAnimMontage* GetTearMontage() const`
- `void OnTearStarted(AActor* Instigator)` / `void OnTearReleased(const FVector& Impulse)`, which spawn the physics part, swap the owner to a "torn" state (the door hole is open, the gun turret is disabled) and fire a gameplay tag event.

### 4.2 Alternative A: physics constraint

- Have the part simulate from the start, held by a `UPhysicsConstraintComponent` with linear and angular limits locked. On release, call `BreakConstraint()`.
- Use this if the part should wobble under fire before it is torn.
- It costs a simulating body all the time. **[unverified for 5.8, a long-standing API]**

### 4.3 Alternative B: a GC with an anchored "detachable cluster"

- Fracture the APC so that the door is one top-level cluster. Anchor everything else (`SetAnchoredByBox`), and keep the door cluster's damage threshold very high.
- On release, call `SetAnchoredByIndex(DoorIndex, false)`, then `ApplyBreakingLinearVelocity(DoorIndex, Pull)`. [5.8 verified function names]
- This is more fragile: piece indices change if the Dataflow graph is rebuilt, and remove-on-sleep interacts with it (UE-358545).
- **Use it only if the door must also shatter under fire.**

---

## 5. Niagara for the drop sequence, inside the falling pod

### 5.1 Heat haze and distortion

- **Don't make the heat haze a particle storm.** From inside a pod, the cheapest convincing haze is **one camera-facing mesh quad** (or a mesh outside the pod window) with a translucent **refraction** material:
  - Set the Refraction Method to Index of Refraction or Pixel Normal Offset.
  - Pan a noise normal map with a `Panner`, and scale its strength with a parameter keyed in Sequencer.
  - The cost is one full-screen translucent pass, which is predictable on a 1650.
- If it needs to be in Niagara, use **2 to 10 large, slow sprites** with the same material. They must not stack, because every overlapping refracting sprite pays the full-screen cost again.
- Known issues:
  - Niagara particles that should be *seen through* refraction need **Render After DOF disabled** on their materials. [forum]
  - Refraction can vanish at lower scalability. **Test at the shipping Medium scalability, not Epic.** [forum]
  - The `r.DisableDistortion` cvar exists for a low-end fallback. **[unverified in 5.8]**
- I found no measured cost comparison between Pixel Normal Offset and Index of Refraction. Measure with `stat GPU` / `ProfileGPU` on the 1650.

### 5.2 Flak bursts

- Build them as **flipbook sprite bursts**: SubUV explosions, a short burst of 1 to 3 sprites, plus 10 to 30 spark sprites, plus a light flash. **Unlit translucent or additive**, with small screen coverage.
- Use **Lightweight (Stateless) emitters** where the modules fit. The supported list includes Shape Location, Initialize Particle, Add Velocity, Gravity/Drag/Acceleration, Curl Noise, Scale Color, Scale Sprite Size, Sprite Rotation Rate and **Sub UV Animation**, which covers a flak puff. Epic claims stateless emitters cut game-thread and render-thread cost and memory, and remove the per-emitter-count penalty. [docs page titled 5.8]
  - **5.8.2 regression:** a system with **only** stateless emitters fails to save. Workaround (untested): keep one tiny stateful emitter in the system, disabled or with zero spawn. Check whether 5.8.4 fixed it.
- **CPU vs GPU:**
  - Use **CPU sim** for every emitter under about 1,000 particles, which covers all the flak and spark bursts. GPU sim has fixed dispatch overhead and needs **fixed bounds**. Dynamic bounds on GPU cause a GPU-to-CPU readback stall. [community heuristic, not Epic numbers]
  - Use GPU only for a large ambient field (cloud streaks, rain of embers) of over 1,000 particles, with fixed bounds.
- **Ceilings for the 1650** are a starting budget, not Epic guidance, so confirm with `stat GPU`:
  - Total visible particles in the drop sequence: **under 3,000**.
  - **Translucent overdraw** is the real limit. Keep big translucent sprites on screen to about 20 or fewer at once, and the refraction layer to one.
  - Flipbooks: 2K atlas at most, ideally 1K. Use BC7 or DXT5 at 8x8 or 6x6 frames.
- **Scalability:**
  - Give each system an **Effect Type** with Max Distance, Max Instances and significance culling.
  - The **FX.Budget** cvars can scale culling when the frame budget is exceeded.
  - Per-platform scalability lets the Medium preset cut spawn counts.
  - `sg.EffectsQuality` is the scalability group. [older docs, Python API]

### 5.3 Making it repeatable in Sequencer

- Add the Niagara components to the Level Sequence with a **Niagara System track** (life cycle), and key user parameters (haze strength, burst triggers) there.
- Set the emitters to **Deterministic** with a fixed **Random Seed**, and set the component **Age Update Mode** to **Desired Age**. Then scrubbing and repeated plays look the same. **[unverified in 5.8; long-standing settings]**
- Fire one-shot flak bursts from **Sequencer Event track** keys, or by keying the system's activation. Don't use random timers.
- If the destruction cache replays events (`bReplayEventsInStaticPoseMode`), break-driven Niagara (through the Chaos Destruction data interface or `OnChaosBreakEvent`) will also fire the same way each time.

---

## 6. Known 5.8 regressions, deprecations and migration notes

| Item | Status | Source |
|---|---|---|
| Niagara system with only stateless emitters fails to save | Reported in 5.8.2, no Epic reply; fix in 5.8.4 unknown | forum |
| Chaos Cache crash during Sequencer playback (UE-356044) | Introduced in 5.7; 5.8 fixes a *spawnable* cache manager EndPlay crash; general fix unverified | forum, 5.8 notes |
| Partial GC plus removal timers loses collision (UE-358545) | Fixes "targeted for 5.8"; avoid timers below 1 s; test | forum, issue tracker |
| Root proxy breaks cache recording | 5.6.1 bug, fix said to be in 5.7 | forum |
| `ImplicitObjectScaled` removed (per-shape scale instead) | 5.8 API change | 5.8 notes |
| Dataflow is production-ready, default template on new GCs | 5.8 | 5.8 notes |
| Niagara Destruction DI spawning at the origin | Fixed in 5.8 | 5.8 notes |
| ChaosCaching plugin still under `Plugins/Experimental` | 5.8 | 5.8 API page |
| Niagara Fluids hidden at Medium scalability | By design (not used by GRAFT) | forum |
| Stateless GPU cost not split per emitter in the Niagara Debugger | Later reportedly fixed; use `stat NiagaraStateless` | forum |

The official 5.8 release notes I could read have no Niagara section, so there may be Niagara changes that aren't listed here.

---

## 7. Cover destruction and EQS (secondary)

No source covered this directly. The following is design guidance and is **[unverified]**:

- Treat each destructible cover piece as an actor with a `UGraftCoverComponent` that EQS generators read. Use a custom generator or `EnvQueryGenerator_ActorsOfClass` plus a test on a "cover valid" flag.
- On `OnChaosBreakEvent` (or when the remaining-mass fraction drops below a threshold), mark the cover invalid. Then broadcast to the AI controllers that are using it, which should **abort the current move and re-run the cover EQS** (a Blackboard key change with an observer abort in the behavior tree, or a StateTree event).
- Navmesh: set GC debris to **not affect navigation** (`CanEverAffectNavigation = false`). Otherwise every piece dirties the navmesh on a 4-core CPU. If a destroyed wall should open a path, put a separate simple **Nav Modifier / blocking volume** on the intact wall and remove it when the wall breaks. Use dynamic navmesh with modifiers only.

---

## Sources

- UE 5.8 release notes: https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-5-8-release-notes
- UE 5.8 release announcement: https://forums.unrealengine.com/t/unreal-engine-5-8-released/2729274
- Dataflow for Destruction quickstart (5.8): https://dev.epicgames.com/documentation/en-us/unreal-engine/dataflow-for-destruction-quickstart
- `UGeometryCollectionComponent` API (5.8): https://dev.epicgames.com/documentation/unreal-engine/API/Runtime/GeometryCollectionEngine/UGeometryCollectionComponent
- `AChaosCacheManager` API (5.8): https://dev.epicgames.com/documentation/unreal-engine/API/Plugins/ChaosCaching/AChaosCacheManager
- Physics field reference guide (5.8): https://dev.epicgames.com/documentation/unreal-engine/reference-guide-for-physics-field-in-unreal-engine
- Physics fields overview: https://dev.epicgames.com/documentation/unreal-engine/overview-of-physics-fields-in-unreal-engine
- Blueprint API (ApplyInternalStrain, CrumbleActiveClusters, SetAnchoredByBox, RemoveAllAnchors): https://dev.epicgames.com/documentation/unreal-engine/BlueprintAPI/ChaosPhysics/ApplyInternalStrain
- GeometryCollection Python API (removal, damage threshold properties): https://dev.epicgames.com/documentation/en-us/unreal-engine/python-api/class/GeometryCollection
- `FGeometryCollectionISMPool`: https://dev.epicgames.com/documentation/unreal-engine/API/Runtime/GeometryCollectionEngine/FGeometryCollectionISMPool
- Niagara lightweight emitters overview: https://dev.epicgames.com/documentation/en-us/unreal-engine/niagara-lightweight-emitters-overview
- Niagara scalability settings (Python API): https://dev.epicgames.com/documentation/en-us/unreal-engine/python-api/class/NiagaraSystemScalabilitySettings
- GPU sprite effect how-to (fixed bounds): https://dev.epicgames.com/documentation/en-us/unreal-engine/how-to-create-a-gpu-sprite-effect-in-niagara-for-unreal-engine
- EQS overview: https://dev.epicgames.com/documentation/en-us/unreal-engine/environment-query-system-in-unreal-engine
- Stateless-only save regression, 5.8.2: https://forums.unrealengine.com/t/niagara-system-failed-to-save-when-containing-only-stateless-emitters-in-ue-5-8-2/2781439
- Niagara Debugger and stateless emitters: https://forums.unrealengine.com/t/niagara-debugger-lightweight-stateless-emitters/2733793
- Niagara Fluids at Medium scalability in 5.8: https://forums.unrealengine.com/t/niagara-fluids-doesnt-seem-to-work-in-ue-5-8/2764942
- Chaos Cache Sequencer crash, 5.7 (UE-356044): https://forums.unrealengine.com/t/crash-when-chaos-cache-is-played-back-through-sequencer/2688547
- Chaos Cache Manager not working in 5.6.1 (root proxy): https://forums.unrealengine.com/t/chaos-cache-manager-not-working-in-5-6-1/2653766
- ChaosCacheManager scrub in Sequencer: https://forums.unrealengine.com/t/chaoscachemanager-scrub-in-sequencer/573181
- Chaos cache playback bug: https://forums.unrealengine.com/t/physics-chaos-cache-playback-bug/2156758
- Fracture with Sequencer tutorial: https://www.versluis.com/2025/06/using-fracture-with-sequencer-in-unreal-engine/
- UE-358545 (removal timers and collision loss): https://issues.unrealengine.com/issue/UE-358545
- Removal-on-break interaction thread: https://forums.unrealengine.com/t/unable-to-interact-with-geometry-collection-after-use-removal-on-break-utilitie/2692833
- Remove On Sleep doesn't prevent frame drops: https://forums.unrealengine.com/t/the-remove-on-sleep-option-in-geometry-collections-does-not-help-prevent-frame-rate-drops/2717395
- Chaos framedrops from jittering debris: https://forums.unrealengine.com/t/chaos-physics-framedrops-every-5-seconds-or-so/733298
- Strain with a small radius has no effect: https://forums.unrealengine.com/t/apply-external-and-internal-strain-doesnt-work-on-small-radius/2617807
- Turning off anchors at runtime: https://forums.unrealengine.com/t/how-to-turn-off-anchor-at-runtime/2332757
- Triggering fields against a GC in C++: https://forums.unrealengine.com/t/triggering-physics-fields-against-a-geometry-collection-in-c/1648054
- Missing Chaos notify events in Blueprint: https://forums.unrealengine.com/t/missing-chaos-notify-events-in-bleuprint/2522612
- Root proxy and ISM rendering for GCs: https://forums.unrealengine.com/t/transparency-with-fractured-meshes-geometry-collection/1980481/7
- GC mesh distance fields: https://forums.unrealengine.com/t/geometry-collection-mesh-distance-fields/2533781
- Houdini Chaos integration (implicit types, size-specific data): https://www.sidefx.com/docs/houdini/unreal/chaosintegration.html
- Refraction on Niagara particles: https://forums.unrealengine.com/t/refraction-not-affecting-particle-system-niagara/485693
- Mesh local distortion in UE5: https://abhishtagatya.github.io/posts/mesh-local-distortion-effect-in-ue5
- Fixed bounds in Niagara: https://forums.unrealengine.com/t/what-does-fixed-bound-do-in-niagara-gpu-emitter-properties/676187/2
- Niagara performance heuristics (community): https://bugnet.io/blog/how-to-fix-unreal-niagara-performance-problems
