extends Control
## Godot 4 music importer. Attach to a Control scene.
signal entrance_theme_changed(mode: String, character: String, path: String)

const MODES := ["The Hunt", "Beat the Wolfpack"]
const CHARACTERS := ["Arianna Dawson", "The Professor", "The Red Raider", "El Jefe", "The Jet", "The Girl Genius", "The Warden", "The Raven", "Raven Defeated - Victory March"]
const EXTENSIONS := ["mp3", "ogg", "wav"]
const STORE := "user://entrance_themes"
const AUDIO_SETTINGS := "user://audio_settings.cfg"
const DEFAULT_MIX_VOLUME := 0.38
signal music_volume_changed(value: float)

var mode_picker: OptionButton
var slot_picker: OptionButton
var file_dialog: FileDialog
var player: AudioStreamPlayer
var info: Label
var volume_slider: HSlider

static func slot_key(character: String) -> String:
    return character.to_lower().replace(" ", "_").replace("-", "_")

static func get_override_stream(mode: String, character: String) -> AudioStream:
    var key := "btw" if mode.to_lower() in ["btw", "beat the wolfpack"] else "hunt"
    for ext in EXTENSIONS:
        var path := "%s/%s_%s.%s" % [STORE, key, slot_key(character), ext]
        if FileAccess.file_exists(path):
            return load_audio(path)
    return null

static func load_audio(path: String) -> AudioStream:
    var bytes := FileAccess.get_file_as_bytes(path)
    if bytes.is_empty():
        return null
    match path.get_extension().to_lower():
        "mp3": return AudioStreamMP3.load_from_buffer(bytes)
        "ogg": return AudioStreamOggVorbis.load_from_buffer(bytes)
        "wav": return AudioStreamWAV.load_from_buffer(bytes)
    return null

func _ready() -> void:
    DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path(STORE))
    var layout := VBoxContainer.new()
    layout.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
    add_child(layout)
    var title := Label.new()
    title.text = "Entrance & Victory Music — The Hunt / Beat the Wolfpack"
    layout.add_child(title)
    mode_picker = OptionButton.new()
    for mode in MODES:
        mode_picker.add_item(mode)
    layout.add_child(mode_picker)
    slot_picker = OptionButton.new()
    for character in CHARACTERS:
        slot_picker.add_item(character)
    layout.add_child(slot_picker)
    player = AudioStreamPlayer.new()
    add_child(player)
    player.volume_linear = _saved_volume()
    file_dialog = FileDialog.new()
    file_dialog.access = FileDialog.ACCESS_FILESYSTEM
    file_dialog.file_mode = FileDialog.FILE_MODE_OPEN_FILE
    file_dialog.add_filter("*.mp3, *.ogg, *.wav", "Music")
    add_child(file_dialog)
    var import_button := Button.new()
    import_button.text = "Import / Replace"
    layout.add_child(import_button)
    import_button.pressed.connect(func() -> void: file_dialog.popup_centered_ratio(0.75))
    var preview := Button.new()
    preview.text = "Preview / Stop"
    layout.add_child(preview)
    preview.pressed.connect(_preview)
    var reset := Button.new()
    reset.text = "Reset to Game Default"
    layout.add_child(reset)
    reset.pressed.connect(_reset)
    volume_slider = HSlider.new()
    volume_slider.min_value = 0.0
    volume_slider.max_value = 1.0
    volume_slider.step = 0.05
    volume_slider.value = _saved_volume()
    var hint := Label.new()
    hint.text = "To celebrate defeating The Raven: select The Hunt, then Raven Defeated - Victory March. Import your recording here."
    hint.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
    layout.add_child(hint)
    var volume_label := Label.new()
    volume_label.text = "Hunter entrance music volume (saved automatically)"
    layout.add_child(volume_label)
    layout.add_child(volume_slider)
    volume_slider.value_changed.connect(_volume_changed)
    info = Label.new()
    layout.add_child(info)
    mode_picker.item_selected.connect(func(_i: int) -> void: _refresh())
    slot_picker.item_selected.connect(func(_i: int) -> void: _refresh())
    file_dialog.file_selected.connect(_import)
    _refresh()

func _saved_volume() -> float:
    var cfg := ConfigFile.new()
    if cfg.load(AUDIO_SETTINGS) == OK:
        return clampf(float(cfg.get_value("mix", "entrance_volume", DEFAULT_MIX_VOLUME)), 0.0, 1.0)
    return DEFAULT_MIX_VOLUME

func _volume_changed(value: float) -> void:
    player.volume_linear = value
    var cfg := ConfigFile.new()
    cfg.load(AUDIO_SETTINGS)
    cfg.set_value("mix", "entrance_volume", clampf(value, 0.0, 1.0))
    cfg.save(AUDIO_SETTINGS)
    music_volume_changed.emit(value)

func _mode() -> String:
    return "btw" if mode_picker.selected == 1 else "hunt"

func _character() -> String:
    return CHARACTERS[slot_picker.selected]

func _path(ext: String) -> String:
    return "%s/%s_%s.%s" % [STORE, _mode(), slot_key(_character()), ext]

func _current_path() -> String:
    for ext in EXTENSIONS:
        if FileAccess.file_exists(_path(ext)):
            return _path(ext)
    return ""

func _refresh() -> void:
    player.stop()
    var path := _current_path()
    info.text = "Imported: " + path if path != "" else "Using game default (no custom track)"

func _import(source: String) -> void:
    var ext := source.get_extension().to_lower()
    if not EXTENSIONS.has(ext) or load_audio(source) == null:
        info.text = "Unsupported or unreadable music file."
        return
    var bytes := FileAccess.get_file_as_bytes(source)
    var dest := _path(ext)
    var output := FileAccess.open(dest, FileAccess.WRITE)
    if output == null:
        info.text = "Could not save custom theme."
        return
    output.store_buffer(bytes)
    output.close()
    for other in EXTENSIONS:
        if other != ext and FileAccess.file_exists(_path(other)):
            DirAccess.remove_absolute(ProjectSettings.globalize_path(_path(other)))
    entrance_theme_changed.emit(_mode(), _character(), dest)
    _refresh()

func _preview() -> void:
    if player.playing:
        player.stop()
        return
    var path := _current_path()
    if path == "":
        info.text = "Import a track first to preview it."
        return
    player.stream = load_audio(path)
    if player.stream == null:
        info.text = "Failed to decode imported track."
        return
    player.volume_linear = volume_slider.value
    player.play()

func _reset() -> void:
    player.stop()
    for ext in EXTENSIONS:
        if FileAccess.file_exists(_path(ext)):
            DirAccess.remove_absolute(ProjectSettings.globalize_path(_path(ext)))
    entrance_theme_changed.emit(_mode(), _character(), "")
    _refresh()
