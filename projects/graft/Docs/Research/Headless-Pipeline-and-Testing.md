# Headless pipeline and testing in UE 5.8.4

Research date: 2026-10-28. Engine checked: `D:\Epic Games\UE_5.8`. Its `Engine\Build\Build.version` says 5.8.4, CL 58902052, branch `++UE5+Release-5.8`.

## How this was checked

Most claims here come from reading the installed 5.8.4 engine source and binaries. That is the strongest evidence available, because it is the exact code GRAFT builds against. Each claim carries a tag:

- **[5.8 source]**: read in the installed engine source, config or binaries under `D:\Epic Games\UE_5.8`.
- **[5.8 docs]**: stated in Epic's 5.8 documentation or the 5.8 release notes.
- **[older docs]**: comes from UE 4.x or early 5.x docs or forum posts and has not been re-checked for 5.8.
- **[inferred]**: my reasoning from the above. It has not been tested on this machine.

Nothing in this document was run end to end against the Graft project, because the project is not built yet. The first real run of each command is the real test.

---

## Summary of corrections

| Area | What the plan says now | Status in 5.8.4 | Change |
|---|---|---|---|
| Build.bat command | as listed | Works | None. `-WaitMutex` is still a UBT flag. Build.bat also has its own lock file. |
| Generate project files | as listed | Works | None. `-ProjectFiles` is still in UBT. |
| `-ReportExportPath=` | as listed | **Correct, current name** | None. The old `-ReportOutputPath=` still works but logs a warning saying to use `-ReportExportPath=`. |
| `-TestExit="Automation Test Queue Empty"` | as listed | **The engine ignores it** | Optional to drop. Only UAT's `RunProject` reads `-testexit`. The `;Quit` inside `-ExecCmds` is what ends the process. |
| `-nullrhi`, `-unattended`, `-nosplash`, `-nosound` | as listed | All still parsed | None. Use `-nosound` only for tests, not for perf runs (see Section 4). |
| Screenshot folder | "somewhere under `Saved/Screenshots/`" | `Saved/Screenshots/WindowsEditor/` for `UnrealEditor.exe -game` | Packaged game: `Saved/Screenshots/Windows/` |
| `-csvprofile -csvframes=1800` | as listed | **Neither flag exists in 5.8.4** | Use `-csvCaptureFrames=1800`, or better, the `CsvProfile Frames=1800` console command run once the flythrough starts. |
| PerfReportTool | `Engine\Binaries\DotNET\CsvTools\PerfReportTool.exe` | Present as `PerfreportTool.exe`, v4.274.1 | The path is fine because Windows ignores case. There is **no `flythrough` report type** in the shipped `ReportTypes.xml`. Use `-reportType Default30fps`. |
| `-trace=cpu,gpu,frame` | as listed | Valid channels | Add `-tracefile=<path>` so the trace is written to a known file and does not depend on a running trace server. |
| Python | `-run=pythonscript -script=...` | Works | The plugin is off by default and still marked beta. It must be enabled in the `.uproject`. Use absolute script paths. |
| Unreal MCP | "experimental Epic plugin" | **Confirmed Epic-official**, shipped in the engine at `Engine\Plugins\Experimental\ModelContextProtocol` | See Section 7. It conflicts with the "one Unreal process" rule. |
| Functional tests | "test map with `AFunctionalTest`" | Works | Test names are `Project.Functional Tests.<map path>.<actor label>`. `Automation RunTests Graft` only catches them because "Graft" is in the map path. See Section 3. |

---

## 1. Build, project files and automation tests

### 1.1 Paths (all [5.8 source], checked on disk)

| File | Exists |
|---|---|
| `D:\Epic Games\UE_5.8\Engine\Build\BatchFiles\Build.bat` | yes |
| `D:\Epic Games\UE_5.8\Engine\Binaries\DotNET\UnrealBuildTool\UnrealBuildTool.exe` | yes |
| `D:\Epic Games\UE_5.8\Engine\Binaries\Win64\UnrealEditor-Cmd.exe` | yes |
| `D:\Epic Games\UE_5.8\Engine\Binaries\Win64\UnrealEditor.exe` | yes |
| `D:\Epic Games\UE_5.8\Engine\Binaries\DotNET\CsvTools\PerfreportTool.exe` | yes |
| `D:\Epic Games\UE_5.8\Engine\Binaries\Win64\UnrealInsights.exe` | yes |
| `D:\Epic Games\UE_5.8\Engine\Binaries\Win64\UnrealTraceServer.exe` | yes |
| `D:\Epic Games\UE_5.8\Engine\Binaries\ThirdParty\Python3\Win64\python311.dll` | yes (bundled Python is 3.11) |

### 1.2 Build (unchanged)

```
"D:\Epic Games\UE_5.8\Engine\Build\BatchFiles\Build.bat" GraftEditor Win64 Development -Project="D:\Projects\Graft\Graft.uproject" -WaitMutex
```

- [5.8 source] `Build.bat` runs `dotnet UnrealBuildTool.dll %*`. It has its own lock file (in `%tmp%`) and waits if another Build.bat is running. `-WaitMutex` is still defined in `UnrealBuildTool\GlobalOptions.cs` ("Wait for another instance to finish and then start").
- [5.8 docs] The 5.8 release notes say Visual Studio 2022 v17.14 is the minimum and VS 2026 is recommended. MSVC 14.38 is the minimum and 14.50 is recommended. GRAFT's VS 17.14.43 meets the minimum. If a build fails with toolchain warnings, this is the first thing to check.
- [5.8 source] Build.bat needs a `dotnet` SDK on PATH (`GetDotnetPath.bat`). It uses the engine's bundled dotnet if one is present.

### 1.3 Generate project files (unchanged)

```
"D:\Epic Games\UE_5.8\Engine\Binaries\DotNET\UnrealBuildTool\UnrealBuildTool.exe" -projectfiles -project="D:\Projects\Graft\Graft.uproject" -game -engine
```

- [5.8 source] `-ProjectFiles` is defined in `GlobalOptions.cs` as the same as `-Mode=GenerateProjectFiles`.
- [older docs] `-game` and `-engine` are long-standing generator flags. I did not trace them through the 5.8 generator code.

### 1.4 Automation tests (one optional change)

Recommended form:

```
"D:\Epic Games\UE_5.8\Engine\Binaries\Win64\UnrealEditor-Cmd.exe" "D:\Projects\Graft\Graft.uproject" -ExecCmds="Automation RunTests Graft;Quit" -unattended -nullrhi -nosplash -nosound -log -ReportExportPath="D:\Projects\Graft\Saved\TestReport"
```

The only change is dropping `-TestExit`. Keeping it does no harm.

