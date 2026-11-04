# 2026-11-04: Goblin Territory Manager onboarding research (Claude)

## What was done
- Three Sonnet subagents researched:
  - the *Goblin Corporation* manhwa;
  - onboarding and pacing in management and idle games;
  - the art: SVG characters, icons and territory map, plus a first-session storyboard and image prompts.
- Claude combined the results into `projects/goblin-territory-manager/research/onboarding-recommendations.md`. Each change is mapped to file and line.
- Everything is in `projects/goblin-territory-manager/research/`.

## What's next
- Implement P0 from the recommendations:
  - start idle, with a food problem to fix
  - an intro memo
  - a pinned objective chain
  - progressive reveal of tabs and resources
  - 1x = 1 tick/s
  - first war on day 8
  - auto-pause
  - rewind on defeat
- Update `tests/sim.test.js` for the new starting food and war day.

## Open questions (owner)
- Keep permadeath on a lost war (with a rewind), or make war #1 a soft fail?
- First war on day 8? It's the compromise between the premise's urgency and the genre research's day 10.
- Advisor: the original "Gruk from HR", or Manager Oh's inner voice?
