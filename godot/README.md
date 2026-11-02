# The Hunt — Godot 4 edition

Independent, playable Godot migration. **The legacy Electron project remains in `Wolfpack_Quiz_Test_Build/`**.

Open `godot/project.godot` in **Godot 4.4 or newer**. Press F6/F5 to run the main stage. The project builds its 3D sets in `main.gd`, without external assets.

- Separate **The Hunt** and **Beat the Wolfpack** 3D stage layouts.
- Walk-out from a cave-style Hunter tunnel, a seated Hunter and scripted line.
- Wide illuminated quiz table, contestant position, clock and live prize LED screens.
- Ten-question/two-minute Cash Builder ($10,000 per correct answer) and perfect 10/10 time bonus.
- Head-to-Head, Raven Double or Nothing, Face the Raven, and Beat the Wolfpack clock battle.
- Persistent imported Hunter themes via **Music Importer**: MP3/OGG/WAV files in `user://entrance_themes/`. Each show has separate Hunter theme slots.
- Existing entrance music director is reused. The audio files are user-supplied and never shipped with public builds.

This is a playable **foundation**, not finished 3D character art or motion-captured animation. First-pass humanoids, walks, seating gestures and the cave are procedural blockouts. The Godot editor can be used to replace them with proper 3D models and animations.

Run headless validation: `godot --headless --path godot --import --quit`.

Build targets: Windows desktop and macOS. Export templates must be installed in Godot for installers.
