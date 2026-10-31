# Cross-doc tensions

Each research doc in this folder was written and fact-checked independently. This note is the pass across all of them looking for recommendations that conflict once combined. These are not decisions — if any gets adopted, log it in `Docs/DECISIONS.md`.

## 1. Nanite streaming pool is double-booked

- `Performance-and-Scalability.md` (Section 2.3, "VRAM budget") sizes the Nanite streaming pool (512 MB default, recommends tightening to 256 MB on Medium) assuming Nanite is used only for the BUILD-PLAN-stated scope: environment kit pieces. Its conclusion — "right at the edge of 4 GB" — is calculated against that single consumer.
- `Destruction-and-VFX.md` (Section 1.4, "Rendering") separately recommends rendering fractured Geometry Collection debris through Nanite, since broken GC pieces have no LODs otherwise and Nanite is "the LOD answer if the project uses Nanite."
- Neither doc accounts for both consumers sharing the same pool. If destructible debris also goes through Nanite, the performance doc's "right at the edge" budget likely goes over, not just gets tight.
- **Action for the lead:** decide whether destructible GC pieces use Nanite at all (BUILD-PLAN's own "Nanite: environment kit pieces only" line already reads as "no" — the destruction doc's suggestion may be out of scope). If they do, re-run the VRAM budget with both consumers before shipping Medium settings. Log the choice in `Docs/DECISIONS.md`.

## 2. Chaos break spike and AI cover re-query land on the same frame

- `Destruction-and-VFX.md` (Section 1.4, "Physics thread") warns that several 300-piece Geometry Collections breaking in the same second will spike the frame on the 4-core Ryzen 3 3200G, and recommends staggering breaks.
- `Gameplay-Systems-GAS-StateTree-EQS.md` (Section on "Destroyed cover") recommends an event-driven path: a Chaos break event tells a cover subsystem, which immediately sends a "cover lost" event to every AI using that cover, triggering an EQS re-query.
- These are the same event, triggered by the same destruction moment, landing on the same game thread — a physics-cost spike and an AI-cost spike at once, on a CPU the performance doc separately found has only 3 task-worker threads total and no spare core (`Performance-and-Scalability.md` Section 0.7). None of the three docs prices the combined cost.
- **Action for the lead:** when profiling a combat beat with destructible cover, specifically test the worst case — a Hammer Crew's cover breaking while several Riflemen re-query — not just destruction alone or AI alone. Consider deferring the EQS re-query by a frame or two (spread across several ticks) rather than firing it synchronously off the break event.

## Not a contradiction, just worth naming consistently

"Breach" means two different things across the docs: the body-attribute system's zone breach (`State.Breach.ArmL` etc., shell hitting zero — GAS doc) and Chaos's "break" event on destructible geometry (`OnChaosBreakEvent` — destruction doc). They're spelled differently (Breach vs Break) but close enough that a tag or variable name could collide if typed carelessly. No action needed beyond keeping the spelling distinction deliberate when these get implemented.
