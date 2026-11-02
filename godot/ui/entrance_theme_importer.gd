extends Control
## Drop-in Godot 4 entrance music importer for The Hunt / Beat the Wolfpack.
## Add this scene/script to a Control in the game UI. Imported tracks are user://
## overrides, separate from the default soundtrack in res://.
signal entrance_theme_changed(mode: String, character: String, path: String)

const MODES := ["The Hunt", "Beat the Wolfpack"]
const HOST := "Arianna Dawson"
const EXTENSIONS := ["wav", "ogg", "mp3"]
const STORE := "user://entrance_themes"
var mode_picker: OptionButton
var slot_picker: OptionButton
var file_dialog: FileDialog
var player: AudioStreamPlayer
var info: Label
var volume_slider: HSlider

func _ready() -> void:
    DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path(STORE))
    var layout := VBoxContainer.new()
    layout.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
    add_child(layout)
    var heading := Label.new()
    heading.text = "The Hunt — Entrance Theme Importer"
    layout.add_child(heading)
    mode_picker = OptionButton.new()
    for mode in MODES:
        mode_picker.add_item(mode)
    layout.add_child(mode_picker)
    slot_picker = OptionButton.new()
    slot_picker.add_item(HOST + " — Host Entrance")
    layout.add_child(slot_picker)
    mode_picker.item_selected.connect(func(_index: int) -> void: _refresh())
    slot_picker.item_selected.connect(func(_index: int) -> void: _refresh())
    var import_button := Button.new()
    import_button.text = "Import Entrance Theme"
    layout.add_child(import_button)
    import_button.pressed.connect(func() -> void: file_dialog.popup_centered_ratio(0.75))
    var preview_button := Button.new()
    preview_button.text = "Preview / Stop"
    layout.add_child(preview_button)
    preview_button.pressed.connect(_toggle_preview)
    var reset_button := Button.new()
    reset_button.text = "Reset to Default"
    layout.add_child(reset_button)
    reset_button.pressed.connect(_reset)
    volume_slider = HSlider.new()
    volume_slider.min_value = 0
    volume_slider.max_value = 1
    volume_slider.step = 0.05
    volume_slider.value = 1
    layout.add_child(volume_slider)
    volume_slider.value_changed.connect(func(value: float) -> void: player.volume_linear = value)
    info = Label.new()
    layout.add_child(info)
    player = AudioStreamPlayer.new()
    add_child(player)
    file_dialog = FileDialog.new()
    file_dialog.access = FileDialog.ACCESS_FILESYSTEM
    file_dialog.file_mode = FileDialog.FILE_MODE_OPEN_FILE
    file_dialog.add_filter("*.wav, *.ogg, *.mp3", "Audio files")
    add_child(file_dialog)
    file_dialog.file_selected.connect(_import_file)
    _refresh()

func _mode_key() -> String:
    return "hunt" if mode_picker.selected == 0 else "btw"

func _destination(extension: String) -> String:
    return "%s/%s_arianna.%s" % [STORE, _mode_key(), extension]

func _selected_path() -> String:
    for extension in EXTENSIONS:
        var path := _destination(extension)
        if FileAccess.file_exists(path):
            return path
    return ""

func _refresh() -> void:
    if info == null:
        return
    var path := _selected_path()
    info.text = "Custom theme ready: " + path if path != "" else "Default theme (no custom override)"
    if player != null:
        player.stop()

func _import_file(path: String) -> void:
    var extension := path.get_extension().to_lower()
    if not EXTENSIONS.has(extension):
        info.text = "Unsupported audio type."
        return
    var bytes := FileAccess.get_file_as_bytes(path)
    if bytes.is_empty():
        info.text = "Could not read audio file."
        return
    var stream := _load_stream(path, bytes)
    if stream == null:
        info.text = "Could not decode audio. Try OGG, MP3, or PCM WAV."
        return
    var target := _destination(extension)
    var file := FileAccess.open(target, FileAccess.WRITE)
    if file == null:
        info.text = "Cannot save imported theme."
        return
    file.store_buffer(bytes)
    file.close()
    for other in EXTENSIONS:
        if other != extension:
            var old := _destination(other)
            if FileAccess.file_exists(old):
                DirAccess.remove_absolute(ProjectSettings.globalize_path(old))
    entrance_theme_changed.emit(_mode_key(), HOST, target)
    _refresh()

func _load_stream(path: String, bytes: PackedByteArray) -> AudioStream:
    match path.get_extension().to_lower():
        "mp3":
            return AudioStreamMP3.load_from_buffer(bytes)
        "ogg":
            return AudioStreamOggVorbis.load_from_buffer(bytes)
        "wav":
            return AudioStreamWAV.load_from_buffer(bytes)
    return null

func _toggle_preview() -> void:
    if player.playing:
        player.stop()
        return
    var path := _selected_path()
    if path == "":
        info.text = "No custom theme imported; the game's default theme plays in-game."
        return
    var stream := _load_stream(path, FileAccess.get_file_as_bytes(path))
    if stream == null:
        info.text = "Unable to preview this audio file."
        return
    player.stream = stream
    player.volume_linear = volume_slider.value
    player.play()

func _reset() -> void:
    player.stop()
    for extension in EXTENSIONS:
        var path := _destination(extension)
        if FileAccess.file_exists(path):
            DirAccess.remove_absolute(ProjectSettings.globalize_path(path))
    entrance_theme_changed.emit(_mode_key(), HOST, "")
    _refresh()

## The game entrance director can call this method to get the override stream.
## Returns null when the original res:// soundtrack should be used.
func get_arianna_entrance_stream(mode: String) -> AudioStream:
    var key := "btw" if mode == "btw" else "hunt"
    for extension in EXTENSIONS:
        var path := "%s/%s_arianna.%s" % [STORE, key, extension]
        if FileAccess.file_exists(path):
            return _load_stream(path, FileAccess.get_file_as_bytes(path))
    return null
