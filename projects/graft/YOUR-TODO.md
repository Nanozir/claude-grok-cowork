# Your to-do list before and during the GRAFT build

Fact-checked 28 October 2026. Items marked (unverified) could not be confirmed from an official source.

## A. Must do before the first build session

1. ~~**Free up space on C: (target 40 GB+).**~~ **Done, 2026-10-28.** A one-time cache cleanup (NVIDIA/Unity/browser/npm/pip caches, a stray log file, old installers) brought C: from ~19 GB free to ~40 GB free. Nothing project-related was touched — this was purely general Windows/app clutter.

2. ~~**Install Visual Studio.**~~ **Done, 2026-10-28.** Visual Studio 17.14.43 Community is installed at `D:\VS\2022\Community`, confirmed with vswhere. Only 0.15 GB landed on C: (the bootstrapper), versus 7.66 GB on D: — the move-to-D: setup worked.

3. ~~**Move Unreal's caches to D:.**~~ **Done.** `UE-LocalDataCachePath` is set to `D:\Claude\UE_DDC`. Not yet verified in practice, since the project hasn't been opened in the editor yet — the folder will be created on first use. **Worth a re-check after the first editor launch:** confirm `D:\Claude\UE_DDC` is actually filling up and that `%LOCALAPPDATA%\UnrealEngine\Common\Zen` on C: is staying empty (Zen, UE's newer local cache service, may need its own `UE-ZenSubprocessDataPath` env var if it doesn't honor the one above).

4. **Open the new chat on Opus 5.5 at extra-high effort.**
   - What: the model and effort for the build session.
   - How: pick them in the model and effort menu before sending the first message. I could not check these menu names (unverified).
   - Time: 1 minute.

## B. Do during the first week

5. **Claim free content on Fab.**
   - What: Game Animation Sample (listed "From Free") and the updated City Sample (free, made for 5.8).
   - How: sign in at fab.com, set the price filter to Free (this shows permanently free items), and also open the "Free This Month" page for the current rotation. Choose the Personal or Professional licence honestly. Add each to your library.
   - Skip City Sample for now: it's very large and too heavy for a 4 GB GPU. Prefer the free Megascans set and free modular kits.
   - Time: 30 minutes plus download.

6. **Decide one foot style for both Zeiph types (claws or boots).**
   - What: one foot design saves rigging and modelling work.
   - How: pick one, write it into `Docs/DECISIONS.md`, and add it to both Zeiph prompts.
   - Time: 10 minutes.

7. **Make a clean front-only A-pose Graft concept image.**
   - What: a single front view, plain background, no side or back.
   - How: use the Graft prompt in Section 7.4 of the GDD, but ask for "front view only, single figure" and the foot style from item 6. Generate several in Gemini or Grok and keep the cleanest.
   - Time: 30 to 60 minutes.

8. **Set up Chatterbox for GRAFT-11.**
   - What: Chatterbox (Resemble AI) is MIT-licensed. Its audio carries an inaudible Resemble watermark.
   - How: install Python 3.11 (the maintainers tested on 3.11; Python 3.14 is untested, so do not use it) to `D:\Claude\Python311`. Create a venv at `D:\Claude\chatterbox-venv`, then `pip install chatterbox-tts`. Set `PIP_CACHE_DIR` and `HF_HOME` to D:\Claude folders so downloads stay off C:. Use `Docs/VO/Reference/Graft11_preview_3.mp3` as the voice-clone reference (cut a clean 5 to 10 second piece of it). Try Chatterbox-Turbo with `device="cuda"`. If it runs out of memory, use the CPU-friendly Nano model or `device="cpu"`. Close Unreal while testing, because the editor shares the same 4 GB.
   - 4 GB fit (unverified): the official page gives no VRAM figure. NVIDIA lists about 2.3 GB for Turbo in its own build. One community guide says 6 GB or more for the older model.
   - Time: 1 to 2 hours.

8b. **Capture reference shots for the critic (before M3).**
   - What: the gauntlet critic compares GRAFT against real frames from Halo 3: ODST (opening drop, "Mombasa Streets") and Titanfall 2 (campaign fights, pilot HUD).
   - How: play your own copies and take screenshots (F12 in Steam, or Win+Alt+PrtScn) at the moments listed in `Docs/BUILD-PLAN.md` Section 6. Save them to `Docs/References/<Piece>/` and write the mission and moment in `Docs/References/REFERENCES.md`. They stay private and are never committed.
   - Time: 1 to 2 hours.

8c. **Set a 32 GB page file on D:.**
   - How: System > About > Advanced system settings > Performance > Settings > Advanced > Virtual memory. Set C: to "No paging file" only if it causes no problems; otherwise keep a small one there.
   - Time: 5 minutes plus a restart.

## C. Nice to have

9. **Use ElevenLabs only for the main cast.**
   - Free plan: 10,000 credits a month, non-commercial use with attribution, 3 custom voice slots (all yours are used). Voice Library voices do not use a slot. Cloning needs a paid plan.
   - How: delete an unneeded custom voice only if you must; otherwise use Chatterbox for everything else.
   - Time: ongoing.

10. **Keep `Docs/LICENSES.md` current.**
    - What: record each asset's source and licence.
    - How: add a line every time you download something.
    - Time: 2 minutes per asset.

## Sources

- Epic, Setting up Visual Studio for UE 5.8: https://dev.epicgames.com/documentation/en-us/unreal-engine/setting-up-visual-studio-development-environment-for-cplusplus-projects-in-unreal-engine
- Epic, Using the Derived Data Cache (Local DDC, Zen): https://dev.epicgames.com/documentation/en-us/unreal-engine/using-derived-data-cache-in-unreal-engine
- Microsoft, Visual Studio policies (CachePath, SharedInstallationPath): https://learn.microsoft.com/en-us/visualstudio/install/configure-policies-for-enterprise-deployments?view=vs-2022
- Microsoft, Disable or move the package cache: https://learn.microsoft.com/en-us/visualstudio/install/disable-or-move-the-package-cache?view=vs-2022
- Chatterbox GitHub (MIT, Python 3.11, devices): https://github.com/resemble-ai/chatterbox
- Chatterbox on PyPI (MIT, Python 3.10 or newer): https://pypi.org/project/chatterbox-tts/
- NVIDIA Chatterbox model card (VRAM): https://docs.nvidia.com/ace-for-games/chatterbox-tts/nvigi-chatterbox-model-card.html
- Epic, City Sample update: https://www.unrealengine.com/learning/city-sample-gets-a-major-update-with-pcg-and-unreal-mcp-workflows
- Fab free filter discussion: https://forums.unrealengine.com/t/fab-free-for-the-month/2085590
- ElevenLabs billing docs: https://elevenlabs.io/docs/overview/administration/billing.md
- ElevenLabs pricing: https://elevenlabs.io/pricing