What the 5.8.4 source shows:

- **`-ExecCmds` splits on commas, not semicolons** [5.8 source, `Engine\Private\ParseExecCommands.cpp`]. So `"Automation RunTests Graft;Quit"` reaches the console as **one** command. The `Automation` command handler then splits it on `;` [5.8 source, `AutomationCommandline.cpp`]. The `Quit` is therefore `Automation Quit`, which is what you want. Do not use a comma before `Quit`. A comma would make it the engine's own `Quit`, and that can run before the tests finish.
- **`Automation Quit` waits for the queue and sets the exit code** [5.8 source, `AutomationCommandline.cpp` lines 490-507]. When it runs, it:
  - sets `GIsCriticalError` if any report has errors,
  - logs `**** TEST COMPLETE. EXIT CODE: 0 ****` or `-1`,
  - calls `FPlatformMisc::RequestExitWithStatus(true, 0 or -1)`.
  
  **So the process exit code is the pass/fail signal**: 0 means all passed, -1 means at least one failed. Check it first, then read `index.json` for the details.
- **`-TestExit` is not read by the engine** [5.8 source]. A search of `Engine\Source` finds `testexit` only in `AutomationTool\Scripts\RunProjectCommand.Automation.cs`. That is UAT watching the log text and killing the process. Running `UnrealEditor-Cmd.exe` directly, the flag does nothing. An Epic forum answer also calls it legacy [older docs].
- **`-ReportExportPath=` is the current name** [5.8 source, `AutomationControllerManager.cpp` lines 213-233]. The old `-ReportOutputPath=` is still read, but it logs: "Argument -ReportOutputPath= is now -ReportExportPath=. Please update your command line!" `-DisplayReportOutputPath=` became `-ReportURL=`. `-DeveloperReportOutputPath=` became `-DeveloperReport`, which takes no value.
- **Report files** [5.8 source]: `<ReportExportPath>\index.json`, `<ReportExportPath>\index.html`, plus an artifacts subfolder for screenshots and other attachments. The JSON is written as UTF-8. If the write fails 3 times, it logs `Failed to write test report json`.
- **Test name matching** [5.8 source, `GenerateTestNamesFromCommandLine`]:
  - The `RunTests` argument is split on `+`.
  - Each piece is either `StartsWith:<prefix>` (a dot is added to the end), `Group:<name>` (from `AutomationControllerSettings` groups), or **a plain substring match**.
  - So `RunTests Graft` runs every test whose full path contains "Graft" anywhere.
  - For a strict filter, use `RunTests StartsWith:Graft+StartsWith:Project.Functional Tests.Graft`. Spaces are fine here, because only commas split `-ExecCmds`.
- **Other `Automation` sub-commands** that exist in 5.8.4 [5.8 source]: `List`, `RunTests`/`RunTest`, `RunFilter`, `RunAll`, `SetFilter`, `SetTagFilter`, `ApplyTagFilter`, `SetMinimumPriority`, `SetPriority`, `Quit`, `SoftQuit`, `IgnoreLogEvents`, `AllowZeroTestResults`, `Now`, `Help`. `Automation List` is useful for checking that tests are found before relying on a filter.
- `-TestLoops=N` repeats a run [5.8 source].
- `-nullrhi` is still parsed (`App.h`, `AutomationTest.cpp`). With null RHI, the automation framework treats screenshot tests as unsupported [5.8 source, `AutomationTest.cpp` line 841, `bUsingNullRHI`]. **So screenshot-comparison tests cannot run in this command. They need a real GPU run.**
- `-nosound` is still parsed (`App.h`: `CanEverRenderAudio()` is false with `-nosound` unless `-enablesound` is also given). `-unattended` (`App.cpp`) and `-nosplash` (`WindowsPlatformSplash.cpp`) are still parsed too.

### 1.5 `index.json` schema for 5.8.4

[5.8 source] The file is `FAutomatedTestPassResults`, serialized by `FJsonObjectConverter::UStructToJsonObjectString`. That converter writes UPROPERTY names with the first letter lowercased, so the keys come out as below [inferred from how the converter works; standard behaviour].

Top level:

| Key | Type | Notes |
|---|---|---|
| `devices` | array of `FAutomationDeviceInfo` | |
| `reportCreatedOn` | string (UTC date-time) | |
| `succeeded` | int | |
| `succeededWithWarnings` | int | |
| `failed` | int | |
| `notRun` | int | |
| `inProcess` | int | Should be 0 in a finished report |
| `totalDuration` | float (seconds) | |
| `comparisonExported` | bool | Screenshot comparison |
| `comparisonExportDirectory` | string | |
| `tests` | array of test objects | |

Each entry in `tests` (`FAutomatedTestResult`):

| Key | Type | Notes |
|---|---|---|
| `testDisplayName` | string | |
| `fullTestPath` | string | e.g. `Graft.Movement.Sprint` or `Project.Functional Tests.Graft.Maps.Tests.L_MoveTests.FT_Sprint` |
| `tags` | string[] | |
| `state` | string enum | `NotRun`, `InProcess`, `Fail`, `Success`, `Skipped` (from `EAutomationState`) |
| `deviceInstance` | string[] | |
| `duration` | float | |
| `dateTime` | string | |
| `entries` | array | Log events, see below |
| `warnings` | int | |
| `errors` | int | |
| `artifacts` | array | Screenshot diffs and similar |

Each entry in `entries` is `FAutomationExecutionEntry`. In C++ it has `Event` (with `Type` = `Info`/`Warning`/`Error`, `Message`, and context), `Filename`, `LineNumber` and `Timestamp`. I expect JSON keys like `event.type`, `event.message`, `filename`, `lineNumber` and `timestamp`, but **I could not find its USTRUCT reflection in the time available. Confirm the exact nested keys on the first real report** [inferred].

Parser rules for GRAFT:

1. Exit code not 0 means fail.
2. `failed > 0` means fail.
3. Also treat `state == "Skipped"` or `notRun > 0` as worth flagging.
4. If `tests` is empty, the filter matched nothing. Treat that as a fail too. The engine has an `AllowZeroTestResults` switch, which suggests zero matches is treated as an error by default [inferred].
5. Logs for passing tests may be pruned. The controller has `bPruneLogsOnSuccess = true` [5.8 source], so do not expect `entries` on passing tests.

---

## 2. Screenshot capture (`Graft.CaptureShots`)

### 2.1 Output folder (confirmed)

[5.8 source]

