# paranoia-paranoia

Location: `D:\New project\paranoia-paranoia` (TypeScript, Vite). It is not a git repo at the time of reading.

## What it is
A modular, state-driven, text-based life-sim, PG-13 (no sexual content, no game-overs). The hazards are everyday: a 09:15 lecture, a phone, a bathroom, a father with speeches, a waffle iron on a shared circuit, the S-bus. Themes per package.json: university, family, salah, screens, social static.

## Current state (from README and file listing)
- Version 0.1.0 prototype covering Monday 5 October 2026 from 07:45: get ready, risk getting trapped on the phone in the bathroom, or make the 08:37 S-bus to the 09:15 lecture. The day stays open afterwards (campus, lab, library, bus home, salah, sleep).
- Setting: Karlstad weekly timetable and S-bus departures. Characters, lecturers and course codes are invented.
- Architecture: a generic `src/engine` (GameState, TimeManager, PrayerTimes, LocationManager, EventEngine, StatusEffects, Context, Game, seeded rng) kept apart from story content in `src/content` (characters, schedule, effects, items, locations, events, rules, scenarios) and a dumb UI in `src/ui`.
- Mechanics: four meters (energy, focus, guilt, socialBattery). Checks use 50 + meter + modifiers - difficulty, clamped to 5-95%. Astronomical prayer times (Muslim World League method, configurable). Autosave to localStorage. Keys 1-9 pick choices.
- Tests: `tests/engine.test.ts` and `tests/prototype.test.ts` exist (`npm test`, `npm run typecheck`). Whether they currently pass: unknown, not run.

## Next steps
- No roadmap file found. The README implies more days and scenarios beyond `mondayMorning.ts`, more events, locations and weekly slots. Priorities: unknown, owner to decide.

## Where Grok could help
- Video/image: cover art, character portraits or a short trailer; mood illustrations of Karlstad locations.
- Live research: accurate Karlstad transit details, Swedish student life, prayer-time conventions used by local mosques.
- Independent review: read the event writing for tone, cultural and religious accuracy and PG-13 compliance; check the meter and check maths for balance.
- Mature content Claude declines: none expected; the game is deliberately PG-13.
