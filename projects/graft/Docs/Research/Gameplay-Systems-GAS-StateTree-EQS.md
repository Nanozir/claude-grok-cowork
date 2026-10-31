# Gameplay systems research: GAS, StateTree, EQS, Enhanced Input, tags (UE 5.8.4)

Researched 2026-10-28 for GRAFT. Research only; nothing here is a decision until it lands in `Docs/DECISIONS.md`.

## How this was verified

Web sources on 5.8 are thin. The official 5.8 release notes say nothing about the Gameplay Ability System (GAS), and community write-ups mostly target 5.3 to 5.6. So the main check was the installed engine source at `D:\Epic Games\UE_5.8` (5.8.4). Each claim carries one of these labels:

- **[5.8 source]**: read in the 5.8.4 headers or .cpp files on this machine. Treat it as true for our engine.
- **[5.8 notes]**: stated in the official 5.8 release notes or hotfix threads.
- **[community]**: a forum or tutorial claim. It may be older than 5.8 or anecdotal.
- **[unverified]**: my recommendation or inference, not checked against 5.8. Test it before relying on it.

Summary of what 5.8 changed for these systems:

| System | 5.8 change | Source |
|---|---|---|
| GAS | No headline changes. A few deprecations: `FActiveGameplayEffectHandle` owning-ASC lookups, and the handle-taking overloads in `UAbilitiesGameplayEffectComponent`. The execution calculation API is unchanged. | [5.8 source] |
| StateTree | You can set a tree's start state, including by gameplay tag (searched breadth first). Adds a Compiler Manager and out-of-date flags, queued just-in-time compilation behind cvars (off by default), sturdier property bindings, and Live Coding reinstancing fixes. | [5.8 notes] |
| EQS | Adds `UEnvQuery::bStripFromClientBuilds`. Nothing else. | [5.8 notes] |
| Enhanced Input | Unifies Enhanced Input with Common Input/UI, adds an Input Debugger, and deprecates `UInputTriggerCombo`. | [5.8 notes], [5.8 source] |
| Gameplay Tags | Adds `FindReferencesByTag` to the Gameplay Tags toolset (scripting/editor). | [5.8 notes] |

---

## 1. Gameplay Ability System (GAS)

### 1.1 Setting up `UGraftBodyAttributes`

The 5.8 headers still provide ready-made accessor macros [5.8 source, `AttributeSet.h` lines 428-469]:

- `GAMEPLAYATTRIBUTE_PROPERTY_GETTER`, `GAMEPLAYATTRIBUTE_VALUE_GETTER`, `GAMEPLAYATTRIBUTE_VALUE_SETTER` and `GAMEPLAYATTRIBUTE_VALUE_INITTER`.
- **`ATTRIBUTE_ACCESSORS_BASIC(ClassName, PropertyName)`** bundles all four. Use it rather than copying the old `ATTRIBUTE_ACCESSORS` pattern.
- `GAMEPLAYATTRIBUTE_REPNOTIFY` still exists. GRAFT is single player, so `OnRep_` functions are optional. Add them only if networking ever matters.

```cpp
UCLASS()
class UGraftBodyAttributes : public UAttributeSet
{
    GENERATED_BODY()
public:
    // Shell zones (current + max)
    UPROPERTY(BlueprintReadOnly, Category="Shell") FGameplayAttributeData HelmetShell;
    ATTRIBUTE_ACCESSORS_BASIC(UGraftBodyAttributes, HelmetShell)
    UPROPERTY(BlueprintReadOnly, Category="Shell") FGameplayAttributeData HelmetShellMax;
    ATTRIBUTE_ACCESSORS_BASIC(UGraftBodyAttributes, HelmetShellMax)
    // ... Torso, Spine, ArmL, ArmR the same way
    UPROPERTY(BlueprintReadOnly, Category="Pilot") FGameplayAttributeData PilotVitals;
    ATTRIBUTE_ACCESSORS_BASIC(UGraftBodyAttributes, PilotVitals)
    UPROPERTY(BlueprintReadOnly, Category="Pilot") FGameplayAttributeData PilotVitalsMax;
    ATTRIBUTE_ACCESSORS_BASIC(UGraftBodyAttributes, PilotVitalsMax)

    // Optional meta attribute (not persisted): "IncomingDamage" pattern from Lyra's HealthSet
    // Probably NOT needed here: the exec calc can write zone attributes directly (see 1.2).

    virtual void PreAttributeChange(const FGameplayAttribute& Attribute, float& NewValue) override;   // clamp current to [0, Max]
    virtual void PostGameplayEffectExecute(const FGameplayEffectModCallbackData& Data) override;       // breach detection -> tags/events
};
```

