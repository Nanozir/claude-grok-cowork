# Start here

Everything the build needs is in this folder. A new chat reads `CLAUDE.md` by itself, and the agent opens the other docs from disk, so the only thing you paste is one short message.

## Before the first build session

Do the "Must do" items in `YOUR-TODO.md` first. Visual Studio is required before the agent can compile anything.

## Starting the build

1. Open a **new** Claude Code chat with `D:\Projects\Graft` as the folder.
2. In the model and effort picker, choose **Opus 5.5** and **extra-high** effort.
3. Paste this as the first message:

```
Build the vertical slice of GRAFT, Mission 1 "Descent", in Unreal Engine 5.8, at the level of the games named below. Every beat in Docs/GDD.md Section 6 should feel and look like it belongs next to them: the drop pod's fall, heat and impact, the weight of a 2.4 m armoured body, the visor HUD, the pilot's breathing, the Tamri soldiers panicking, and the black rain of pods at the end. Follow Docs/BUILD-PLAN.md exactly: its milestones and gates (stop at the M1 go/no-go and wait for me), its hardware limits, its headless build, test and screenshot pipeline, and its parallel-work rules.

Break the work into the smallest pieces that can be built and judged on their own, as listed in BUILD-PLAN Section 6. Fan out sub-agents (model opus, effort medium) and have each one tackle a piece. Loop on each piece, and have a separate sub-agent with fresh context, a really harsh critic, capture the piece from the same camera angle as its reference and compare them blind, side by side. If it can pick which one is GRAFT, it names the single biggest remaining gap and sends the piece back. Keep Docs/progress.html updated with every piece, its latest capture next to its reference, the round count and the critic's verdict.

The bar is Halo 3: ODST's opening drop and Titanfall 2's campaign, from the reference captures in Docs/References/. Don't stop until each critic can't tell which one is GRAFT, or picks GRAFT as the real game, judged at the Medium preset on this PC. Gaps that only paid art or better hardware could close go in Docs/ART_GAPS.md and don't count. Cap: 2 critic rounds per piece in the MVP pass and 5 in the polish pass; at a cap, stop and report the biggest remaining gap. Start by reading CLAUDE.md and BUILD-PLAN.md, answer its first-action questions, then begin M0. /loop until it's utterly perfect. Fan out sub-agents and ultracode.
```

## Notes

- **Cost warning:** the gauntlet loop runs many sub-agents, each with a critic re-checking it. That uses a lot of tokens. The round caps keep it bounded; lower them in the message if your usage limit is tight.
- The critic needs reference captures. Before M3, save screenshots or short clips from your own copies of Halo 3: ODST and Titanfall 2 into `Docs/References/<Piece>/` (pieces are listed in BUILD-PLAN Section 6). They stay private and are never committed.
- Progress: `Docs/PROGRESS.md`, plus `Docs/progress.html` once it exists.
- To pick up later in another new chat, the first message can simply be: "Read Docs/PROGRESS.md and continue from where it stops."