- `FPaths::ScreenShotDir()` is `ProjectSavedDir() + "Screenshots/" + FPlatformProperties::PlatformName() + "/"`.
- On Windows, `PlatformName()` returns `WindowsEditor` when the binary has editor data, `Windows` for a packaged game, `WindowsClient` for a client-only build and `WindowsServer` for a server.
- `UEngine::GameScreenshotSaveDirectory.Path` defaults to that folder (`GameEngine.cpp` line 919).

So:

- `UnrealEditor.exe Graft.uproject ... -game` writes to `D:\Projects\Graft\Saved\Screenshots\WindowsEditor\`
- A packaged Development `Graft.exe` writes to `<PackageDir>\Windows\Graft\Saved\Screenshots\Windows\` [inferred for the package root; the `Windows` leaf folder is from source].

### 2.2 `FScreenshotRequest::RequestScreenshot` behaviour (5.8.4)

[5.8 source, `UnrealClient.cpp`]

The signature is `RequestScreenshot(const FString& InFilename, bool bInShowUI, bool bAddUniqueSuffix, bool bHdrScreenshot = false, const FIntRect& InViewRect = FIntRect(), bool bInRestrictToGameViewport = false)`. There is also a short form, `RequestScreenshot(bool bInShowUI, bool bInRestrictToGameViewport)`.

How the filename is handled:

- If the filename has no `/` or `\`, it goes into `GameScreenshotSaveDirectory`.
- If it has a path, that path is used as given. **To write straight into a per-set folder, pass an absolute path**, e.g. `D:/Projects/Graft/Saved/Screenshots/Capture/Courtyard/Bookmark01`.
- With `bAddUniqueSuffix = true`, a number is added (e.g. `Name00000.png`), or a date-time if `bDateTimeBasedNaming` is on. Pass `false` for stable names that are easy to compare.
- A `.png` extension is added if missing, or `.exr` for HDR.

Two gotchas from the source:

- **If anything binds `UGameViewportClient::OnScreenshotCaptured()`, no file is written.** The engine fires the delegate instead (`GameViewportClient.cpp` lines 2543-2556). The cvar `r.ScreenshotDelegate 0` turns that behaviour off. Make sure GRAFT code (and any plugin) does not bind it, or set the cvar in the capture run.
- **To order the shots, listen to `FScreenshotRequest::OnScreenshotRequestProcessed()`.** It fires after the viewport has processed the request (`GameViewportClient.cpp` line 2583). Move the camera to the next bookmark only after that. Do not use a fixed frame delay.
- 5.8 adds `UGameViewportClient::OnHDRScreenshotCaptured`. The old `OnScreenshotCaptured` does not fire when HDR is enabled [5.8 docs, release notes].

### 2.3 Built-in console commands (still present in 5.8.4)

- `HighResShot <W>x<H>` or `HighResShot <multiplier>`. It also takes `filename=<name>` and optional positional arguments: `capX capY capW capH maskEnabled dumpBuffers captureHDR dateTimeNaming` [5.8 source, `GetHighResScreenShotInput`].
- `Shot` / `Screenshot` [older docs; not re-checked].

`HighResShot` renders off-screen at the requested size, so the window size does not matter. For a fixed 1080p framing, the custom `RequestScreenshot` path is simpler.

### 2.4 Waiting for shaders and streaming to settle

There is **no** console command named `Automation WaitForShadersToFinishCompiling`. What 5.8.4 does have [5.8 source]:

1. **`UAutomationBlueprintFunctionLibrary::FinishLoadingBeforeScreenshot()`** (FunctionalTesting module, `AutomationBlueprintFunctionLibrary.cpp` lines 702-733). This is what Epic's own screenshot tests use. It is a blocking call that:
   - runs `FlushAsyncLoading()`,
   - runs `GameWorld->FlushLevelStreaming(EFlushLevelStreamingType::Full)`,
   - if the platform does not need cooked data (true for editor `-game`): runs `UMaterialInterface::SubmitRemainingJobsForWorld(World)` and then `FAssetCompilingManager::Get().FinishAllCompilation()`,
   - runs `UTexture::ForceUpdateTextureStreaming()`,
   - runs `IStreamingManager::Get().StreamAllResources(0.0f)`.
   
   **Calling this once before the bookmark loop, and again after each camera move, is the simplest reliable option.** The FunctionalTesting module is a Developer module. That is fine for `UnrealEditor.exe -game`. Wrap the call in `#if WITH_EDITOR` or `!UE_BUILD_SHIPPING` if the capture code must also compile into packaged builds [inferred].
2. **`AutomationWaitForLoading`** (latent, Blueprint-callable). It waits until no async loading and no pending level streaming, then needs **at least 60 frames and at least 5 seconds** after the last load event before it finishes (lines 1148-1183).
3. **Polling a settle loop yourself.** Useful if you want a log line per wait. The calls that exist in 5.8.4:
   - `GShaderCompilingManager->IsCompiling()`, `GetNumRemainingJobs()`, `GetNumPendingJobs()` (editor builds only; this is the same check `FWaitForShadersToFinishCompilingInGame` uses in `AutomationCommon.cpp`),
   - `FAssetCompilingManager::Get().GetNumRemainingAssets()`,
   - `IStreamingManager::Get().GetNumWantingResources()` and `BlockTillAllRequestsFinished(TimeLimit)`,
   - `UWorldPartitionSubsystem::IsAllStreamingCompleted()`, if `L_Descent` uses World Partition,
   - `PipelineStateCache::NumActivePrecacheRequests()` (PSO precaching) and `FShaderPipelineCache::NumPrecompilesRemaining()`.
4. **Cvars for the capture run** [5.8 source, `TextureStreamingHelpers.cpp`]: `r.Streaming.FullyLoadUsedTextures 1`, `r.Streaming.FullyLoadMeshes 1`, and if VRAM allows, `r.Streaming.UseAllMips 1`. Watch the 4 GB on the GTX 1650. Do not use `r.Streaming.UseAllMips` if it pushes past the pool and causes swapping [inferred].

Suggested order inside `Graft.CaptureShots`:

1. Call `FinishLoadingBeforeScreenshot()`.
2. Poll until shaders, assets, PSO precaching and streaming are all at 0 for N frames in a row. N = 30 is a reasonable start. Log the counts every few seconds.
3. Then for each bookmark:
   1. Set the camera.
   2. Call `FinishLoadingBeforeScreenshot()`.
   3. Wait for the settle check again.
   4. Wait 2 or 3 more frames so TSR and auto-exposure history can converge. Lumen also needs time; consider freezing eye adaptation with a fixed exposure in a capture post-process.
   5. Request the screenshot.
   6. Wait for `OnScreenshotRequestProcessed`.
4. Quit when done.

`-ExecCmds` commands are queued as deferred commands and run on the first engine ticks [5.8 source]. In `-game` mode the map has normally finished its initial load by then. Even so, have the command start with the settle wait rather than assuming the map is ready.

