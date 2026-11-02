extends Node
## Wolfpack entrance music mixer. User audio is stored in user:// and mixed
## below the game's dialogue and cues rather than played at full source gain.
signal entrance_started(character: String)
signal entrance_finished(character: String)

const SETTINGS_PATH := "user://audio_settings.cfg"
const DEFAULT_THEME_VOLUME := 0.38
const DUCK_BACKGROUND := 0.28

@export var music_player_path: NodePath
@export var fade_in_seconds := 0.55
@export var fade_out_seconds := 0.9
var entrance_player: AudioStreamPlayer
var background_player: AudioStreamPlayer
var original_background_volume := 1.0
var entrance_volume := DEFAULT_THEME_VOLUME
var current_character := ""
var fade_tween: Tween
var background_tween: Tween
var stopping := false

func _ready() -> void:
 entrance_volume = read_saved_volume()
 entrance_player = AudioStreamPlayer.new()
 entrance_player.name = "EntranceMusic"
 entrance_player.volume_linear = 0.0
 add_child(entrance_player)
 entrance_player.finished.connect(_on_finished)
 if not music_player_path.is_empty():
  background_player = get_node_or_null(music_player_path) as AudioStreamPlayer

static func read_saved_volume() -> float:
 var config := ConfigFile.new()
 if config.load(SETTINGS_PATH) == OK:
  return clampf(float(config.get_value("mix", "entrance_volume", DEFAULT_THEME_VOLUME)), 0.0, 1.0)
 return DEFAULT_THEME_VOLUME

static func save_volume(value: float) -> void:
 var config := ConfigFile.new()
 config.load(SETTINGS_PATH)
 config.set_value("mix", "entrance_volume", clampf(value,0.0,1.0))
 config.save(SETTINGS_PATH)

func set_entrance_volume(value: float) -> void:
 entrance_volume = clampf(value,0.0,1.0)
 save_volume(entrance_volume)
 if entrance_player != null and entrance_player.playing and not stopping:
  if fade_tween != null and fade_tween.is_running():
   fade_tween.kill()
  fade_tween = create_tween()
  fade_tween.tween_property(entrance_player, "volume_linear", entrance_volume, 0.18)

func play_entrance(character: String, mode: String = "hunt", fallback: AudioStream = null) -> void:
 var stream: AudioStream = _custom_stream(mode, character)
 if stream == null:
  stream = fallback
 if stream == null:
  push_warning("No custom or default entrance music for " + character)
  return
 if fade_tween != null and fade_tween.is_running():
  fade_tween.kill()
 if entrance_player.playing:
  entrance_player.stop()
 stopping = false
 current_character = character
 if background_player != null:
  original_background_volume = background_player.volume_linear
  _fade_background(original_background_volume * DUCK_BACKGROUND)
 entrance_player.stream = stream
 entrance_player.volume_linear = 0.0
 entrance_player.play()
 fade_tween = create_tween()
 fade_tween.tween_property(entrance_player, "volume_linear", entrance_volume, fade_in_seconds).set_trans(Tween.TRANS_SINE)
 entrance_started.emit(character)

func stop_entrance() -> void:
 if entrance_player == null:
  return
 if fade_tween != null and fade_tween.is_running():
  fade_tween.kill()
 if not entrance_player.playing:
  stopping = false
  current_character = ""
  _restore_background()
  return
 stopping = true
 fade_tween = create_tween()
 fade_tween.tween_property(entrance_player, "volume_linear", 0.0, fade_out_seconds).set_trans(Tween.TRANS_SINE)
 fade_tween.tween_callback(_finish_stop)
 _restore_background()

func _finish_stop() -> void:
 if entrance_player != null:
  entrance_player.stop()
 stopping = false
 current_character = ""

func _on_finished() -> void:
 if stopping:
  return
 var finished_character := current_character
 current_character = ""
 _restore_background()
 entrance_finished.emit(finished_character)

func _restore_background() -> void:
 if background_player != null:
  _fade_background(original_background_volume)

func _fade_background(target: float) -> void:
 if background_player == null:
  return
 if background_tween != null and background_tween.is_running():
  background_tween.kill()
 background_tween = create_tween()
 background_tween.tween_property(background_player, "volume_linear", target, 0.5)

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
