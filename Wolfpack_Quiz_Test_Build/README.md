# Wolfpack Quiz Games — Test Build 0.1

**The Hunt** and **Beat the Wolfpack** are original working prototypes for Wolfpack Studios.

## What's playable
- The Hunt: four individual qualifying challenges, then **Face the Raven** if any contestant survives.
- Beat the Wolfpack: five-question cash builder, choose 2–5 Hunters, timed final showdown.
- Wolfpack Trials: five separate qualifying rounds; surviving contestants face The Raven. Victory permanently unlocks **Become a Hunter** on the current computer profile.
- Become a Hunter: basic Hunter-side timed quiz prototype.
- Create Studio: rename five Hunters, create and import/export questions as JSON.
- 30 sample trivia questions; progress and custom questions saved locally.

## What is not ready
- Actual 3D sets, animated characters, voices, original soundtrack, entrance sequences, complete Create modes, balanced opponent AI, complete TV-style round logic, and custom icons.
- Opponent scoring is currently a simplified prototype simulation; timed rounds have no full animated AI.
- This is a gameplay alpha, **not a commercial-ready release**.

## Download a Windows app without using a command line
1. Create a GitHub repository and upload all files, preserving `.github/workflows/build.yml`.
2. Open **Actions** > **Build Windows and macOS apps** > **Run workflow**.
3. When the run completes, open it and download the **Wolfpack-Windows** artifact (portable EXE and installer) or **Wolfpack-macOS** artifact (DMG).
4. Windows SmartScreen may warn about unsigned alpha apps. Only run builds you trust.

The Windows EXE and macOS DMG are built by GitHub Actions. The source zip itself is not a Windows executable. Internet access is required for GitHub Actions to download Electron and build dependencies. Neither platform's installer is code-signed.