---

## 3. `AFunctionalTest` in 5.8.4

[5.8 source, `Engine\Source\Developer\FunctionalTesting\Classes\`]

- **Base classes.** `AFunctionalTest : AActor` is unchanged. These headers ship alongside it: `AScreenshotFunctionalTestBase`, `AScreenshotFunctionalTest`, `AFunctionalUIScreenshotTest`, `AFunctionalAITest`, `UTestPhaseComponent`, `AFunctionalTestGameMode`, `AFunctionalTestLevelScript` and `UFunctionalTestUtilityLibrary`. `FunctionalTestBase.h` declares `FFunctionalTestBase : FAutomationTestBase`, which is the C++ test-runner side, not something you place in a level.
- **Lifecycle** (unchanged in shape):
  - `PrepareTest()` / `ReceivePrepareTest` (Blueprint) runs first.
  - `IsReady()` is polled until true, bounded by `PreparationTimeLimit`.
  - `StartTest()` / `ReceiveStartTest` then runs.
  - The test ends with `FinishTest(EFunctionalTestResult, Message)`.
  - `OnTimeout()` runs at `TimeLimit`. 0 means no limit.
  - `SetTimeLimit()` can change the limit at runtime.
- **Result values.** `EFunctionalTestResult` is `Default`, `Invalid`, `Error`, `Running`, `Failed`, `Succeeded`. `Default` means "let assertions decide". Even a logged success can be overturned by errors.
- **Assertions.** `AssertTrue`, `AssertEqual_*` and similar each add an error or info event to the test report.
- **Log handling.** `LogErrorHandling` and `LogWarningHandling` (`ProjectDefault` / `OutputIsError` / `OutputIgnored`) decide whether stray `LogXxx: Error` lines fail the test.
- **Other options.** `bIsEnabled`. `bIsInSublevel` with `PersistentLevelName`. `ObservationPoint`. `RandomNumbersStream`, a seeded stream that gives repeatable runs; useful for movement tests. `bShouldDelayGarbageCollection`.

**How tests are found** [5.8 source, `FunctionalTestingModule.cpp`, `ClientFuncTestPerforming.cpp`]:

- Every on-disk `UWorld` in the asset registry is scanned, not only maps under a `TestMaps` folder. Maps under `/Game/Developers` are skipped unless developer folders are included.
- The test list is read from the map's asset registry tag `TestNames` (editor-only tests use `TestNamesEditor`). With World Partition / One File Per Actor, it is read from each external actor's `TestName` tag. **So a map must be saved after adding or renaming a functional test**; unsaved tests do not exist to the runner.
- Under `UnrealEditor.exe -game`, the module first forces a full asset registry scan (`SearchAllAssets(true)`).
- Maps whose names start with `FTEST_` are a legacy auto-run form. Do not use it.

**How tests are named** (this matters for the `RunTests` filter):

- The name is `Project.Functional Tests.` + the map package path without `/Game/`, with `/` changed to `.`, + `.` + the actor label.
- Example: actor `FT_SprintSpeed` in `/Game/Graft/Maps/Tests/L_MoveTests` becomes `Project.Functional Tests.Graft.Maps.Tests.L_MoveTests.FT_SprintSpeed`.
- A `TestPathOverride` asset registry tag on the map replaces the path part.
- Because `RunTests` does substring matching, `Automation RunTests Graft` **does** pick these up, as long as the maps are under `/Game/Graft/`. The stricter form is `RunTests StartsWith:Graft+StartsWith:Project.Functional Tests.Graft`.

**How results show up**:

- Each functional test actor is one entry in `index.json` `tests[]`. Its `fullTestPath` is the name above and its `state` is `Success`, `Fail` and so on.
- Assertion messages and `FinishTest` messages appear in `entries`.
- The runner opens the map with `AutomationOpenMap`. In an editor run (`UnrealEditor-Cmd.exe`, not `-game`) this means PIE.
- Movement and gameplay tests work under `-nullrhi`. `AScreenshotFunctionalTest` and the other screenshot tests do not, as explained in 1.4.

**Changes since UE 4.x and early 5.x**: I found no breaking API change in the 5.8.4 headers for the members GRAFT is likely to use. The [5.8 docs] release notes mention only that automated map loading "now waits for the editor navmesh build to finish before starting Play in Editor". That is good for AI and navigation tests.

**Other choices for pure logic tests**:

- `IMPLEMENT_SIMPLE_AUTOMATION_TEST`, Automation Spec (`BEGIN_DEFINE_SPEC`), and CQTest are all still present. The 5.8 release notes mention a new CQTest suite in the audio code.
- Prefix their names `Graft.` so the same `RunTests Graft` filter catches them.

---

## 4. CSV profiling and PerfReportTool

### 4.1 Corrections to the capture flags (important)

[5.8 source, `Core\Private\ProfilingDebugging\CsvProfiler.cpp`]

- **`-csvprofile` and `-csvframes=` are not parsed anywhere in 5.8.4.** The command-line flags that do exist:
  - `-csvCaptureFrames=N` starts a capture at boot ("BootCapture", so it includes engine init and map load) and records N frames.
  - Also: `-csvCategories=`, `-csvMetadata=`, `-csvGpuStats`, `-csvStartOnEvent=`, `-csvStopOnEvent=`, `-csvRepeat=`, `-csvCompression=0|1`, `-csvNamedEvents`, `-csvStatCounts`, `-csvNoProcessingThread`, `-csvProfilerHighPriority`, `-ExitAfterCsvProfiling`.
- The console command is `CsvProfile` (not case-sensitive). Its arguments:
  - `CsvProfile Start` / `CsvProfile Stop`
  - `CsvProfile Frames=N` starts and stops after N frames.
  - `CsvProfile StartFile=<name>`
  - `CsvProfile Repeat=N`
  - `CsvProfile ExitOnCompletion` quits when the capture ends.
- Output goes to `Saved\Profiling\CSV\` (`FPaths::ProfilingDir() + "CSV/"`) as `.csv`, or `.csv.gz` if compression is on.

Recommended perf command for editor `-game`. It is useful for trends, but only a packaged build gives true numbers (see 5.1):

```
"D:\Epic Games\UE_5.8\Engine\Binaries\Win64\UnrealEditor.exe" "D:\Projects\Graft\Graft.uproject" /Game/Graft/Maps/L_Descent -game -windowed -ResX=1920 -ResY=1080 -unattended -muteaudio -csvGpuStats -ExecCmds="t.MaxFPS 0,CsvProfile ExitOnCompletion,Graft.Flythrough TramYard" -log
```

`Graft.Flythrough` should itself run `CsvProfile Frames=1800`, or `CsvProfile Start` / `CsvProfile Stop`, once the settle wait from 2.4 is done and the camera starts moving. That keeps load hitches out of the numbers. If you would rather keep the profiler control out of C++, the frame-count capture can go in the same `-ExecCmds` before the flythrough command. It will then also record the settle period, so trim it with `-beginEvent` in PerfReportTool, or emit a CSV event with `CSV_EVENT` from the flythrough.

Three notes on that command:

- **Use `-muteaudio`, not `-nosound`, for perf runs.** `-nosound` turns off the whole audio engine, which hides its CPU cost. The engine's own comment in `App.h` recommends `-muteaudio` when you only want silence [5.8 source].
- **Do not use `-benchmark`.** It sets `FApp::IsBenchmarking()`, which also turns off audio and changes timing [5.8 source].
- The comma between commands in `-ExecCmds` is correct, because commas split commands [5.8 source].

### 4.2 PerfReportTool

[5.8 source; the binary was run with no arguments to print its usage]

- The path is `D:\Epic Games\UE_5.8\Engine\Binaries\DotNET\CsvTools\PerfreportTool.exe`. Note the lowercase "r", which does not matter on Windows. It reports itself as `PerfReportTool v4.274.1`. It is not renamed or replaced.
- The same folder has `CSVCollate`, `CsvConvert`, `CSVFilter`, `csvinfo`, `CSVSplit`, `CSVToSVG` and `RegressionsReport`.
- 5.8 also adds an experimental Horde view of perf trends that consumes PerfReportTool output [5.8 docs, release notes]. GRAFT does not need it.
- The report types in the shipped `ReportTypes.xml` are `Default60fps`, `Default30fps`, `AI5` and `Memory`. **There is no `flythrough` type**, even though the usage text still gives it as an example. Auto-detection picks a type from the `targetframerate` metadata. Pass the type explicitly.

Single-file report:

```
"D:\Epic Games\UE_5.8\Engine\Binaries\DotNET\CsvTools\PerfreportTool.exe" -csv "D:\Projects\Graft\Saved\Profiling\CSV\<file>.csv" -o "D:\Projects\Graft\Saved\PerfReports\TramYard" -reportType Default30fps -title "TramYard flythrough" -writeSummaryCsv
```

For a machine-readable summary across several runs:

```
"...\PerfreportTool.exe" -csvdir "D:\Projects\Graft\Saved\Profiling\CSV" -o "D:\Projects\Graft\Saved\PerfReports" -reportType Default30fps -summaryTableOutputFormats csv,json -summaryTable default
```

- For frame ranges, use `-minx`/`-maxx` (frame numbers) or `-beginEvent`/`-endEvent`.
- The 30 fps report gives Hitches/Min, MVP30 and the averages of `Frametime`, `GameThreadtime`, `RenderThreadtime`, `RHIThreadTime` and `GPUtime`, coloured against a 33.4 ms budget. That matches GRAFT's Medium / 30 fps / 1080p target.
- `-writeSummaryCsv` works for single-file reports only.
- `PerfreportTool.exe` needs a .NET runtime. It ran on this machine, so that is in place.

---

## 5. Unreal Insights on a packaged Development build (weak PC)

### 5.1 Why packaged

`UnrealEditor.exe -game` runs uncooked content with editor-only data loaded and can compile shaders during play. Its frame times are pessimistic and noisy [older docs; standard advice]. Use editor `-game` CSV runs for trends between commits. Use a packaged Development build for numbers checked against the 30 fps target.

### 5.2 Trace flags in 5.8.4

[5.8 source, `TraceAuxiliary.cpp`; `BaseEngine.ini` `[Trace.ChannelPresets]`]

**Channels**:

- `-trace=<channels or presets>`, comma separated.
- The `default` preset is `cpu,gpu,frame,log,bookmark,screenshot,region`.
- `BaseEngine.ini` also defines these presets:
  - `Rendering` = `gpu,cpu,frame,log,bookmark`
  - `Loading` = `cpu,frame,log,bookmark,screenshot,region,loadtime,assetloadtime,file`
  - `TaskGraph` = default + `task`
  - `ContextSwitching` = default + `contextswitch`
- `-trace` with no value uses `default`.

**Where the trace goes**:

- `-tracefile=<path>` writes to that file. `-tracefile` with no value writes a default-named file. `-tracefiletrunc` overwrites the file. `-tracefiletimestamps` is also available.
- `-tracehost=<ip>` streams to a trace server.
- **If no destination is given, the engine traces to memory.** It only connects automatically to `127.0.0.1` if it detects a running Unreal Insights instance (the `Local\UnrealInsightsAutoConnect` named event on Windows).
- **So always pass `-tracefile=` in a headless run.** Then the result does not depend on whether Insights happened to be open.

**New in 5.8** [5.8 docs, release notes]:

- UnrealTraceServer v1.24.
- Traces over SSL (`-TraceSecure*` flags).
- `snapshothitches -start`, which writes trace snapshots and screenshots to `Saved/Profiling/Hitches` when a hitch happens. Useful for catching the odd 100 ms spike without tracing a whole session.
- Crash trace snapshots (`CrashContext.TraceSnapshotOnCrash`).
- A standalone `TraceQuery` tool that turns `.utrace` into JSONL. **It is not in the launcher install** (no `TraceQuery*` file under `Engine\Binaries`). It is probably source or GitHub only, so do not plan on it [5.8 source; inferred].

### 5.3 Recommended capture on the GTX 1650 / Ryzen 3 3200G machine

```
<PackageDir>\Windows\Graft.exe /Game/Graft/Maps/L_Descent -windowed -ResX=1920 -ResY=1080 -muteaudio -trace=cpu,gpu,frame,bookmark,region -tracefile="D:\Claude\Traces\descent_tramyard.utrace" -tracefiletrunc -ExecCmds="Graft.Flythrough TramYard" -log
```

Guidance [inferred from the source behaviour above plus standard Insights practice; check on the first run]:

- **Do not run Unreal Insights during capture.** On 4 cores, Insights and the trace server take CPU from the game, and the open Insights instance makes the game stream to it automatically. Capture to a file, quit the game, then analyse. This also follows the project's "one Unreal process at a time" rule.
- **Keep channels few.**
  - `cpu,gpu,frame,bookmark,region` is enough for frame-budget work. `log` and `screenshot` add cost and file size.
  - Only add `task`, `contextswitch` (needs admin rights for ETW), `loadtime`/`file`, or memory channels in separate runs that look into one specific problem.
  - Avoid `-statnamedevents` unless you need stat-scope names. It adds heavy overhead on a weak CPU [older docs].
- **Do not run the CSV profiler and trace in the same run** when you want clean numbers. Use the CSV run for the pass/fail budget table, and the trace run to find out why.
- **Keep trace files on D:**, e.g. `D:\Claude\Traces\`, as the house rules say.
- Tracing is compiled into Development builds by default (`UE_TRACE_ENABLED` in non-Shipping builds) [older docs; standard].

### 5.4 Headless analysis of a `.utrace` (no GUI)

[5.8 source: these flags and commands are used by Epic's own Insights export tests in `TraceInsights\Private\Insights\Tests\FunctionalTests\ExportCommandsTests.cpp`]

```
"D:\Epic Games\UE_5.8\Engine\Binaries\Win64\UnrealInsights.exe" -OpenTraceFile="D:\Claude\Traces\descent_tramyard.utrace" -NoUI -AutoQuit -ABSLOG="D:\Claude\Traces\insights_export.log" -ExecOnAnalysisCompleteCmd="TimingInsights.ExportTimerStatistics D:\Claude\Traces\tramyard_timers.csv -threads=GameThread,RenderThread* -maxTimerCount=50 -sortBy=TotalInclusiveTime -sortOrder=Descending" -log
```

- Export commands available in 5.8.4: `TimingInsights.ExportThreads`, `ExportTimers`, `ExportTimingEvents`, `ExportTimerStatistics`, `ExportTimerCallees`, `ExportCounters`, `ExportCounterValues`.
- They take filters such as `-columns=`, `-threads=`, `-timers=`, `-startTime=`, `-endTime=`, `-region=`, `-maxTimerCount=`, `-sortBy=` and `-sortOrder=`.
- `-ExecOnAnalysisCompleteCmd="@=<file>"` runs a whole list of commands from a file.
- The exact `-sortBy` column names are not confirmed. Run one export with `-columns="*"` first to see the real column names.
- This lets the agent turn a trace into a CSV it can read, without anyone looking at the Insights UI.

---

## 6. Python Editor Script Plugin in 5.8.4

[5.8 source]

- The plugin is at `Engine\Plugins\Experimental\PythonScriptPlugin`, friendly name "Python Editor Script Plugin".
- Its descriptor still says `"IsBetaVersion": true` and `"EnabledByDefault": false`. **It must be enabled in `Graft.uproject`**, or `-run=pythonscript` cannot load the commandlet.
- The bundled interpreter is CPython 3.11 (`Engine\Binaries\ThirdParty\Python3\Win64\python311.dll`).

### 6.1 Headless invocation (unchanged)

```
"D:\Epic Games\UE_5.8\Engine\Binaries\Win64\UnrealEditor-Cmd.exe" "D:\Projects\Graft\Graft.uproject" -run=pythonscript -script="D:\Projects\Graft\Tools\x.py" -unattended -nosplash -log
```

How the commandlet behaves [5.8 source, `PythonScriptCommandlet.cpp`]:

- **Argument parsing.** It looks for `-Script=` itself. A quoted value is parsed as a quoted string; an unquoted value is read up to the first space. Put arguments for the script inside the quotes, like `-script="D:\...\x.py --set Courtyard"`, and read them from `sys.argv`.
- **What runs before the script.** It forces Python on, runs startup scripts (`init_unreal.py` and others), and turns source control on with `FScopedSourceControl`. It runs the script with the `Unattended` flag.
- **Exit code.** It returns **-1 if the script raised an uncaught exception** or Python is unavailable. Otherwise it returns 0. **So a script must raise, not just print, to fail the pipeline.**
- **Inline code.** The official doc says `-script` can also be inline Python, with `\n` for line breaks [5.8 docs].

Other ways to run Python:

- **`-ExecutePythonScript="<path> args"`** [5.8 source, `EditorPythonExecuter.cpp`]. It runs after the full editor has loaded and only works when `GIsEditor` is true. It logs an error under `-game`. Use it when a script needs a loaded level or editor UI subsystems. The commandlet does not load a level automatically [5.8 docs].
- `-ExecCmds="py <path>"` also works because `py` is a console command [older docs]. The executer's own comment says to prefer `-ExecutePythonScript` over `ExecCmds`, because it waits for the editor to be ready.

### 6.2 API stability and gotchas

- **The `unreal` module is generated** from reflected C++ and Blueprint-exposed APIs when the editor starts. It changes whenever engine or project reflection changes. There is no frozen version. Treat each engine upgrade as a possible break, and pin GRAFT scripts to 5.8.4 [older docs; standard].
- **Use editor subsystems** (`unreal.get_editor_subsystem(unreal.EditorActorSubsystem)`, `LevelEditorSubsystem`, `UnrealEditorSubsystem`, `EditorAssetSubsystem`) instead of the old `EditorLevelLibrary` / `EditorAssetLibrary`. Those have been deprecated since 5.0 [older docs].
- 5.8 changes [5.8 docs, release notes]:
  - Python now supports `Optional` properties, where `None` means unset.
  - There is a new batch-processor framework: `BatchProcessLibrary.run_batch(..., num_workers=N)`, the `-run=BatchProcessCommandlet` jobs JSON, and `-numworkers=`. Results go to `Saved/MultiprocessResults/results.txt`. Do not use it on a 4-core / 16 GB machine.
  - Fixes for reinstancing Python-generated classes, and the commandlet turning on source control before it runs.
- **Use absolute script paths.** Relative paths are resolved by the Python plugin, not from the shell's working directory [inferred].
- **Do not run a Python commandlet while the editor or another Unreal process is open.** Both would write to the same `Saved/` folder and DDC, and it breaks the one-process rule.
- **Save explicitly.** A commandlet does not save dirty packages for you. Call `unreal.EditorAssetLibrary.save_loaded_asset(...)` or `EditorAssetSubsystem.save_loaded_assets` [older docs].
- **Bundled Python only.** Do not `pip install` into the engine's Python. If a script needs third-party packages, vendor them under `Content/Python/Lib/site-packages` in the project, or keep them in a venv under `D:\Claude` and add it to `sys.path`. Note that GRAFT is zero-budget and solo, so keep scripts free of dependencies where possible.

---

## 7. Unreal MCP plugin

### 7.1 What it is

**It is Epic-official, not third-party** [5.8 source and 5.8 docs].

- The installed engine has `Engine\Plugins\Experimental\ModelContextProtocol\ModelContextProtocol.uplugin`. It has `"FriendlyName": "Unreal MCP"`, `"CreatedBy": "Epic Games, Inc."`, `"IsExperimentalVersion": true` and `"EnabledByDefault": false`.
- Epic's 5.8 release notes and the "Unreal Engine 5.8 Released" forum post both list it as an experimental MCP plugin for agentic AI.
- Epic documents it at "Unreal MCP in Unreal Editor".
- Several third-party projects with similar names exist, including `unreal-mcp` servers on GitHub/mcpservers.org, `ue-mcp`, and Fab listings. **Those are not this plugin.**

Related plugins shipped next to it under `Engine\Plugins\Experimental\` (all off by default):

- `ToolsetRegistry`, which discovers toolsets.
- `Toolsets\AllToolsets`, a convenience plugin that turns every toolset on.
- About 30 individual toolsets. Those that matter for GRAFT: `EditorToolset`, `AutomationTestToolset`, `LiveCodingToolset`, `ConfigSettingsToolset`, `PluginToolset`, `SlateInspectorToolset`, `PhysicsToolsets`, `NiagaraToolsets`, `UMGToolSet`, `StateTreeToolset`, `GameplayTagsToolset`.
- `MCPClientToolset` (marked beta).
- `Terminal`, an optional plugin that runs an agent inside the editor.

### 7.2 What it lets an external agent do

[5.8 docs, plus the third-party write-up checked against them]

- It hosts an MCP server inside a **running Unreal Editor**.
  - Default URL: `http://127.0.0.1:8000/mcp`.
  - Transport: HTTP + Server-Sent Events ("Streamable HTTP"). No stdio, no WebSocket.
  - Server name: `unreal-mcp`.
- **Tools come from toolsets.** By default "Tool Search" is on. The client then sees three meta-tools, `list_toolsets`, `describe_toolset` and `call_tool`, and calls the real tools through `call_tool`.
- **What the docs say it can do:**
  - spawn and edit actors,
  - set up lighting,
  - create material instances,
  - inspect Slate widgets,
  - **run automation tests**,
  - call project-specific tools.
- **Project tools** can be written in Python (subclass `unreal.ToolsetDefinition`) or C++ (`UToolsetDefinition`, or `IModelContextProtocolModule::AddTool()`).
- **Console commands:**
  - `ModelContextProtocol.StartServer [port]`
  - `ModelContextProtocol.StopServer`
  - `ModelContextProtocol.RefreshTools`
  - `ModelContextProtocol.GenerateClientConfig <ClaudeCode|Cursor|VSCode|Gemini|Codex|All>`, which writes `.mcp.json` in the project root.
- **Command-line flags:** `-ModelContextProtocolStartServer` and `-ModelContextProtocolPort=N`.
- **Editor Preferences** (General > Model Context Protocol):
  - Auto Start Server = false
  - Port = 8000
  - Path = `/mcp`
  - Enable Tool Search = true
- **Limits:**
  - Tools only; no shipped toolset offers MCP Resources or Prompts.
  - Tool calls run **one at a time on the game thread**, so overlapping calls from several clients can conflict.
  - Calls are not wrapped in undo transactions automatically.
  - Live Coding cannot add new `UFUNCTION` tools; that needs an editor restart.
  - The registry adapter is editor-only.
  - A timeout does not mean the operation failed; check the editor before retrying.
- **Hotfixes** [5.8 docs, forum post]: 5.8.1 fixed `tools/call` response framing, a crash when adding a component to some Blueprints, and transactions being disabled during tool scripts. A forum user reported that "MCP does nothing" unless the toolset plugins are also enabled.

### 7.3 Security: is the risk local-machine only?

**Mostly yes, with two caveats.** [5.8 source unless noted]

- **Bind address.**
  - The plugin uses the engine's HTTPServer module.
  - `HttpServerConfig.h` defaults `BindAddress` to `"localhost"`.
  - It can be overridden by `[HTTPServer.Listeners] DefaultBindAddress` in Engine ini. `"any"` binds every interface.
  - Neither `BaseEngine.ini` nor the docs set it to anything else, so **by default it is loopback only and not reachable from the LAN or internet** [5.8 source + 5.8 docs].
- **Origin check (DNS-rebinding protection).**
  - `ModelContextProtocolServer.cpp` `ValidateOriginHeader` returns 403 for requests with a non-localhost `Origin` header.
  - It **accepts requests with no Origin header**, which is what non-browser clients send.
  - The plugin's own tests check that `http://evil.example.com` is rejected and that localhost, 127.0.0.1 and no-Origin are accepted.
  - So a malicious web page in your browser cannot drive the editor. **Any local process running as any user on the PC can**, because there is no authentication [5.8 docs: "no authentication layer and is not designed for remote use"].
- **Caveat 1, shared bind setting.** `DefaultBindAddress` is shared with every HTTPServer user in the engine, including Remote Control. If anyone sets it to `any` for another feature, MCP becomes reachable from the LAN without any change to MCP itself. Do not change that key [inferred from source].
- **Caveat 2, power of the tools.** The toolsets can edit assets, change config, toggle plugins and trigger Live Coding. Any local malware, or a buggy agent, gets full editor powers over the project. Epic's docs and the third-party guide say not to bind to `0.0.0.0`, port-forward, or expose it over a LAN or VPN without auth.
- **Telemetry.** The plugin has an `EnableAnalytics` cvar, default `true`, that gates telemetry [5.8 docs]. Set it to false if you want no analytics from MCP use.
- **Port clash.** Port 8000 is a common dev-server port. Use `-ModelContextProtocolPort=` if something else holds it [inferred].

### 7.4 Is it worth turning on for GRAFT?

**Recommendation: not yet. Keep it optional and off by default. Revisit after the M1 go/no-go gate.** [my judgement, based on the facts above]

Against, for now:

- **It conflicts with the pipeline's rules.** MCP needs a running interactive editor. The headless pipeline (build, `UnrealEditor-Cmd` tests, `-game` captures, Python commandlets) needs that editor closed, because the project allows "only one Unreal process at a time" (`Saved/gpu.lock`). A 16 GB / 4-core machine also cannot hold the editor and a second Unreal process well. Every MCP session would have to be bracketed: open editor, use MCP, close editor, then run headless steps.
- **It does not add verification power.** It can run automation tests, but the headless command already does that, with an exit code and `index.json` that are easier to check. It cannot "see" the game better than the screenshot pipeline either.
- **It is experimental.** Its APIs and data formats may change in any hotfix. It needs `AllToolsets` or a hand-picked set of toolset plugins, adding editor start-up cost on a weak PC.

Where it would help later:

- Level-dressing and editor chores that are awkward in headless Python. Examples: placing bookmark actors for `UGraftCaptureSet`, tuning lights, making material instances, checking a UMG widget tree with `SlateInspectorToolset`.
- In those cases it beats writing a one-off Python commandlet, because the agent gets an immediate result.

If it is turned on:

1. Enable only `ModelContextProtocol`, `EditorToolset`, `AutomationTestToolset`, `ConfigSettingsToolset` and any others a task needs, not `AllToolsets`.
2. Leave Auto Start off. Start it by hand with `ModelContextProtocol.StartServer` only for an editor session that needs it.
3. Set `EnableAnalytics` to false.
4. Never change `[HTTPServer.Listeners] DefaultBindAddress`.
5. Treat MCP sessions as "editor open" for the purposes of `gpu.lock`.
6. Log the choice in `Docs/DECISIONS.md`.

---

## 8. Not confirmed for 5.8 specifically

- The nested JSON keys inside `tests[].entries[]` (Section 1.5). Check on the first real report.
- Whether `-game` and `-engine` behave the same as before in the 5.8 project-file generator. They are accepted; I did not trace their behaviour.
- The packaged-build `Saved` root folder (Section 2.1). The `Windows` leaf folder is confirmed; the package root layout comes from older docs.
- Exact Insights export column names for `-sortBy` (Section 5.4). Run one export with `-columns="*"` to see them.
- `Shot` / `Screenshot` console command names (Section 2.3). They are long-standing, but I did not look them up in 5.8 source.
- The overhead figures for `-statnamedevents`, `log` and memory trace channels on this hardware. These are general advice, not measured here.
- The headless editor-context behaviour of functional tests with World Partition maps under `-nullrhi`. The source suggests it works; test it on the first functional test map.

---

## Sources

Local engine (5.8.4, CL 58902052), the main evidence:
- `D:\Epic Games\UE_5.8\Engine\Build\Build.version`, `Engine\Build\BatchFiles\Build.bat`
- `Engine\Source\Programs\UnrealBuildTool\GlobalOptions.cs`
- `Engine\Source\Developer\AutomationController\Private\AutomationCommandline.cpp`, `AutomationControllerManager.cpp`, `AutomationControllerManager.h`
- `Engine\Source\Programs\AutomationTool\Scripts\RunProjectCommand.Automation.cs` (`-testexit` handling)
- `Engine\Source\Runtime\Engine\Private\ParseExecCommands.cpp`, `UnrealClient.cpp`, `GameViewportClient.cpp`, `GameEngine.cpp`, `Tests\AutomationCommon.cpp`, `Streaming\TextureStreamingHelpers.cpp`
- `Engine\Source\Runtime\Core\Private\Misc\Paths.cpp`, `Core\Public\Windows\WindowsPlatformProperties.h`, `Core\Public\Misc\App.h`
- `Engine\Source\Runtime\AutomationTest\Public\AutomationState.h`, `Core\Public\Misc\AutomationEvent.h`
- `Engine\Source\Developer\FunctionalTesting\Classes\FunctionalTest.h`, `Private\FunctionalTest.cpp`, `Private\FunctionalTestingModule.cpp`, `Private\Tests\ClientFuncTestPerforming.cpp`, `Private\AutomationBlueprintFunctionLibrary.cpp`
- `Engine\Source\Runtime\Core\Private\ProfilingDebugging\CsvProfiler.cpp`, `TraceAuxiliary.cpp`
- `Engine\Binaries\DotNET\CsvTools\PerfreportTool.exe` (usage output), `ReportTypes.xml`
- `Engine\Source\Developer\TraceInsights\Private\Insights\TimingProfiler\TimingProfilerManager.cpp`, `Tests\FunctionalTests\ExportCommandsTests.cpp`
- `Engine\Plugins\Experimental\PythonScriptPlugin\PythonScriptPlugin.uplugin`, `Private\PythonScriptCommandlet.cpp`, `Private\EditorUtilities\EditorPythonExecuter.cpp`
- `Engine\Plugins\Experimental\ModelContextProtocol\` (`.uplugin`, `Private\ModelContextProtocolServer.cpp`, tests), `Engine\Source\Runtime\Online\HTTPServer\Private\HttpServerConfig.h/.cpp`
- `Engine\Config\BaseEngine.ini` (`[Trace.ChannelPresets]`, `[/Script/Engine.AutomationTestSettings]`)

Web:
- Unreal Engine 5.8 release notes: https://dev.epicgames.com/documentation/unreal-engine/unreal-engine-5-8-release-notes
- Unreal MCP in Unreal Editor (5.8): https://dev.epicgames.com/documentation/unreal-engine/unreal-mcp-in-unreal-editor
- "Unreal Engine 5.8 Released" forum thread (hotfix notes, MCP comments): https://forums.unrealengine.com/t/unreal-engine-5-8-released/2729274
- Announcement: https://www.unrealengine.com/news/unreal-engine-5-8-is-now-available
- PC Gamer on 5.8 and the MCP plugin: https://pcgamer.com/software/unreal-engine-5-8-launches-with-improved-terrain-and-vegetation-tools-a-lumen-lite-option-for-faster-global-illumination-and-for-the-times-we-now-live-in-an-open-standard-plugin-for-llm-systems/
- Third-party guide, "Using Unreal MCP in UE 5.8 from Codex" (used only where it agrees with Epic's page): https://dev.to/gamedevtoollab/using-unreal-mcp-in-ue-58-from-codex-setup-toolsets-and-safe-editor-automation-4pon
- Scripting the Unreal Editor Using Python: https://dev.epicgames.com/documentation/unreal-engine/scripting-the-unreal-editor-using-python
- Unreal Insights reference (trace channels, command line): https://dev.epicgames.com/documentation/unreal-engine/unreal-insights-reference-in-unreal-engine-5
- Trace Control tab: https://dev.epicgames.com/documentation/unreal-engine/using-the-trace-control-tab-in-unreal-insights-for-unreal-engine
- AFunctionalTest API: https://dev.epicgames.com/documentation/unreal-engine/API/Developer/FunctionalTesting/AFunctionalTest
- Forum, "Run automated testing from command line" (`-TestExit` called legacy): https://forums.unrealengine.com/t/run-automated-testing-from-command-line/294995
- Forum, report output path history: https://forums.unrealengine.com/t/index-html-empty-when-running-automation-tests-and-exporting-them-using-reportoutputpath/471990
- Forum, UE 5.3 tests not found from command line: https://forums.unrealengine.com/t/ue5-3-does-not-find-automation-tests-through-command-line/1747873
- Third-party automation reference (schema only partly right; checked against source): https://tessl.io/registry/testland/unreal-automation-system/files/references/running-and-reporting.md
- Third-party CSV tools notes: https://malikasthings.notion.site/Fast-Profiling-CSV-Tools-2f6c8a2771a980db9d2ef5939bfbd28f