Recommended responsibilities [unverified pattern; standard GAS practice in Lyra and tranek's GASDocumentation]:

- **`PreAttributeChange`** clamps `Zone` to `[0, ZoneMax]`. It also rescales current values when a `*Max` attribute changes. This only clamps the value queries return; the GAS docs warn that it does not stop modifiers from stacking past the max.
- **`PostGameplayEffectExecute`** clamps the base value for real with `SetHelmetShell(FMath::Clamp(...))`. It also detects when a zone crosses to zero, then adds the breach tags and sends the event (see 1.3).
- **Initialization** uses one instant "init" GameplayEffect (GE) with `Override` modifiers. Each magnitude is an `FScalableFloat` that points at a CurveTable row such as `Shell.Helmet.Max`. Every starting value then lives in data. `UAbilitySystemGlobals::InitGlobalData()` now runs automatically on first use, so no manual call is needed [5.8 source, `AbilitySystemGlobals.h:68`].

### 1.2 `UGameplayEffectExecutionCalculation` for a multi-zone armor model

The API is unchanged in 5.8 [5.8 source, `GameplayEffectExecutionCalculation.h`]:

- `DECLARE_ATTRIBUTE_CAPTUREDEF(P)` and `DEFINE_ATTRIBUTE_CAPTUREDEF(S, P, T, B)` are at lines 323 and 327.
- `FGameplayEffectCustomExecutionParameters` provides `GetOwningSpec()`, `GetPassedInTags()` and `AttemptCalculateCapturedAttributeMagnitude(WithBase)`.
- `FGameplayEffectCustomExecutionOutput::AddOutputModifier(FGameplayModifierEvaluatedData)` and `MarkConditionalGameplayEffectsToTrigger()` are both still present.

**How the hit zone reaches the calculation** [unverified recommendation]. Two options, best first:

1. **A dynamic asset tag or SetByCaller on the spec.** The weapon or ability resolves bone → zone through a `UGraftHitZoneMap` data asset (`TMap<FName Bone, FGameplayTag Zone>`). It then tags the spec with `Data.HitZone.ArmL` through `AddDynamicAssetTag` or a SetByCaller tag. The calculation reads the tag from `Spec.GetDynamicAssetTags()`, which is cheap and easy to debug.
2. **The hit result in the effect context.** `FGameplayEffectContext::AddHitResult` stores the hit, and the calculation maps the bone itself. This keeps the mapping in one place, but the calculation then needs the zone map too.

**Armor by damage type.** Keep the numbers out of C++. A Blueprint subclass of the calculation can hold an `EditDefaultsOnly` pointer to a `UGraftDamageTuning` data asset, because execution calculations run off their class default object. The data asset holds `TMap<FGameplayTag DamageType, FZoneArmorRow>`, or names CurveTable rows like `Armor.Kinetic.Helmet`. A separate armor attribute for every zone and damage type would flood the AttributeSet, so avoid that.

```cpp
// Pseudocode – UGraftZoneDamageExec::Execute_Implementation
const FGameplayEffectSpec& Spec = Params.GetOwningSpec();
const FGameplayTag Zone      = FindZoneTag(Spec.GetDynamicAssetTags());        // Data.HitZone.*
const FGameplayTag DmgType   = FindDamageTypeTag(Spec.GetDynamicAssetTags());  // Damage.Type.*
const float Raw              = Spec.GetSetByCallerMagnitude(TAG_Data_Damage, /*warn*/true, 0.f);

FAggregatorEvaluateParameters Eval; Eval.SourceTags = Spec.CapturedSourceTags.GetAggregatedTags();
                                    Eval.TargetTags = Spec.CapturedTargetTags.GetAggregatedTags();
float ZoneShell = 0.f;
Params.AttemptCalculateCapturedAttributeMagnitude(ZoneCaptureDef(Zone), Eval, ZoneShell);   // captured from Target, bSnapshot=false

const float ArmorMul = Tuning->GetArmorMultiplier(DmgType, Zone);   // data asset / curve table
const float ShellDmg = Raw * ArmorMul;

if (ZoneShell > 0.f)
{
    const float Absorbed = FMath::Min(ZoneShell, ShellDmg);
    Out.AddOutputModifier(FGameplayModifierEvaluatedData(ZoneAttribute(Zone), EGameplayModOp::Additive, -Absorbed));
    // Overflow past 0 is a design decision: carry the overflow to pilot, or drop it. Log in DECISIONS.md.
}
else // zone breached: route through to the pilot with a multiplier
{
    const float PilotMul = Tuning->GetBreachPilotMultiplier(Zone);   // data, not a constant
    Out.AddOutputModifier(FGameplayModifierEvaluatedData(UGraftBodyAttributes::GetPilotVitalsAttribute(),
                                                         EGameplayModOp::Additive, -Raw * PilotMul));
}
```

Notes:
- Capture all five zone attributes from the **Target** with `bSnapshot=false`, and register them in `RelevantAttributesToCapture` in the constructor. The calculation then picks the one it needs [standard pattern].
- Execution calculations only run on **Instant** or **Periodic** GEs [GAS docs; behavior unchanged in 5.8 source as far as checked]. Damage GEs should therefore be Instant.
- Unit-test the calculation with an automation test. Apply a GE to a test actor that has an ASC, then assert the zone and pilot values. That fits BUILD-PLAN's rule of headless verification.

### 1.3 Breach state, regen gating, and GameplayCues

Treat a breach as **gameplay state, expressed as tags**. A cue is cosmetic only. Cues can be suppressed, batched or skipped, and code should never read them [unverified as a 5.8-specific rule; long-standing GAS guidance].

| Effect | Gameplay mechanism | Cosmetic cue |
|---|---|---|
| Arm breach: recoil and sway | When `ArmL`/`ArmR` hits 0, `PostGameplayEffectExecute` applies an Infinite GE `GE_Breach_ArmL`. It grants tag `State.Breach.ArmL` through `UTargetTagsGameplayEffectComponent`. The weapon component reads the tag and pulls recoil and sway multipliers from the weapon tuning data asset. | `GameplayCue.Breach.ArmL` (sparks, servo-whine loop). A `AGameplayCueNotify_Looping` fits. |
| Helmet breach: visor crack | GE `GE_Breach_Helmet` grants `State.Breach.Helmet`. | `GameplayCue.Breach.Helmet` is an `AGameplayCueNotify_Looping`. `OnApplication` pushes a crack material or HUD widget, and `OnRemoval` clears it on repair. |
| Spine breach: no regen | GE `GE_Breach_Spine` grants `State.Breach.Spine`. The regen GE refuses to run while that tag is present. | Optional `GameplayCue.Breach.Spine` |

Cue classes present in 5.8 [5.8 source]: `UGameplayCueNotify_Static`, `UGameplayCueNotify_Burst`, `AGameplayCueNotify_Actor`, `AGameplayCueNotify_Looping` (`OnApplication`/`OnRecurring`/`OnRemoval`), `AGameplayCueNotify_BurstLatent`, `UGameplayCueNotify_HitImpact`. Use Burst for the one-shot breach moment (a crack sound plus a flash) and Looping for the state that persists.

**Regen gating** [unverified design; every component it uses exists in 5.8 source]:

- **Regen effect:** a periodic Infinite GE, `GE_ShellRegen`. Its Period comes from a `FScalableFloat` backed by a CurveTable, and its magnitude per zone comes from data.
- **Gating:** `UTargetTagRequirementsGameplayEffectComponent` does the gating through its Ongoing tag requirements. In 5.3+ these moved from the GE body into GE components, and the component exists in 5.8. Set Ignore tags to `State.Regen.Blocked.DamagePause`, `State.Breach.Spine` and `State.Moving.Fast`. While any of them is present, the GE is **inhibited**: it stays applied but does not tick.
- **Resuming:** `PeriodicInhibitionPolicy` (`EGameplayEffectPeriodInhibitionRemovedPolicy`, [5.8 source `GameplayEffect.h:737`]) controls whether the period timer resets when the inhibition lifts. "Reset period" gives the cleanest "3 s after the last hit" feel.
- **The 3-second pause:** every damage application also applies `GE_RegenDamagePause`, a Duration GE whose 3 s duration comes from CurveTable or data. It grants `State.Regen.Blocked.DamagePause`. Set the stacking to aggregate-by-target with a stack limit of 1 and `StackDurationRefreshPolicy = RefreshOnSuccessfulApplication`, so each hit restarts the 3 s. Add the pause GE as an extra effect on the damage GE through `UAdditionalEffectsGameplayEffectComponent`, so they cannot drift apart.
- **Velocity:** the character checks `Velocity.Size()` against a threshold from the tuning asset, either on tick or on a short timer. When the result changes, it adds or removes the loose tag `State.Moving.Fast` with `AddLooseGameplayTag`/`RemoveLooseGameplayTag`. Do this only when the result changes, not every frame.

### 1.4 Driving ability tuning from data, not C++ constants

These work in 5.8 [standard; types confirmed present in 5.8 source]:

- **`FScalableFloat`** is `Value * Curve[Level]` with an optional CurveTable row. Put it on GE modifiers, durations and periods. You can also put `UPROPERTY(EditDefaultsOnly) FScalableFloat` fields on a `UGameplayAbility` subclass, for example `ChargeDistance` or `SlamRadius` on `UGraftGA_GroundSlam`.
- **CurveTables** import from CSV or JSON and reimport without a C++ rebuild. Name rows like `Ability.GroundSlam.Radius`, `Ability.Charge.Speed` and `Ability.EchoPulse.Range`. One table per system keeps the diffs readable.
- **A `UPrimaryDataAsset` for each ability** (`UGraftAbilityTuning`) holds anything that is not a curve: GE classes, cue tags, montage references, and EQS or trace profiles. The ability holds a `TObjectPtr<UGraftAbilityTuning>`.
- **SetByCaller** moves runtime numbers (charge distance travelled, slam fall height) from the ability into the GE spec without a tunable value ever living in code: `Spec->SetSetByCallerMagnitude(TAG_Data_Damage, Tuning->Damage.GetValueAtLevel(Level))`.
- Automation tests can load the CurveTable and assert that each row exists. This catches renamed rows, which otherwise fail silently by falling back to `Value` only.

### 1.5 5.8 GAS deprecations to avoid [5.8 source]

- `FActiveGameplayEffectHandle`: the global map from handle to owning ASC is gone. Lookups that go through it are deprecated ("We no longer use a global TMap to get the Owning ASC"). Keep your own ASC pointer instead of resolving one from a handle.
- The `FActiveGameplayEffectHandle` default-construct path is deprecated in favor of `GenerateNewHandle` or `GetInstantExecutedHandle`.
- `UAbilitiesGameplayEffectComponent` callbacks now take `FActiveGameplayEffect` rather than a handle.
- These carry over from 5.7: `UGameplayEffect::StackingType` is becoming private (use `GetStackingType()`), and a couple of ASC tag-replication helpers are deprecated.

---

## 2. StateTree and GameplayStateTree

### 2.1 What exists in 5.8 [5.8 source]

**Plugins.** `StateTree` is the core. `GameplayStateTree` holds the actor components and the AI tasks; enable it. `GameplayInteractions` adds Smart Object and montage tasks.

**Components and schemas** (`GameplayStateTree/.../Components/`):
- `UStateTreeComponent` derives from `UBrainComponent` and uses `UStateTreeComponentSchema`. Its API covers `StartLogic` / `StopLogic` / `RestartLogic` / `PauseLogic`, `SetStateTree`, `SetStateTreeReference` and `SetStartLogicAutomatically`. It also has `SendStateTreeEvent(FGameplayTag, Payload, Origin)`, `Add/RemoveLinkedStateTreeOverrides(StateTag, Reference)`, and a scheduled-tick path (`ScheduleNextTick`, `ConditionalEnableTick`, `DisableTick`).
- `UStateTreeAIComponent` goes on the **AIController**. Its schema is `UStateTreeAIComponentSchema` (display name "StateTree AI Component"), which guarantees an `AAIController` context with a configurable `AIControllerClass`, plus the Actor context for the pawn.

**Node base types** (C++ `USTRUCT`s, cheaper than Blueprint nodes):
- Tasks: `FStateTreeTaskCommonBase`.
- Conditions: `FStateTreeConditionCommonBase`.
- Evaluators: `FStateTreeEvaluatorCommonBase`. These are global data providers.
- Considerations: `FStateTreeConsiderationCommonBase`, used by utility selection.
- Property functions: `FStateTreePropertyFunctionCommonBase`.
- AI-specific bases: `FStateTreeAITaskBase` / `FStateTreeAIActionTaskBase` in `Tasks/StateTreeAITask.h`, and `FStateTreeAIConditionBase`.

**Blueprint bases**: `UStateTreeTaskBlueprintBase`, `UStateTreeConditionBlueprintBase`, `UStateTreeEvaluatorBlueprintBase`, `UStateTreeConsiderationBlueprintBase`.

**Built-in nodes:**

| Kind | Struct | Editor name |
|---|---|---|
| Task | `FStateTreeMoveToTask` | "Move To" |
| Task | `FStateTreeRunEnvQueryTask` | "Run Env Query". Outputs a Vector or Actor (or an array) through a `FStateTreePropertyRef`. Takes a `QueryConfig` of `FAIDynamicParam`s and a `RunMode`. |
| Task | `FStateTreeRunParallelStateTreeTask` | Runs another tree in parallel. |
| Condition | `FStateTreeCompareInt/Float/Bool/Enum/Distance/NameCondition` | |
| Condition | `FStateTreeRandomCondition` | |
| Condition | `FStateTreeObjectIsValid/Equals/IsChildOfClassCondition` | |
| Condition | `FGameplayTagSingleMatchCondition`, `FGameplayTagMatchCondition`, `FGameplayTagContainerMatchCondition`, `FGameplayTagQueryCondition` | |
| Consideration | `FStateTreeConstantConsideration`, `FStateTreeFloatInputConsideration`, `FStateTreeEnumInputConsideration` | Input considerations use response curves. |
| GameplayInteractions | Play Anim Montage, Find Slot, Play Contextual Anim, and others | |

Other built-in nodes (Delay, Debug Text, and so on) exist but were not catalogued here [unverified list].

**State model** [5.8 source, `StateTreeTypes.h`]:
- `EStateTreeStateType` is `State`, `Group`, `Linked`, `LinkedAsset` or `Subtree`.
- `EStateTreeStateSelectionBehavior` is `None`, `TryEnterState`, `TrySelectChildrenInOrder`, `TrySelectChildrenAtRandom`, `TrySelectChildrenWithHighestUtility`, `TrySelectChildrenAtRandomWeightedByUtility` or `TryFollowTransitions`.
- `EStateTreeTransitionTrigger` is `OnStateCompleted`, `OnStateSucceeded`, `OnStateFailed`, `OnTick`, `OnEvent` or `OnDelegate`. Transitions also carry a priority (`EStateTreeTransitionPriority`).

**New in 5.8** [5.8 notes]:
- A tree can define its starting state, and the start state can be overridden by gameplay tag (searched breadth first).
- A Compiler Manager arrives, and the editor flags out-of-date trees.
- Queued compilation can run just in time on first use. It is off by default; the cvars are `StateTree.Compiler.EnableQueuedCompilationOnAssetLoad` and `StateTree.Compiler.EnableQueuedCompilationWhenAssetDirty`.
- A new cvar controls whether failed-to-resolve binding paths are removed automatically (default true).
- Shared instance data is no longer allocated when it is empty.

### 2.2 Wiring to the AIController and Pawn

The usual setup [5.8 source for the types; [community] for the steps]:

1. Write `AGraftEnemyController : AAIController` with a `UStateTreeAIComponent` (a default subobject).
2. Create the StateTree asset with the **StateTree AI Component** schema. Set `AIControllerClass` to the controller class so tasks can bind to its properties. The Actor context is the controlled pawn.
3. The component starts automatically when `bStartLogicAutomatically` is true. The AI component may need a manual `StartLogic()` after possession. One community guide (5.4.2) says auto-start "does nothing" for the AI component [community]. Calling `StartLogic()` from `OnPossess` is the safe choice. Verify the behavior in 5.8.
4. Perception (`UAIPerceptionComponent` on the controller) feeds an **evaluator** or a global task that exposes `TargetActor`, `LastKnownLocation` and similar values. States bind to those values.
5. Gameplay code talks to the tree through **events**: `StateTreeAIComponent->SendStateTreeEvent(TAG_AI_Event_CoverLost)`. States react with `OnEvent` transitions. Prefer this to polling with `OnTick` transitions.

### 2.3 Known gotchas (5.7 to 5.8)

- **Tick cost.** A 5.7 benchmark found StateTree ticks every frame, using up to 18 times the CPU of a Behavior Tree at 400 NPCs [community]. The 5.8 component has scheduled-tick support (`ScheduleNextTick`). Event-driven transitions and tasks that do not need ticking let it sleep. GRAFT's encounter sizes are small, but the dev PC has 4 cores, so profile with `stat statetree` or Insights [unverified that this stat exists].
- **Spurious completion.** A 5.8 bug report says a state whose tasks are all marked as not affecting completion can complete as Succeeded on entry, intermittently, and fall back to Root [community, forum]. Keep at least one task in each state that does count toward completion.
- **Linked-asset parameter overrides** revert to defaults when a subtree completes and re-enters in the same frame. Reported in 5.7 and still present in the 5.8 preview [community].
- **5.7 to 5.8 upgrade.** One report says child-state transitions failed with "Could not trigger completion transition, jump back to root state". It was reportedly fixed by 5.8.1 or 5.8.2 [community]. We are on 5.8.4.
- Long-running tasks must return `Running` from `EnterState`. Returning `Succeeded` immediately completes the state.
- Recompile trees after changing C++ node structs. 5.8 flags out-of-date assets.
- Events are consumed when they trigger a transition, so two transitions cannot both fire on one event unless that is configured.

### 2.4 Morale as StateTree states (Steady, Shaken, Broken, Surrendered)

No official morale example exists. This is the common pattern, synthesized [unverified as an "official" approach]:

**Where the number lives.** Morale is a numeric value: a GAS attribute `Morale` on the enemy's own ASC, or a float on a `UGraftMoraleComponent`. Morale inputs (squadmate killed, GRAFT-14 roar or Echo Pulse, suppression, an officer nearby) are data-driven GEs or events.

**Tier conversion.** A small C++ function turns the value into a tier, using **hysteresis** (separate enter and exit thresholds, from data) so the AI does not flap at a boundary. When the tier changes, it does two things:

- It sets the tag `AI.Morale.Shaken` (or the matching tier tag) through a GE or a loose tag.
- It sends the StateTree event `AI.Event.MoraleChanged`.

**Tree shape:**

```
Root  (TrySelectChildrenInOrder)
├─ Surrendered   Enter condition: GameplayTagMatch(AI.Morale.Surrendered)   -- terminal; no transitions out
├─ Broken        Enter condition: GameplayTagMatch(AI.Morale.Broken)        -- flee / cower subtree
├─ Shaken        Enter condition: GameplayTagMatch(AI.Morale.Shaken)        -- cautious combat subtree (longer cover dwell, blind fire)
└─ Steady        (no condition, fallback)                                   -- full combat subtree
Transition on each of Broken/Shaken/Steady:  OnEvent(AI.Event.MoraleChanged) -> Root   (re-select)
```

- Order the children from most severe to least, and use `TrySelectChildrenInOrder` so the first state whose enter condition passes wins.
- Make each tier's combat behavior a `Linked` or `LinkedAsset` subtree. Shared pieces (FindCover, Shoot) are then authored once.
- Tag conditions need a tag container as input. StateTree has **no built-in node that reads an ASC's owned tags** [5.8 source: the tag conditions take bound containers]. So write a tiny evaluator, `FGraftASCTagsEvaluator`, that copies `ASC->GetOwnedGameplayTags()` into an output `FGameplayTagContainer` the conditions bind to. Or compare the tier enum with `FStateTreeCompareEnumCondition`.
- The alternative is utility selection: `TrySelectChildrenWithHighestUtility` with `FStateTreeFloatInputConsideration` on Morale. It suits soft blending, but discrete tiers with events are easier to debug and match the GDD's named states.

---

## 3. Environment Query System (EQS)

### 3.1 Node vocabulary in 5.8 [5.8 source, `AIModule/Classes/EnvironmentQuery`]

- **Generators**: `ActorsOfClass`, `Composite`, `Cone`, `CurrentLocation`, `Donut`, `OnCircle`, `PathingGrid`, `PerceivedActors`, `ProjectedPoints`, `SimpleGrid`, `BlueprintBase`.
- **Tests**: `Distance`, `Dot`, `GameplayTags`, `Overlap`, `Pathfinding`, `PathfindingBatch`, `Project`, `Random`, `Trace`, `Volume`.
- **Contexts**: `Querier`, `Item`, `NavigationData`, `BlueprintBase`.

Every test's `ScoringFactor`, `FloatValueMin/Max`, `ReferenceValue` and `ScoreClampMin/Max` are `FAIDataProviderFloatValue` [5.8 source, `EnvQueryTest.h`]. That means they can be bound to **query params** that the StateTree `Run Env Query` task supplies through `QueryConfig`. This matters for the tag-based weighting in Section 5.

### 3.2 Cover against a 2.4 m target

`UEnvQueryTest_Trace` has `TraceData` (`FEnvTraceData`: channel, shape Line/Box/Sphere/Capsule, extents), `TraceFromContext`, `ItemHeightOffset`, `ContextHeightOffset` and `Context` [5.8 source]. The .cpp adds `ItemHeightOffset` to the item location and `ContextHeightOffset` to each context location's Z. Nothing more is applied [5.8 source, `EnvQueryTest_Trace.cpp` lines 90, 95].

Which means:
- **Context = the player actor.** The location is the actor location, which is the **capsule center**. For a 2.4 m GRAFT-14 with a 120 cm capsule half-height, that point is about 1.2 m above the floor. To trace from GRAFT-14's eye or weapon (about 2.2 m), set `ContextHeightOffset ≈ +100 cm`. Read the real eye height from the pawn rather than guessing, and expose it as a query param.
- **Items from navmesh generators** (`SimpleGrid`, `Donut`, `PathingGrid`, `OnCircle` with projection) sit at navmesh height, roughly the floor. `ItemHeightOffset` is measured from there. For a crouched Tamri soldier's head use about 100 cm, standing about 165 cm (data, not constants).
- **The tall shooter makes low cover weaker.** GRAFT-14 looks down on the enemy. Picture a 1.1 m wall with the enemy 1 m behind it and GRAFT-14 15 m away. The eye-to-head line crosses the wall at about 108 cm, so it barely protects, and it fails once GRAFT-14 closes in. The query needs these tests:
  1. **Trace, filter "hit = true"**: item at crouch height to the player's eye at +100. The point is hidden when crouched.
  2. **Distance to the cover object, scored inverse** (prefer hugging cover). Or generate around cover actors with `ActorsOfClass` plus `OnCircle`.
  3. **Optional: Trace at standing height, wanting no hit.** This marks a "peek" spot that can return fire.
  4. **Distance to the player.** Penalize closeness, because the angle problem grows as GRAFT-14 closes.
  5. **Pathfinding or PathfindingBatch**: the point must be reachable. `PathfindingBatch` is cheaper for many items.
- Run the hide-trace in **scoring mode plus a loose filter** rather than a hard filter, so the query does not fail outright in open ground [community advice].
- A Box or Capsule trace (thin X/Y extent) is more robust than a Line trace against gaps in broken debris [unverified].

### 3.3 Destructible cover and re-querying

Cheapest-first options [unverified pattern; delegates confirmed in 5.8 source]:

1. **Event-driven (primary).** The cover object reports its own loss.
   - For a Chaos Geometry Collection: set `bNotifyBreaks = true` and bind `OnChaosBreakEvent`, or `OnRootBreakEvent` when you only care about the first break. If pieces get removed, `bNotifyRemovals` with `OnChaosRemovalEvent` is the hook. All exist in 5.8 [5.8 source, `GeometryCollectionComponent.h`].
   - For a plain actor, bind `AActor::OnDestroyed`.
   - On the event, a `UGraftCoverSubsystem` (a world subsystem holding cover-object → occupant AI) calls `SendStateTreeEvent(AI.Event.CoverLost)` on every AI using that cover. The `InCover` state transitions `OnEvent(AI.Event.CoverLost)` to `FindCover`, which runs `Run Env Query` again.
2. **Validation tick (safety net).** A cover object can survive yet stop blocking: chipped, or GRAFT-14 flanks. So a light check every 0.5 to 1 s does one line trace from GRAFT-14's eye to the occupant's head and sends the same event if it is clear. One trace per AI is far cheaper than re-running the full EQS query on a timer.
3. **Periodic full re-query (avoid as the main path).** Use a slow cadence only as a "find better cover" behavior, not for detecting loss.

Related points:
- **Navmesh.** Destruction changes walkable space. Set Runtime Generation to `Dynamic` or `DynamicModifiersOnly` on the RecastNavMesh; rebuild cost on the 4-core Ryzen is a real concern, so test it. 5.8 adds per-mesh walkable areas and area costs through a NavCollision flag and area class [5.8 notes], which helps mark debris as high-cost.
- **Reservation.** Keep claimed cover points in the subsystem, and add a custom EQS test (or Blueprint test) that rejects claimed points. This stops two AIs from picking the same spot.
- **Server-only stripping.** `UEnvQuery::bStripFromClientBuilds` is new in 5.8 and irrelevant for single player. Leave it off.

---

## 4. Enhanced Input in 5.8

Basics are unchanged:
- `UInputAction` assets (value type Bool, Axis1D, Axis2D or Axis3D) plus `UInputMappingContext` assets.
- Add contexts with `UEnhancedInputLocalPlayerSubsystem::AddMappingContext(IMC, Priority)`.
- Bind in `SetupPlayerInputComponent` with `UEnhancedInputComponent::BindAction(IA, ETriggerEvent::Triggered, this, &Fn)`.
- Use triggers (`Pressed`, `Hold`, `Tap`, `Released`, `Chorded`) and modifiers (`Negate`, `Swizzle`, `DeadZone`, `Scalar`) in the assets, not in code.

5.7 and 5.8 changes worth knowing [5.8 source unless noted]:
- **`UInputMappingContext::Mappings` is deprecated (5.7).** Use **`DefaultKeyMappings`** (`FInputMappingContextMappingData`) and the optional per-profile `MappingProfileOverrides` (`TMap<FString, FInputMappingContextMappingData>`). Code that reads `GetMappings()` on old data should be checked.
- **`UInputTriggerCombo` is deprecated in 5.8**, along with `FInputComboStepData` and `FInputCancelAction`. Do not build Charge or Ground Slam input on combo triggers. Use separate actions with `Hold`/`Pressed` triggers, or sequence the logic in the ability.
- **Input mode filtering.** Each IMC has `InputModeFilterOptions` and an `InputModeQueryOverride` (`FGameplayTagQuery`). These only count when `bEnableInputModeFiltering` is on in `UEnhancedInputDeveloperSettings`. They tie into the 5.8 unification of Enhanced Input with Common Input/UI [5.8 notes], which means no duplicate data assets for UI input. Useful for menu and gameplay switching.
- **`RegistrationTrackingMode = CountRegistrations`** on an IMC keeps it applied until it has been removed as many times as it was added. Good when an ability and a vehicle or turret both add the same IMC.
- **Input Debugger** for Enhanced Input [5.8 notes].
- `UEnhancedInputUserSettings` (rebinding and key profiles) moved profile IDs to strings in 5.6. Use the `FString` overloads.
- **Gotchas [community]:**
  - Add mapping contexts in `BeginPlay` or `PawnClientRestart` on the local player, not too early. One report says the subsystem is not ready in `InitInputSystem` in 5.6+.
  - In 5.8, input mode and mouse capture changed. One report says it took a double click to return to game mode. Test focus after menus.
  - Legacy Action/Axis mappings are reported as deprecated in 5.8. GRAFT should use Enhanced Input only.

GAS link: bind each `UInputAction` to an ability by **input tag**, Lyra-style: a data asset maps `UInputAction` to `InputTag.Ability.Charge`, and the ASC activates abilities whose spec has that tag in its dynamic tags. This keeps the ability ↔ input mapping in data [unverified for 5.8, a standard pattern].

---

## 5. Gameplay tags for AI traits: `AI.Trait.Tactical` and "prefers breached zones"

EQS scores **locations and actors**, not hit zones on one actor. So choosing which zone to aim at is better done in a StateTree task. Use EQS only if zones are modeled as items.

**Recommended pattern** [unverified synthesis]:

1. **Traits are tags on the enemy.** `AI.Trait.Tactical` is granted by the enemy archetype's startup GE, or set on the pawn through `IGameplayTagAssetInterface`.
2. **Breach state is tags on the player's ASC.** These are `State.Breach.Helmet/Torso/Spine/ArmL/ArmR`, as in 1.3, and they are public state the AI can read.
3. **The weights are data.** A `UGraftAITargetingProfile` data asset holds:
   - a base weight per zone (Torso high, Helmet lower, since it is harder to hit);
   - `BreachedZoneMultiplier` (for example 1.0 default);
   - `TMap<FGameplayTag Trait, FTraitTargetingMod>`, where `AI.Trait.Tactical` sets the breached multiplier to, say, 3.0.

   The enemy archetype references the profile.
4. **A StateTree task `FGraftPickAimZoneTask`** runs on each new burst or target. For each zone, `w = BaseWeight[zone] × (PlayerHasTag(State.Breach.zone) ? BreachedMul(traits) : 1)`. It then does a weighted random pick, outputs the zone's socket name or offset, and the aim/shoot task binds to that output. Five items do not justify EQS overhead.
5. **If EQS is wanted** (for example to pick the firing **position** that exposes a breached zone, like flanking to hit a breached spine on GRAFT-14's back):
   - Use a custom test, `UEnvQueryTest_ExposesBreachedZone`, that traces from the item to the breached zone's socket.
   - Bind its `ScoringFactor` to a query param, `BreachBias`.
   - The StateTree `Run Env Query` task fills `QueryConfig` from an evaluator that reads the trait: 0 for non-tactical AI, and the profile value for `AI.Trait.Tactical`. One query asset then serves every archetype.
6. **Built-in tag nodes** to know:
   - `UEnvQueryTest_GameplayTags` (`TagQueryToMatch`, `bSearchComponentsForTags`, `bRejectIncompatibleItems`) filters or scores actor items whose actor (or a component) implements `IGameplayTagAssetInterface`. Use it for cover actors tagged `Cover.Destructible` or `Cover.Hard`, for instance.
   - StateTree's `FGameplayTagMatchCondition` and `FGameplayTagQueryCondition` gate whole states on traits. For example, a "Flank to breached zone" state is enterable only when the AI has `AI.Trait.Tactical` and the player has any `State.Breach.*`.
   - Keep in mind that StateTree needs an evaluator to expose ASC tags (see 2.4).

Name note: the names `UGraftHitZoneMap`, `UGraftDamageTuning`, `UGraftAITargetingProfile`, `UGraftCoverSubsystem`, `UGraftMoraleComponent`, `FGraftASCTagsEvaluator`, `FGraftPickAimZoneTask`, `UEnvQueryTest_ExposesBreachedZone` and every new tag above (`State.Breach.*`, `State.Regen.Blocked.DamagePause`, `State.Moving.Fast`, `AI.Morale.*`, `AI.Event.*`, `Data.HitZone.*`, `Damage.Type.*`, `Cover.*`) are suggestions. Log the ones adopted in `Docs/DECISIONS.md`.

---

## 6. Open items to verify in-engine (not confirmable from docs)

1. Does `UStateTreeAIComponent` auto-start in 5.8, or does it need `StartLogic()` after `OnPossess`?
2. The 5.8 StateTree spurious-completion bug: is it fixed in 5.8.4? None of the 5.8.3 or 5.8.4 hotfix notes mention StateTree.
3. Navmesh rebuild cost on dynamic destruction on the Ryzen 3 3200G.
4. Whether a `stat` group or Insights channel exists for StateTree cost in 5.8. Use Unreal Insights regardless.
5. `PeriodicInhibitionPolicy` feel for the regen restart, which only playtest can judge.

---

## Sources

Local engine source (primary, 5.8.4):
- `D:\Epic Games\UE_5.8\Engine\Plugins\Runtime\GameplayAbilities\Source\GameplayAbilities\Public\` (`AttributeSet.h`, `GameplayEffectExecutionCalculation.h`, `GameplayEffect.h`, `ActiveGameplayEffectHandle.h`, `AbilitySystemGlobals.h`, `GameplayCueNotify_*.h`, `GameplayEffectComponents\*`)
- `D:\Epic Games\UE_5.8\Engine\Plugins\Runtime\StateTree\Source\StateTreeModule\Public\` (`StateTreeTypes.h`, `Conditions\*`, `Considerations\*`)
- `D:\Epic Games\UE_5.8\Engine\Plugins\Runtime\GameplayStateTree\Source\GameplayStateTreeModule\Public\` (`Components\*`, `Tasks\*`)
- `D:\Epic Games\UE_5.8\Engine\Source\Runtime\AIModule\Classes\EnvironmentQuery\` and `Private\EnvironmentQuery\Tests\EnvQueryTest_Trace.cpp`
- `D:\Epic Games\UE_5.8\Engine\Plugins\EnhancedInput\Source\EnhancedInput\Public\` (`InputMappingContext.h`, `InputTriggers.h`, `EnhancedInputModule.h`)
- `D:\Epic Games\UE_5.8\Engine\Source\Runtime\Experimental\GeometryCollectionEngine\Public\GeometryCollection\GeometryCollectionComponent.h`

Official:
- UE 5.8 release notes: https://dev.epicgames.com/documentation/unreal-engine/unreal-engine-5-8-release-notes
- UE 5.8 released (forum): https://forums.unrealengine.com/t/unreal-engine-5-8-released/2729274
- 5.8.3 hotfix: https://forums.unrealengine.com/t/5-8-3-hotfix-released/2833315
- 5.8.4 hotfix: https://forums.unrealengine.com/t/5-8-4-hotfix-released/2842775
- `UStateTreeAIComponentSchema` API: https://dev.epicgames.com/documentation/unreal-engine/API/Plugins/GameplayStateTreeModule/UStateTreeAIComponentSchema
- `UStateTreeAIComponent` API: https://dev.epicgames.com/documentation/unreal-engine/API/Plugins/GameplayStateTreeModule/UStateTreeAIComponent
- GameplayStateTreeModule API: https://dev.epicgames.com/documentation/unreal-engine/API/Plugins/GameplayStateTreeModule
- `UEnvQueryTest_Trace` API: https://dev.epicgames.com/documentation/unreal-engine/API/Runtime/AIModule/UEnvQueryTest_Trace
- EQS generators reference: https://dev.epicgames.com/documentation/unreal-engine/eqs-node-reference-generators-in-unreal-engine
- `UGameplayEffectExecutionCalculation::Execute`: https://dev.epicgames.com/documentation/unreal-engine/API/Plugins/GameplayAbilities/UGameplayEffectExecutionCalculat-/Execute
- `FScalableFloat` API: https://dev.epicgames.com/documentation/unreal-engine/API/Plugins/GameplayAbilities/FScalableFloat

Community (version-flagged above):
- tranek GASDocumentation: https://github.com/tranek/GASDocumentation
- GAS reference, ScalableFloat: https://gas-reference.pages.dev/reference/scalable-float/
- Execution calculation notes: https://zomgmoz.tv/unreal/Gameplay-Ability-System/Gameplay-Effect-Execution-Calculation
- StateTreeAIComponent notes (manual start, 5.4.2): https://www.zomgmoz.tv/unreal/State-Tree/StateTreeAIComponent
- 5.8 StateTree spurious completion: https://forums.unrealengine.com/t/ue-5-8-statetree-a-state-with-tasks-all-marked-as-not-affecting-completion-may-incorrectly-complete-as-succeeded/2740370
- Linked asset parameter overrides revert: https://forums.unrealengine.com/t/statetree-linked-asset-state-parameter-overrides-revert-to-default-values-when-the-subtree-completes-and-re-enters-in-the-same-frame/2730236
- Transitions failing after upgrade: https://forums.unrealengine.com/t/state-tree-transitions-failing-when-parent-state-has-a-task/2746724
- StateTree vs BehaviorTree performance (5.7): https://forums.unrealengine.com/t/statetree-performance-vs-behaviortree/2705328
- StateTree utility AI (5.5): https://lilys.ai/ar/notes/state-trees-in-ue5-20251021/utility-ai-state-trees-unreal-55
- EQS trace test questions: https://forums.unrealengine.com/t/eqs-trace-test-questions/611524
- EQS cover generator thread: https://forums.unrealengine.com/t/cover-generator/87442/42
- UInputTriggerCombo deprecated: https://forums.unrealengine.com/t/ue-deprecated-5-8-uinputtriggercombo-has-been-deprecated/2723141
- 5.8 input system changes: https://forums.unrealengine.com/t/cherry-picking-5-8-input-system-changes/2729847
- Enhanced Input not working (mapping context timing): https://forums.unrealengine.com/t/enhanced-input-system-not-working/2763463
- 5.8 preview thread (input mode regressions): https://forums.unrealengine.com/t/unreal-engine-5-8-preview/2721597?page=4
