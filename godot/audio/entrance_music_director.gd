extends Node
## Attach as a child of the game scene, or register as an autoload.
## Set music_player_path to the existing background-music AudioStreamPlayer.
## Call play_entrance("The Raven", "hunt") when an entrance begins.
signal entrance_started(character: String)
signal entrance_finished(character: String)

@export var music_player_path: NodePath
@export var fade_seconds := 0.4
@export var entrance_volume := 1.0
var entrance_player: AudioStreamPlayer
var background_player: AudioStreamPlayer
var original_background_volume := 1.0
var current_character := ""
var fade_tween: Tween

func _ready() -> void:
    entrance_player = AudioStreamPlayer.new()
    entrance_player.name = "EntranceMusic"
    add_child(entrance_player)
    entrance_player.finished.connect(_on_finished)
    if not music_player_path.is_empty():
        background_player = get_node_or_null(music_player_path) as AudioStreamPlayer

func play_entrance(character: String, mode: String = "hunt", fallback: AudioStream = null) -> void:
    var stream := _custom_stream(mode, character)
    if stream == null:
        stream = fallback
    if stream == null:
        push_warning("No custom or default entrance music for " + character)
        return
    stop_entrance()
    current_character = character
    if background_player != null:
        original_background_volume = background_player.volume_linear
        _fade_background(0.0)
    entrance_player.stream = stream
    entrance_player.volume_linear = entrance_volume
    entrance_player.play()
    entrance_started.emit(character)

func stop_entrance() -> void:
    if entrance_player != null and entrance_player.playing:
        entrance_player.stop()
    if background_player != null:
        _fade_background(original_background_volume)
    current_character = ""

func _on_finished() -> void:
    var finished_character := current_character
    current_character = ""
    if background_player != null:
        _fade_background(original_background_volume)
    entrance_finished.emit(finished_character)

func _fade_background(target: float) -> void:
    if fade_tween != null and fade_tween.is_running():
        fade_tween.kill()
    fade_tween = create_tween()
    fade_tween.tween_property(background_player, "volume_linear", target, fade_seconds)

func _custom_stream(mode: String, character: String) -> AudioStream:
    var key := "btw" if mode.to_lower() in ["btw", "beat the wolfpack"] else "hunt"
    var slug := character.to_lower().replace(" ", "_").replace("-", "_")
    for ext in ["mp3", "ogg", "wav"]:
        var path := "user://entrance_themes/%s_%s.%s" % [key, slug, ext]
        if FileAccess.file_exists(path):
            var bytes := FileAccess.get_file_as_bytes(path)
            match ext:
                "mp3": return AudioStreamMP3.load_from_buffer(bytes)
                "ogg": return AudioStreamOggVorbis.load_from_buffer(bytes)
                "wav": return AudioStreamWAV.load_from_buffer(bytes)
    return null
