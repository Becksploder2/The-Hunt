extends Node3D
## The Hunt — playable Godot 4 migration foundation.
## All game state, HUD screens and stage models are native Godot nodes.

const IMPORTER_SCRIPT = preload("res://ui/entrance_theme_importer.gd")
const DIRECTOR_SCRIPT = preload("res://audio/entrance_music_director.gd")
const HUNTERS = ["The Professor", "The Red Raider", "El Jefe", "The Jet", "The Warden", "The Girl Genius", "The Raven"]
const LINES = {
 "The Professor":"Class is in session.",
 "The Red Raider":"Wreck 'Em! Let's see what you've got.",
 "El Jefe":"You're in my house now.",
 "The Jet":"Try and keep up!",
 "The Warden":"All rise. The Warden is now in session.",
 "The Girl Genius":"Player two has entered the game.",
 "The Raven":"Welcome to the Wolfpack."
}
const QUESTIONS = [
 ["What is the capital of Canada?", ["Ottawa", "Toronto", "Vancouver", "Montreal"], 0],
 ["Which planet is called the Red Planet?", ["Jupiter", "Mars", "Mercury", "Venus"], 1],
 ["How many sides does a hexagon have?", ["Five", "Seven", "Six", "Eight"], 2],
 ["Which element has symbol Au?", ["Gold", "Silver", "Argon", "Iron"], 0],
 ["What is 12 times 8?", ["86", "88", "96", "108"], 2],
 ["Which ocean is the largest?", ["Indian", "Pacific", "Atlantic", "Arctic"], 1],
 ["What is the square root of 144?", ["11", "14", "12", "16"], 2],
 ["Who painted the Mona Lisa?", ["Raphael", "Leonardo da Vinci", "Van Gogh", "Michelangelo"], 1],
 ["Which country contains Kyoto?", ["Japan", "China", "Thailand", "South Korea"], 0],
 ["What does CPU stand for?", ["Central Power Unit", "Computer Processing User", "Central Processing Unit", "Core Peripheral Unit"], 2],
 ["Which sport traditionally uses a puck?", ["Soccer", "Hockey", "Baseball", "Tennis"], 1],
 ["How many degrees are in a right angle?", ["45", "180", "90", "360"], 2],
 ["Which gas do plants absorb?", ["Oxygen", "Hydrogen", "Carbon dioxide", "Helium"], 2],
 ["Which musical instrument has black and white keys?", ["Piano", "Trumpet", "Violin", "Trombone"], 0],
 ["What is the capital of Australia?", ["Sydney", "Melbourne", "Canberra", "Brisbane"], 2],
 ["How many months are in a year?", ["10", "11", "12", "13"], 2],
 ["What is the fastest land animal?", ["Lion", "Cheetah", "Horse", "Greyhound"], 1],
 ["What is water's chemical formula?", ["CO2", "H2O", "O2", "NaCl"], 1],
 ["What year did people first land on the Moon?", ["1972", "1959", "1969", "1981"], 2],
 ["Which country is Rome in?", ["Spain", "Italy", "Greece", "France"], 1]
]
const RED = Color("#c92035")
const ORANGE = Color("#e17830")
const DARK = Color("#0c101a")
const BLUE = Color("#163c56")
const WHITE = Color("#edf4fb")
const SKIN = Color("#d9a17b")
const SLOGANS = {
 "opening":"Let the Hunt Begin!",
 "builder":"The Hunt Starts Here!",
 "entrance":"You're in Their Territory Now!",
 "pressure":"The Pack Is Closing In!",
 "offers":"Run With the Pack… or Fall Behind!",
 "btw":"Time to Face the Pack!",
 "raven":"The Raven Awaits!",
 "final":"There's Nowhere Left to Hide!"
}

const HUNTER_SHOW_LOOKS = {
 "The Professor":{"name":"KARLI-RAE GOMEZ","tagline":"CLASS IS IN SESSION","primary":Color("#8c1234"),"accent":Color("#eab55c"),"tempo":2.3},
 "The Red Raider":{"name":"SCARLETT RAINES","tagline":"WRECK 'EM!","primary":Color("#df1028"),"accent":Color("#f3f4f6"),"tempo":5.8},
 "El Jefe":{"name":"ERIC HERRERA","tagline":"YOU'RE IN MY HOUSE","primary":Color("#21476b"),"accent":Color("#e8bb72"),"tempo":3.1},
 "The Jet":{"name":"JUSTIN SILVA","tagline":"TRY AND KEEP UP","primary":Color("#116ca2"),"accent":Color("#bce9fb"),"tempo":5.2},
 "The Warden":{"name":"ABBY WARREN","tagline":"ALL RISE","primary":Color("#393a48"),"accent":Color("#df6f5c"),"tempo":2.7},
 "The Girl Genius":{"name":"JENNY KAY","tagline":"PLAYER TWO HAS ENTERED","primary":Color("#e7439a"),"accent":Color("#f4d287"),"tempo":4.1},
 "The Raven":{"name":"THE WOLFPACK LEADER","tagline":"WELCOME TO THE WOLFPACK","primary":Color("#171825"),"accent":Color("#fd791c"),"tempo":3.9}
}

var mode := "hunt"
var phase := "menu"
var question_index := 0
var answer_number := 0
var right_answers := 0
var time_remaining := 120.0
var individual_money := 0
var team_money := 0
var surviving := 0
var contestant_index := 0
var contestant_names: Array = ["Contestant 1", "Contestant 2", "Contestant 3", "Contestant 4"]
var contestant_styles: Array = []
var round_results: Array = []
var perfect_rounds := 0
var offered_money := 0
var perfect_bonus := 0
var current_hunter := "The Professor"
var player_steps := 2
var hunter_steps := 0
var final_score := 0
var raven_score := 0
var final_stage := "team"
var double_or_nothing := false
var btw_hunters := 2
var btw_clock := 75.0
var total_elapsed := 0.0
var walking := false
var entrance_light: OmniLight3D
var entrance_banner: Label3D
var warning_light: OmniLight3D
var show_camera: Camera3D
var board_marks: Array[Label3D] = []
var host_avatar: Node3D
var bridge_lights: Array[MeshInstance3D] = []
var hunter_tron: Node3D
var tron_title: Label3D
var tron_real_name: Label3D
var tron_tagline: Label3D
var tron_backdrop: MeshInstance3D
var tron_frames: Array[MeshInstance3D] = []
var tron_side_lights: Array[OmniLight3D] = []
var tron_glow_strips: Array[MeshInstance3D] = []
var tron_primary: Color = RED
var tron_accent: Color = ORANGE
var tron_active := false
var entrance_waypoints: Array[Vector3] = []
var tilt_table: Node3D
var walkway_phase := 0.0
var marquee_lamps: Array[OmniLight3D] = []
var marquee_tiles: Array[MeshInstance3D] = []
var studio_fx_clock := 0.0
var studio_burst := 0.0
var walk_elapsed := 0.0
var hunter_avatar: Node3D
var hunter_target: Vector3
var contestant_avatar: Node3D
var studio: Node3D
var camera: Camera3D
var animation_player: AnimationPlayer
var light_main: DirectionalLight3D
var ui: CanvasLayer
var panel: PanelContainer
var content: VBoxContainer
var prize_label: Label3D
var table_prize: Label3D
var stage_clock: Label3D
var status_label: Label
var timer_label: Label
var cash_label: Label
var headline: Label
var music_director: Node
var music_importer: Control
var countdown: Timer
var message := ""
var rng := RandomNumberGenerator.new()

func _ready() -> void:
 rng.randomize()
 for i in range(4):
  contestant_styles.append({"name":"Contestant %d" % [i+1],"skin":"Medium","hair":"Brown","hairStyle":"Short","outfit":"Red","glasses":"No","braces":"No","gender":"Female","height_inches":66})
 _load_contestants()
 _setup_world()
 _setup_ui()
 music_director = DIRECTOR_SCRIPT.new()
 add_child(music_director)
 music_importer = IMPORTER_SCRIPT.new()
 music_importer.visible = false
 music_importer.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
 ui.add_child(music_importer)
 music_importer.entrance_theme_changed.connect(_on_theme_changed)
 music_importer.music_volume_changed.connect(_on_music_volume_changed)
 countdown = Timer.new()
 countdown.wait_time = 1.0
 countdown.timeout.connect(_tick)
 add_child(countdown)
 _main_menu()

func _setup_world() -> void:
 camera = Camera3D.new()
 camera.position = Vector3(0, 8.8, 16.5)
 add_child(camera)
 camera.look_at(Vector3(0, 1.2, -1.0))
 camera.current = true
 var sun := DirectionalLight3D.new()
 sun.rotation_degrees = Vector3(-60,-30,0)
 sun.light_energy = 1.3
 add_child(sun)
 var world_env := WorldEnvironment.new()
 var env := Environment.new()
 env.background_mode = Environment.BG_COLOR
 env.background_color = Color("#070910")
 env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
 env.ambient_light_color = Color("#8e9baa")
 env.ambient_light_energy = 0.75
 world_env.environment = env
 add_child(world_env)
 _rebuild_studio()

func _mat(color: Color, glowing := false) -> StandardMaterial3D:
 var result := StandardMaterial3D.new()
 result.albedo_color = color
 result.metallic = 0.4 if not glowing else 0.05
 result.roughness = 0.34
 if glowing:
  result.emission_enabled = true
  result.emission = color
  result.emission_energy_multiplier = 1.2
 return result

func _box(parent: Node3D, size: Vector3, pos: Vector3, color: Color, glowing := false) -> MeshInstance3D:
 var mesh := MeshInstance3D.new()
 var cube := BoxMesh.new()
 cube.size = size
 mesh.mesh = cube
 mesh.material_override = _mat(color, glowing)
 mesh.position = pos
 parent.add_child(mesh)
 return mesh

func _text(parent: Node3D, words: String, pos: Vector3, font_size: int = 72, scale_factor := 0.008, color: Color = WHITE) -> Label3D:
 var label := Label3D.new()
 label.text = words
 label.font_size = font_size
 label.pixel_size = scale_factor
 label.modulate = color
 label.outline_size = 10
 label.outline_modulate = Color.BLACK
 label.position = pos
 label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
 label.no_depth_test = true
 parent.add_child(label)
 return label

func _arch(parent: Node3D, x: float, z: float) -> void:
 _box(parent,Vector3(3.7,5.0,1.0),Vector3(x,2.5,z),Color("#302b31"))
 _box(parent,Vector3(2.6,4.05,1.08),Vector3(x,2.1,z+0.06),Color("#080809"))
 _box(parent,Vector3(3.8,0.17,1.2),Vector3(x,4.95,z),ORANGE,true)
 _box(parent,Vector3(0.14,4.5,1.3),Vector3(x-1.45,2.3,z),RED,true)
 _box(parent,Vector3(0.14,4.5,1.3),Vector3(x+1.45,2.3,z),RED,true)
 for i in range(4):
  _box(parent,Vector3(3.6-float(i)*0.3,0.18,1.1),Vector3(x,4.5-float(i)*0.5,z-0.08),Color("#24232b"))
 _text(parent,"HUNTER'S LAIR",Vector3(x,5.55,z+0.65),50,0.006,ORANGE)

func _avatar(parent: Node3D, body_color: Color, face: Color, glasses := false, braces := false) -> Node3D:
 var actor := Node3D.new()
 parent.add_child(actor)
 _box(actor,Vector3(0.7,1.0,0.36),Vector3(0,1.28,0),body_color)
 _box(actor,Vector3(0.22,0.78,0.26),Vector3(-0.21,0.45,0),DARK)
 _box(actor,Vector3(0.22,0.78,0.26),Vector3(0.21,0.45,0),DARK)
 _box(actor,Vector3(0.19,0.78,0.22),Vector3(-0.52,1.34,0),face)
 _box(actor,Vector3(0.19,0.78,0.22),Vector3(0.52,1.34,0),face)
 _box(actor,Vector3(0.52,0.62,0.38),Vector3(0,2.15,0),face)
 _box(actor,Vector3(0.59,0.20,0.4),Vector3(0,2.48,0),Color("#523638"))
 if glasses:
  _box(actor,Vector3(0.25,0.15,0.06),Vector3(-0.16,2.22,0.23),RED)
  _box(actor,Vector3(0.25,0.15,0.06),Vector3(0.16,2.22,0.23),RED)
  _box(actor,Vector3(0.07,0.04,0.07),Vector3(0,2.22,0.26),RED)
 if braces:
  _box(actor,Vector3(0.29,0.07,0.06),Vector3(0,1.99,0.25),Color("#edf5ff"),true)
 return actor


func _cylinder(parent: Node3D, radius: float, height: float, pos: Vector3, color: Color, glowing := false) -> MeshInstance3D:
 var instance := MeshInstance3D.new()
 var mesh := CylinderMesh.new()
 mesh.top_radius=radius
 mesh.bottom_radius=radius
 mesh.height=height
 instance.mesh=mesh
 instance.material_override=_mat(color,glowing)
 instance.position=pos
 parent.add_child(instance)
 return instance

func _ring(parent: Node3D, radius: float, pos: Vector3, color: Color) -> void:
 var instance := MeshInstance3D.new()
 var ring := TorusMesh.new()
 ring.inner_radius=radius-0.08
 ring.outer_radius=radius+0.08
 instance.mesh=ring
 instance.material_override=_mat(color,true)
 instance.position=pos
 parent.add_child(instance)

func _featured_hunter(name: String) -> Node3D:
 var jacket := Color("#202536")
 var hair := Color("#392c34")
 var glasses := false
 var braces := false
 match name:
  "The Professor":
   jacket=Color("#b6233e")
   hair=Color("#edc878")
   glasses=true
   braces=true
  "The Girl Genius":
   jacket=Color("#663b86")
   hair=Color("#f044ae")
   glasses=true
   braces=true
  "The Red Raider":
   jacket=Color("#b5222b")
   hair=Color("#a13833")
  "El Jefe":
   jacket=Color("#304568")
  "The Jet":
   jacket=Color("#2854a1")
  "The Warden":
   jacket=Color("#48404e")
   hair=Color("#95714e")
 var model := _avatar(studio,jacket,SKIN,glasses,braces)
 model.name=name.replace(" ","")
 _box(model,Vector3(0.59,0.17,0.41),Vector3(0,2.51,0),hair)
 if name in ["The Professor","The Girl Genius","The Warden","The Red Raider"]:
  for x in [-0.23,0.23]:
   _box(model,Vector3(0.18,0.48,0.36),Vector3(x,2.18,-0.06),hair)
 if name=="The Professor":
  for x in [-0.32,0.32]:
   _box(model,Vector3(0.035,0.7,0.035),Vector3(x,1.86,0.24),Color("#edbf83"),true)
 if name=="The Girl Genius":
  _box(model,Vector3(0.12,0.57,0.11),Vector3(-0.23,2.18,0.20),Color("#f5dc9d"))
 if name=="The Red Raider":
  _text(model,"TT",Vector3(0,1.34,0.25),34,0.004,WHITE)
 if name=="The Raven":
  _text(model,"RAVEN",Vector3(0,1.34,0.25),30,0.003,ORANGE)
 return model

func _featured_contestant(index: int) -> Node3D:
 var look: Dictionary=contestant_styles[clampi(index,0,contestant_styles.size()-1)]
 var jackets: Dictionary={"Purple":Color("#693b85"),"Red":Color("#a92839"),"Blue":Color("#31569b"),"Green":Color("#257957"),"Gold":Color("#be9e4c"),"Black":Color("#252531")}
 var skins: Dictionary={"Light":Color("#efc7a7"),"Medium":Color("#d9a17b"),"Tan":Color("#b77b55"),"Dark":Color("#7b4d38")}
 var hairs: Dictionary={"Brown":Color("#5a3b2d"),"Black":Color("#27222a"),"Blonde":Color("#e6c271"),"Red":Color("#b24a38"),"Gray":Color("#999aa6")}
 var coat: Color=jackets.get(str(look.get("outfit","Red")),RED)
 var complexion: Color=skins.get(str(look.get("skin","Medium")),SKIN)
 var hair: Color=hairs.get(str(look.get("hair","Brown")),Color("#5a3b2d"))
 var has_glasses: bool=str(look.get("glasses","No"))=="Yes"
 var has_braces: bool=str(look.get("braces","No"))=="Yes"
 var model:=_avatar(studio,coat,complexion,has_glasses,has_braces)
 if str(look.get("hairStyle","Short"))!="Bald":
  _box(model,Vector3(0.57,0.17,0.41),Vector3(0,2.51,0),hair)
  if str(look.get("hairStyle","Short"))=="Long":
   for x in [-0.23,0.23]:
    _box(model,Vector3(0.18,0.46,0.36),Vector3(x,2.19,-0.05),hair)
 model.scale.y=clampf(float(look.get("height_inches",66))/66.0,0.84,1.18)
 return model

func _add_stage_spectacle() -> void:
 # Sweeping ring of practical bulbs and staggered animated red/gold LED tiles.
 # Mesh light bars are inexpensive and animate independently of the quiz HUD.
 for i in range(20):
  var angle := float(i)*TAU/20.0
  var x := sin(angle)*9.3
  var z := cos(angle)*6.5-0.4
  var tile:=_box(studio,Vector3(0.58,0.085,0.86),Vector3(x,0.065,z),RED if i%2==0 else ORANGE,true)
  tile.rotation.y=angle
  marquee_tiles.append(tile)
 for i in range(12):
  var x := (float(i)-5.5)*1.8
  var strip:=_box(studio,Vector3(0.95,0.18,0.16),Vector3(x,6.0,-7.66),RED if i%2==0 else ORANGE,true)
  marquee_tiles.append(strip)
 for i in range(6):
  var pod:=OmniLight3D.new()
  var angle:=float(i)*TAU/6.0
  pod.position=Vector3(sin(angle)*6.2,5.4,cos(angle)*4.7-0.8)
  pod.light_color=RED if i%2==0 else ORANGE
  pod.light_energy=1.6
  pod.omni_range=7.0
  studio.add_child(pod)
  marquee_lamps.append(pod)
 # Illuminated side wings and layered tunnel surround.
 for side in [-1.0,1.0]:
  for height in [0.85,2.1,3.4,4.7]:
   _box(studio,Vector3(0.24,0.12,2.5),Vector3(side*10.6,height,-4.8),ORANGE if height>3.0 else RED,true)
 for index in range(5):
  var y:=0.68+float(index)*0.63
  _box(studio,Vector3(0.12,0.085,1.5),Vector3(5.96,y,-6.3),RED,true)
  _box(studio,Vector3(0.12,0.085,1.5),Vector3(9.44,y,-6.3),ORANGE,true)

func _animate_stage_lights(delta: float) -> void:
 studio_fx_clock+=delta
 studio_burst=maxf(0.0,studio_burst-delta*1.5)
 walkway_phase+=delta
 for i in range(bridge_lights.size()):
  var bar:=bridge_lights[i]
  if is_instance_valid(bar):
   var lit:bool=walking and int(floor(walkway_phase*7.0))%maxi(1,bridge_lights.size())==i
   bar.scale.y=1.65 if lit else 1.0
 var entrance_mode:=walking or phase=="entrance" or phase=="btw_intro"
 var pressure_mode:=phase=="head_to_head" and hunter_steps>=player_steps-1
 var period:=0.18 if entrance_mode else 0.42 if pressure_mode else 0.8
 var sequence:=int(floor(studio_fx_clock/period))
 for i in range(marquee_tiles.size()):
  var tile:=marquee_tiles[i]
  if is_instance_valid(tile):
   var active: bool=(i+sequence)%4<=1
   tile.scale.y=1.25 if active else 0.65
   tile.visible=active or studio_burst>0.05
 for i in range(marquee_lamps.size()):
  var lamp:=marquee_lamps[i]
  if is_instance_valid(lamp):
   var strength:=0.75+0.5*(1.0+sin(studio_fx_clock*(7.0 if entrance_mode else 2.0)+float(i)*1.2))
   lamp.light_energy=strength+studio_burst*2.4
 if entrance_light != null and is_instance_valid(entrance_light) and not walking:
  entrance_light.light_energy=(3.5+1.2*sin(studio_fx_clock*1.8)) if entrance_mode else 2.2

func _rebuild_studio() -> void:
 board_marks.clear()
 bridge_lights.clear()
 tron_frames.clear()
 tron_side_lights.clear()
 tron_glow_strips.clear()
 tron_active=false
 marquee_lamps.clear()
 marquee_tiles.clear()
 studio_fx_clock=0.0
 if studio != null:
  studio.queue_free()
 studio = Node3D.new()
 studio.name = "WolfpackStudio_%s" % mode
 add_child(studio)
 _box(studio,Vector3(25,0.35,29),Vector3(0,-0.3,-3.8),Color("#131b27"))
 _box(studio,Vector3(25,8,0.35),Vector3(0,3.4,-14.2),Color("#111723"))
 for i in range(9):
  var x := (float(i)-4.0)*2.6
  _box(studio,Vector3(0.08,7.0,0.14),Vector3(x,3.1,-7.9),RED,true)
 _box(studio,Vector3(21,0.19,0.4),Vector3(0,6.45,-7.85),ORANGE,true)
 # Concentric overhead LED lighting rings across the studio.
 for radius in [3.0,4.5,6.0]:
  _ring(studio,radius,Vector3(0,6.10,-0.7),RED if radius==4.5 else ORANGE)
 for i in range(8):
  var theta := float(i)*TAU/8.0
  _box(studio,Vector3(0.10,0.075,1.1),Vector3(sin(theta)*8.2,0.03,cos(theta)*6.4-0.5),RED,true)
 _text(studio,"THE HUNT" if mode == "hunt" else "BEAT THE WOLFPACK",Vector3(0,5.1,-7.65),125,0.007,WHITE)
 _add_stage_spectacle()
 if mode=="hunt":
  _build_lair_bridge()
  _build_hunter_titantron()
 else:
  _arch(studio,7.7,-7.3)
 entrance_banner=_text(studio,"HUNTER'S LAIR",Vector3(8.55,5.3,-10.9) if mode=="hunt" else Vector3(7.7,4.45,-6.52),42,0.005,WHITE)
 entrance_light=OmniLight3D.new()
 entrance_light.position=Vector3(8.6,4.0,-11.0) if mode=="hunt" else Vector3(7.7,3.0,-6.2)
 entrance_light.light_color=RED
 entrance_light.light_energy=4.5
 entrance_light.omni_range=8
 studio.add_child(entrance_light)
 warning_light=OmniLight3D.new()
 warning_light.position=Vector3(0,3.5,1.2)
 warning_light.light_color=RED
 warning_light.light_energy=0.0
 warning_light.omni_range=7
 studio.add_child(warning_light)
 # Stage light pillars and colored edges
 for x in [-10.0,-7.0,7.0,10.0]:
  _box(studio,Vector3(0.13,5.2,0.25),Vector3(x,2.6,-7.55),BLUE,true)
 for side in [-1.0,1.0]:
  var spotlight := OmniLight3D.new()
  spotlight.position=Vector3(8.2*side,5.2,1.3)
  spotlight.light_color=ORANGE if side>0.0 else Color("#36afff")
  spotlight.light_energy=3.4
  spotlight.omni_range=14
  studio.add_child(spotlight)
 if mode == "hunt":
  _build_hunt_table()
 else:
  _build_btw_stage()
 # Arianna Dawson holds the host side of the stage.
 host_avatar=_avatar(studio,Color("#25212b"),SKIN,false,false)
 host_avatar.position=Vector3(-8.4,0,-2.0)
 _box(host_avatar,Vector3(0.58,0.23,0.44),Vector3(0,2.50,0),Color("#b76542"))
 _text(studio,"ARIANNA DAWSON",Vector3(-8.4,3.0,-1.9),42,0.004,WHITE)
 hunter_avatar = _featured_hunter("The Professor")
 hunter_avatar.position=Vector3(8.55,1.0,-11.15) if mode=="hunt" else Vector3(7.7,0,-6.8)
 hunter_avatar.visible=false
 contestant_avatar = _avatar(studio,Color("#a41e31"),SKIN)
 contestant_avatar.position=Vector3(0,0,4.0)
 contestant_avatar.visible=false
 _update_3d_screens()

func _build_hunter_titantron() -> void:
 # Stage-left of the elevated cave, angled toward the main camera.
 hunter_tron=Node3D.new()
 hunter_tron.name="HunterTitantronRoot"
 hunter_tron.position=Vector3(3.4,0,-11.7)
 hunter_tron.rotation_degrees.y=-14.0
 studio.add_child(hunter_tron)
 _box(hunter_tron,Vector3(4.9,5.95,0.50),Vector3(0,3.1,-0.15),DARK)
 tron_backdrop=_box(hunter_tron,Vector3(4.42,5.38,0.10),Vector3(0,3.15,0.18),Color("#150e1c"))
 for i in range(9):
  tron_glow_strips.append(_box(hunter_tron,Vector3(4.31,0.09,0.13),Vector3(0,1.05+float(i)*0.52,0.30),RED,true))
 for x in [-2.4,2.4]:
  tron_frames.append(_box(hunter_tron,Vector3(0.17,5.98,0.45),Vector3(x,3.12,0),ORANGE,true))
  for y in [0.42,1.5,2.6,3.7,4.8,5.9]:
   tron_glow_strips.append(_box(hunter_tron,Vector3(0.38,0.20,0.26),Vector3(x,y,0.28),RED,true))
 for y in [0.18,6.05]:
  tron_frames.append(_box(hunter_tron,Vector3(5.1,0.19,0.45),Vector3(0,y,0),ORANGE,true))
 tron_title=_text(hunter_tron,"THE PROFESSOR",Vector3(0,4.15,0.44),90,0.0048,WHITE)
 tron_real_name=_text(hunter_tron,"KARLI-RAE GOMEZ",Vector3(0,3.18,0.45),56,0.0045,WHITE)
 tron_tagline=_text(hunter_tron,"CLASS IS IN SESSION",Vector3(0,1.7,0.47),49,0.0037,ORANGE)
 _text(hunter_tron,"THE HUNT  •  HUNTER INTRODUCTION",Vector3(0,5.5,0.45),39,0.004,WHITE)
 for i in range(4):
  var side:=OmniLight3D.new()
  side.position=Vector3(3.4 + (-3.0 if i%2==0 else 3.0),1.9+float(i/2)*2.65,-10.9)
  side.light_color=RED
  side.light_energy=1.4
  side.omni_range=6.0
  studio.add_child(side)
  tron_side_lights.append(side)
 _set_hunter_presentation("The Professor",false)

func _set_hunter_presentation(hunter: String,make_entrance: bool=true) -> void:
 if mode!="hunt" or tron_title==null or not is_instance_valid(tron_title):
  return
 var profile:Dictionary=HUNTER_SHOW_LOOKS.get(hunter,HUNTER_SHOW_LOOKS["The Raven"])
 tron_primary=profile["primary"]
 tron_accent=profile["accent"]
 tron_title.text=hunter.to_upper()
 tron_title.modulate=WHITE
 tron_real_name.text=profile["name"]
 tron_real_name.modulate=WHITE
 tron_tagline.text=profile["tagline"]
 tron_tagline.modulate=tron_accent
 tron_backdrop.material_override=_mat(tron_primary.darkened(0.68),true)
 for frame in tron_frames:
  frame.material_override=_mat(tron_accent,true)
 for i in range(tron_glow_strips.size()):
  tron_glow_strips[i].material_override=_mat(tron_primary if i%3!=0 else tron_accent,true)
 for i in range(tron_side_lights.size()):
  tron_side_lights[i].light_color=tron_primary if i%2==0 else tron_accent
 tron_active=make_entrance
 if entrance_light!=null:
  entrance_light.light_color=tron_primary
 if entrance_banner!=null:
  entrance_banner.modulate=tron_accent

func _animate_titantron() -> void:
 if not tron_active or tron_title==null or not is_instance_valid(tron_title):
  return
 var profile:Dictionary=HUNTER_SHOW_LOOKS.get(current_hunter,HUNTER_SHOW_LOOKS["The Raven"])
 var tempo:float=float(profile["tempo"])
 var strength:float=0.5+0.5*sin(studio_fx_clock*tempo)
 var energetic:bool=walking or phase=="entrance"
 var pulse:float=1.0 if energetic else 0.27
 for i in range(tron_glow_strips.size()):
  var bar:=tron_glow_strips[i]
  if is_instance_valid(bar):
   bar.visible=not energetic or (i+int(studio_fx_clock*tempo*2.0))%4!=0
   bar.scale.y=0.8+0.55*strength*pulse
 for lamp in tron_side_lights:
  if is_instance_valid(lamp):
   lamp.light_energy=0.8+strength*pulse*2.3

func _bridge_segment(a: Vector3,b: Vector3,index: int) -> void:
 var direction:=b-a
 var distance:=direction.length()
 var midpoint: Vector3=(a+b)*0.5
 var angle: float=atan2(direction.x,direction.z)
 var slab:=_box(studio,Vector3(2.3,0.27,distance+0.1),midpoint+Vector3(0,-0.20,0),Color("#1a202c"))
 slab.rotation.y=angle
 for side in [-1.0,1.0]:
  var offset:=Vector3(cos(angle)*side*1.14,0,-sin(angle)*side*1.14)
  var rail:=_box(studio,Vector3(0.15,0.11,distance+0.1),midpoint+offset+Vector3(0,0.04,0),ORANGE if side>0 else RED,true)
  rail.rotation.y=angle
  bridge_lights.append(rail)
 var strips:int=maxi(2,int(distance/0.65))
 for n in range(strips):
  var t:float=(float(n)+0.5)/float(strips)
  var point:Vector3=a.lerp(b,t)
  var bar:=_box(studio,Vector3(1.75,0.035,0.13),point+Vector3(0,-0.04,0),RED if (n+index)%2==0 else ORANGE,true)
  bar.rotation.y=angle
  bridge_lights.append(bar)
 for t in [0.22,0.78]:
  var point:Vector3=a.lerp(b,t)
  _box(studio,Vector3(0.22,1.05,0.22),point+Vector3(0,-0.76,0),Color("#40404a"))

func _build_lair_bridge() -> void:
 # Lair is a detached high platform; bridge slopes toward the Hunter's chair.
 entrance_waypoints=[
  Vector3(8.55,1.0,-11.15),
  Vector3(8.55,1.0,-9.0),
  Vector3(7.9,0.72,-6.4),
  Vector3(6.3,0.40,-4.65),
  Vector3(3.55,0.36,-5.05),
  Vector3(0.0,0.75,-5.45)
 ]
 _box(studio,Vector3(5.8,1.25,4.25),Vector3(8.55,0.44,-11.3),Color("#28212b"))
 _box(studio,Vector3(5.9,0.13,4.35),Vector3(8.55,1.13,-11.3),ORANGE,true)
 _arch(studio,8.55,-12.6)
 _text(studio,"THE HUNTER'S LAIR",Vector3(8.55,5.65,-11.8),51,0.005,WHITE)
 for i in range(entrance_waypoints.size()-2):
  _bridge_segment(entrance_waypoints[i],entrance_waypoints[i+1],i)
 # Final approach is a floor-level pathway ending directly at the Hunter seat.
 _bridge_segment(entrance_waypoints[entrance_waypoints.size()-2],entrance_waypoints.back(),4)
 for x in [6.2,8.55,10.9]:
  _box(studio,Vector3(0.13,1.6,0.17),Vector3(x,2.1,-11.4),RED,true)

func _build_hunt_table() -> void:
 # Chase-style show geometry adapted for The Hunt: long, narrow, seven-zone
 # inclined playing surface, separate four-person contestant stations and a
 # raised Hunter dais. Distinct Wolfpack scarlet / warm-gold lighting.
 _box(studio,Vector3(6.7,1.28,3.6),Vector3(0,0.54,-5.35),Color("#272133"))
 _box(studio,Vector3(6.92,0.15,3.85),Vector3(0,1.24,-5.35),ORANGE,true)
 _box(studio,Vector3(5.2,0.32,1.3),Vector3(0,1.53,-4.7),RED,true)
 _text(studio,"HUNTER POSITION",Vector3(0,1.56,-4.0),43,0.004,WHITE)
 _seat(Vector3(0,0.75,-5.45))
 # A narrow wedge visually grows taller toward the raised Hunter dais.
 _box(studio,Vector3(4.34,0.83,7.15),Vector3(0,0.69,-0.07),BLUE)
 tilt_table=Node3D.new()
 tilt_table.name="SlopedChaseTable"
 tilt_table.position=Vector3(0,1.41,-0.12)
 tilt_table.rotation_degrees.x=-9.0
 studio.add_child(tilt_table)
 _box(tilt_table,Vector3(4.52,0.21,7.55),Vector3.ZERO,Color("#8c9bac"))
 _box(tilt_table,Vector3(4.55,0.06,7.56),Vector3(0,0.14,0),Color("#1a2231"))
 for x in [-2.24,2.24]:
  _box(tilt_table,Vector3(0.115,0.19,7.56),Vector3(x,0.24,0),ORANGE,true)
 for i in range(7):
  var row_z:float=-3.05+float(i)*1.02
  _box(tilt_table,Vector3(4.04,0.045,0.86),Vector3(0,0.22,row_z),RED if i%2==0 else Color("#893728"),true)
  var marker:=_text(tilt_table,str(i+1),Vector3(-1.65,0.40,row_z),42,0.004,WHITE)
  board_marks.append(marker)
 # Chase-style four contestant stations, visible behind the table's low end.
 for i in range(4):
  var x:float=(float(i)-1.5)*2.55
  _box(studio,Vector3(2.1,1.1,1.1),Vector3(x,0.75,5.35),Color("#34212e"))
  _box(studio,Vector3(2.16,0.14,1.24),Vector3(x,1.37,5.35),RED,true)
  _box(studio,Vector3(1.9,0.11,0.15),Vector3(x,0.91,5.95),ORANGE,true)
  _text(studio,"PLAYER %d" % [i+1],Vector3(x,0.88,6.04),35,0.0036,WHITE)
 # Independent, readable scoreboards and visible front fascias stay vertical.
 _box(studio,Vector3(6.6,1.2,0.22),Vector3(0,1.0,3.83),DARK)
 _box(studio,Vector3(6.72,0.11,0.25),Vector3(0,1.59,3.86),ORANGE,true)
 table_prize=_text(studio,"TEAM PRIZE   $0",Vector3(0,1.05,3.98),69,0.0062,WHITE)
 _box(studio,Vector3(8.5,1.9,0.3),Vector3(0,4.3,-13.9),DARK)
 _box(studio,Vector3(8.62,0.11,0.36),Vector3(0,5.27,-13.9),RED,true)
 _box(studio,Vector3(8.62,0.11,0.36),Vector3(0,3.33,-13.9),ORANGE,true)
 prize_label=_text(studio,"TEAM PRIZE   $0",Vector3(0,4.32,-13.66),75,0.0076,WHITE)
 _box(studio,Vector3(3.75,1.7,0.18),Vector3(-6.5,2.75,4.15),DARK)
 _box(studio,Vector3(3.84,0.12,0.22),Vector3(-6.5,3.64,4.15),RED,true)
 stage_clock=_text(studio,"02:00",Vector3(-6.5,2.75,4.35),111,0.0079,WHITE)
 # Separate rear and side LED geometry mirroring the Chase studio's depth.
 for i in range(13):
  var x:float=(float(i)-6.0)*1.82
  _box(studio,Vector3(0.16,6.2,0.16),Vector3(x,3.0,-13.84),RED if i%2==0 else ORANGE,true)
 for side in [-1.0,1.0]:
  _box(studio,Vector3(0.48,5.1,12.6),Vector3(side*11.35,2.45,-1.15),Color("#211e31"))
  for j in range(7):
   _box(studio,Vector3(0.20,0.12,0.8),Vector3(side*11.03,0.7+float(j)*0.67,-6.2+float(j)*1.54),ORANGE if j%2==0 else RED,true)

func _seat(position: Vector3) -> void:
 _box(studio,Vector3(0.95,0.23,0.92),position+Vector3(0,0.68,0),DARK)
 _box(studio,Vector3(0.95,1.1,0.17),position+Vector3(0,1.14,-0.4),BLUE)
 _box(studio,Vector3(0.13,0.65,0.13),position+Vector3(0,0.27,0),Color("#889099"))

func _build_btw_stage() -> void:
 # A genuinely separate theatre stage: seven Hunter stations in an arc.
 for i in range(7):
  var x := (float(i)-3.0)*2.55
  var z: float = -3.2 + absf(float(i)-3.0)*0.34
  _box(studio,Vector3(2.3,1.2,1.5),Vector3(x,1.15,z),DARK)
  _box(studio,Vector3(2.45,0.13,1.6),Vector3(x,1.83,z),ORANGE,true)
  _text(studio,HUNTERS[i].to_upper(),Vector3(x,1.12,z+0.82),31,0.004,WHITE)
 _box(studio,Vector3(4.5,0.95,2),Vector3(0,1.0,3.4),BLUE)
 _box(studio,Vector3(4.7,0.15,2.1),Vector3(0,1.55,3.4),ORANGE,true)
 table_prize=_text(studio,"PRIZE $0",Vector3(0,1.03,4.47),65,0.006,WHITE)
 _box(studio,Vector3(8.5,1.7,0.2),Vector3(0,3.2,-7.3),DARK)
 prize_label=_text(studio,"PRIZE $0",Vector3(0,3.2,-7.12),70,0.007,WHITE)
 stage_clock=_text(studio,"01:00",Vector3(-6,3.0,3.5),95,0.009,WHITE)

func _setup_ui() -> void:
 ui=CanvasLayer.new()
 add_child(ui)
 panel=PanelContainer.new()
 panel.set_anchors_preset(Control.PRESET_TOP_LEFT)
 panel.position=Vector2(22,22)
 panel.custom_minimum_size=Vector2(540,0)
 var panel_style:=StyleBoxFlat.new()
 panel_style.bg_color=Color("#101019ee")
 panel_style.border_color=Color("#ca293c")
 panel_style.border_width_left=3
 panel_style.border_width_top=3
 panel_style.border_width_right=3
 panel_style.border_width_bottom=3
 panel_style.corner_radius_top_left=11
 panel_style.corner_radius_top_right=11
 panel_style.corner_radius_bottom_left=11
 panel_style.corner_radius_bottom_right=11
 panel_style.content_margin_left=20
 panel_style.content_margin_right=20
 panel_style.content_margin_top=17
 panel_style.content_margin_bottom=17
 panel.add_theme_stylebox_override("panel",panel_style)
 ui.add_child(panel)
 content=VBoxContainer.new()
 content.add_theme_constant_override("separation",9)
 panel.add_child(content)

func _clear_ui() -> void:
 # Only clear presentation widgets. Never stop a live clock during question redraw.
 for child in content.get_children():
  content.remove_child(child)
  child.queue_free()

func _label(words: String, large := false) -> Label:
 var label:=Label.new()
 label.text=words
 label.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART
 label.add_theme_color_override("font_color",WHITE)
 label.add_theme_font_size_override("font_size",27 if large else 17)
 content.add_child(label)
 return label

func _button(caption: String, action: Callable) -> Button:
 var button:=Button.new()
 button.text=caption
 button.custom_minimum_size=Vector2(470,52)
 button.add_theme_font_size_override("font_size",18)
 button.add_theme_color_override("font_color",Color("#ffffff"))
 var normal:=StyleBoxFlat.new()
 normal.bg_color=Color("#24121c")
 normal.border_color=RED
 normal.set_border_width_all(2)
 normal.set_corner_radius_all(6)
 normal.set_content_margin_all(10)
 var hover:=normal.duplicate() as StyleBoxFlat
 hover.bg_color=Color("#942438")
 var pressed:=normal.duplicate() as StyleBoxFlat
 pressed.bg_color=Color("#e23b51")
 button.add_theme_stylebox_override("normal",normal)
 button.add_theme_stylebox_override("hover",hover)
 button.add_theme_stylebox_override("pressed",pressed)
 content.add_child(button)
 button.pressed.connect(action)
 return button

func _heading(title: String) -> void:
 var title_label:=_label(title,true)
 title_label.add_theme_color_override("font_color",Color("#ff566b"))
 title_label.add_theme_font_size_override("font_size",30)
 var intro:=_label(message)
 intro.add_theme_color_override("font_color",Color("#edc2cb"))

func _scoreboard() -> void:
 cash_label=_label("CONTESTANT  $%s      |      TEAM PRIZE  $%s" % [_money(individual_money),_money(team_money)])
 cash_label.add_theme_color_override("font_color",Color("#ffe7b0"))
 cash_label.add_theme_font_size_override("font_size",22)
 timer_label=_label("TIME  %s     •     QUESTIONS  %d/10" % [_clock_string(ceili(time_remaining)),answer_number])
 timer_label.add_theme_font_size_override("font_size",22)
 timer_label.add_theme_color_override("font_color",Color("#ffffff"))
 _update_3d_screens()

func _money(amount: int) -> String:
 var digits:=str(maxi(0,amount))
 var out:=""
 while digits.length()>3:
  out=","+digits.substr(digits.length()-3,3)+out
  digits=digits.substr(0,digits.length()-3)
 return digits+out

func _clock_string(seconds: int) -> String:
 return "%02d:%02d" % [maxi(0,seconds)/60,maxi(0,seconds)%60]

func _update_head_to_head_board() -> void:
 for i in range(board_marks.size()):
  var row:=board_marks[i]
  if is_instance_valid(row):
   var cell:=i+1
   row.text=("◆ HUNTER  " if hunter_steps==cell else "")+("● CONTESTANT" if player_steps==cell else str(cell))
   row.modulate=RED if hunter_steps==cell else Color("#f8d188") if player_steps==cell else WHITE
 if warning_light != null:
  warning_light.light_energy=5.5 if phase=="head_to_head" and hunter_steps>=player_steps-1 else 0.0

func _update_3d_screens() -> void:
 if prize_label != null and is_instance_valid(prize_label):
  prize_label.text=("TEAM PRIZE   $" if mode=="hunt" else "PRIZE   $")+_money(team_money)
 if table_prize != null and is_instance_valid(table_prize):
  table_prize.text=("TEAM PRIZE   $" if mode=="hunt" else "PRIZE   $")+_money(team_money)
 if stage_clock != null and is_instance_valid(stage_clock):
  stage_clock.text=_clock_string(ceili(time_remaining))

func _main_menu() -> void:
 if countdown != null:
  countdown.stop()
 phase="menu"
 _clear_ui()
 message="Let the Hunt Begin!"
 _heading("WOLFPACK STUDIOS — THE HUNT")
 _label("Separate original studio sets · Native Godot 4")
 _button("PLAY THE HUNT",func() -> void: _start_show("hunt"))
 _button("BEAT THE WOLFPACK",func() -> void: _start_show("btw"))
 _button("IMPORT HUNTER ENTRANCE MUSIC",_show_importer)
 _button("EDIT CONTESTANTS",_edit_contestants)
 _button("QUIT",func() -> void: get_tree().quit())

func _show_importer() -> void:
 music_importer.visible=true
 panel.visible=false
 # Exit at the bottom of the importer is a separate overlay button.
 var back:=Button.new()
 back.name="ReturnToHunt"
 back.text="RETURN TO THE HUNT"
 back.set_anchors_preset(Control.PRESET_BOTTOM_LEFT)
 back.position=Vector2(22,820)
 back.custom_minimum_size=Vector2(360,50)
 ui.add_child(back)
 back.pressed.connect(func() -> void:
  music_importer.visible=false
  panel.visible=true
  back.queue_free()
 )

func _on_music_volume_changed(value: float) -> void:
 music_director.set_entrance_volume(value)

func _on_theme_changed(_mode: String,_hunter: String,_path: String) -> void:
 message="Hunter entrance theme saved locally."

func _edit_contestants() -> void:
 phase="creator"
 _clear_ui()
 _heading("CREATE CONTESTANTS")
 _label("Name, clothing, skin, hairstyle, hair color, glasses and braces")
 var choices={
  "outfit":["Purple","Red","Blue","Green","Gold","Black"],
  "skin":["Light","Medium","Tan","Dark"],
  "hairStyle":["Short","Long","Bald","Curly"],
  "hair":["Brown","Black","Blonde","Red","Gray"],
  "glasses":["No","Yes"],
  "braces":["No","Yes"],
  "gender":["Female","Male","Nonbinary"]
 }
 var fields=["outfit","skin","hairStyle","hair","glasses","braces","gender"]
 var field_labels=["CLOTHING","SKIN TONE","HAIRSTYLE","HAIR COLOR","GLASSES","BRACES","GENDER"]
 _label("CONTESTANT %d OF 4" % [contestant_index+1],true)
 var name_field:=LineEdit.new()
 name_field.text=contestant_names[contestant_index]
 name_field.placeholder_text="Contestant name"
 content.add_child(name_field)
 name_field.text_changed.connect(func(value: String) -> void:
  contestant_names[contestant_index]=value
  contestant_styles[contestant_index]["name"]=value
 )
 for i in range(fields.size()):
  var field:String=fields[i]
  _label(field_labels[i])
  var picker:=OptionButton.new()
  var items:Array=choices[field]
  for v in items:
   picker.add_item(str(v))
  var selected:int=items.find(str(contestant_styles[contestant_index].get(field,items[0])))
  picker.select(maxi(0,selected))
  content.add_child(picker)
  picker.item_selected.connect(func(idx: int) -> void:
   contestant_styles[contestant_index][field]=items[idx]
  )
 _label("HEIGHT: %d inches" % [int(contestant_styles[contestant_index].get("height_inches",66))])
 var height:=HSlider.new()
 height.min_value=54
 height.max_value=90
 height.step=1
 height.value=float(contestant_styles[contestant_index].get("height_inches",66))
 content.add_child(height)
 height.value_changed.connect(func(v: float) -> void:
  contestant_styles[contestant_index]["height_inches"]=int(v)
 )
 _button("PREVIOUS CONTESTANT",func() -> void:
  contestant_index=maxi(0,contestant_index-1)
  _edit_contestants()
 )
 _button("SAVE & NEXT / FINISH",func() -> void:
  if contestant_index<3:
   contestant_index+=1
   _edit_contestants()
  else:
   _save_contestants()
 )
 _button("BACK TO MENU",_main_menu)

func _save_contestants() -> void:
 var config:=ConfigFile.new()
 for i in range(4):
  config.set_value("contestants",str(i),contestant_names[i])
  config.set_value("looks",str(i),contestant_styles[i])
 config.save("user://contestants.cfg")
 contestant_index=0
 _main_menu()

func _load_contestants() -> void:
 var config:=ConfigFile.new()
 if config.load("user://contestants.cfg")!=OK:
  return
 for i in range(4):
  contestant_names[i]=str(config.get_value("contestants",str(i),contestant_names[i]))
  var saved=config.get_value("looks",str(i),{})
  if saved is Dictionary:
   contestant_styles[i].merge(saved,true)

func _start_show(chosen_mode: String) -> void:
 mode=chosen_mode
 contestant_index=0
 answer_number=0
 question_index=0
 surviving=0
 team_money=0
 individual_money=0
 right_answers=0
 perfect_rounds=0
 round_results.clear()
 double_or_nothing=false
 message=SLOGANS.opening if mode=="hunt" else SLOGANS.btw
 _rebuild_studio()
 _builder_intro()

func _builder_intro() -> void:
 countdown.stop()
 phase="builder_intro"
 individual_money=0
 right_answers=0
 answer_number=0
 time_remaining=120.0 if mode=="hunt" else 60.0
 message=("CONTESTANT %d: Ten questions or two minutes. $10,000 per correct answer." % [contestant_index+1]) if mode=="hunt" else "Beat the Wolfpack: answer up to five questions."
 _clear_ui()
 _heading("CASH BUILDER — "+(SLOGANS.builder if mode=="hunt" else SLOGANS.btw))
 _scoreboard()
 _button("START CASH BUILDER",func() -> void:
  phase="builder"
  _question_screen()
  countdown.start()
 )
 _button("MAIN MENU",_main_menu)

func _question() -> Array:
 var q: Array=QUESTIONS[question_index%QUESTIONS.size()]
 question_index+=1
 return q

var active_question: Array=[]
func _question_screen() -> void:
 _clear_ui()
 _update_3d_screens()
 _heading("CASH BUILDER" if phase=="builder" else "THE HUNT")
 _scoreboard()
 active_question=_question()
 var q_label:=_label(active_question[0],true)
 q_label.add_theme_color_override("font_color",Color("#fff0dc"))
 for i in range(4):
  var choice:=i
  _button(active_question[1][i],func() -> void: _respond(choice))

func _respond(choice: int) -> void:
 if phase!="builder":
  return
 var correct: bool=choice==int(active_question[2])
 answer_number+=1
 if correct:
  studio_burst=1.0
  right_answers+=1
  individual_money+=10000 if mode=="hunt" else 1000
 message="CORRECT! +$%s" % _money(10000 if mode=="hunt" else 1000) if correct else "Incorrect."
 if answer_number>= (10 if mode=="hunt" else 5):
  _end_builder()
 else:
  _question_screen()

func _tick() -> void:
 if phase=="builder":
  time_remaining=maxf(0.0,time_remaining-1.0)
  if timer_label != null and is_instance_valid(timer_label):
   timer_label.text="TIME  %s     •     QUESTIONS  %d/10" % [_clock_string(ceili(time_remaining)),answer_number]
  _update_3d_screens()
  if time_remaining<=0:
   _end_builder()
 elif phase=="final_team" or phase=="final_raven" or phase=="btw_duel":
  time_remaining=maxf(0.0,time_remaining-1.0)
  if timer_label != null and is_instance_valid(timer_label):
   timer_label.text="TIME  "+_clock_string(ceili(time_remaining))
  _update_3d_screens()
  if time_remaining<=0:
   if phase=="final_team":
    _final_raven()
   elif phase=="final_raven":
    _show_result(raven_score<final_score)
   else:
    _show_result(true)

func _end_builder() -> void:
 countdown.stop()
 if mode=="hunt" and right_answers==10 and answer_number==10:
  perfect_bonus=int(floor(time_remaining/10.0))*1000
  individual_money+=perfect_bonus
  perfect_rounds+=1
  message="PERFECT 10/10! Time bonus: $%s. Raven Super Offer unlocked." % _money(perfect_bonus)
 if mode=="btw":
  team_money=individual_money
  _btw_selection()
 else:
  _begin_hunter_intro()

func _begin_hunter_intro() -> void:
 phase="entrance"
 current_hunter=HUNTERS[contestant_index%6]
 message=SLOGANS.entrance+"  "+current_hunter+" approaches!"
 _clear_ui()
 _heading("HUNTER ENTRANCE")
 _scoreboard()
 _walk_out(current_hunter)
 _button("CONTINUE TO HUNTER OFFERS",_show_offers)

func _walk_out(hunter: String) -> void:
 # Instantiate the active Hunter rather than reusing Karli-Rae's placeholder.
 if hunter_avatar != null and is_instance_valid(hunter_avatar):
  hunter_avatar.queue_free()
 hunter_avatar=_featured_hunter(hunter)
 hunter_avatar.visible=true
 hunter_avatar.position=entrance_waypoints[0] if mode=="hunt" and entrance_waypoints.size()>0 else Vector3(7.7,0,-6.8)
 hunter_target=Vector3(0,0.75,-5.45)
 walking=true
 walk_elapsed=0.0
 _set_hunter_presentation(hunter)
 entrance_banner.text=hunter.to_upper() if entrance_banner != null else "HUNTER"
 if entrance_light != null:
  entrance_light.light_energy=8.0
 camera.position=Vector3(10.4,5.0,-7.2) if mode=="hunt" else Vector3(9.0,3.4,1.2)
 camera.look_at(hunter_avatar.position+Vector3(0,1.9,0))
 music_director.play_entrance(hunter,mode)
 _text(studio,hunter.to_upper(),Vector3(0,4.1,-3.8),60,0.006,ORANGE)

func _process(delta: float) -> void:
 _animate_stage_lights(delta)
 _animate_titantron()
 if walking and hunter_avatar != null and is_instance_valid(hunter_avatar):
  walk_elapsed+=delta
  var total_duration:float=7.5 if mode=="hunt" else 4.1
  var alpha:=clampf(walk_elapsed/total_duration,0.0,1.0)
  var ease:=alpha*alpha*(3.0-2.0*alpha)
  if mode=="hunt" and entrance_waypoints.size()>1:
   var progress:float=ease*float(entrance_waypoints.size()-1)
   var index:int=mini(int(floor(progress)),entrance_waypoints.size()-2)
   var fraction:float=progress-float(index)
   hunter_avatar.position=entrance_waypoints[index].lerp(entrance_waypoints[index+1],fraction)
   var heading:Vector3=entrance_waypoints[index+1]-entrance_waypoints[index]
   hunter_avatar.rotation.y=atan2(heading.x,heading.z)+PI
   var over_bridge:=Vector3(10.2,5.7,-7.2).lerp(Vector3(4.7,3.8,4.1),ease)
   camera.position=over_bridge
  else:
   hunter_avatar.position=Vector3(7.7,0,-6.8).lerp(hunter_target,ease)
   hunter_avatar.rotation.y=sin(walk_elapsed*9.0)*0.065*(1.0-alpha)
   camera.position=Vector3(9.0,3.4,1.2).lerp(Vector3(5.8,3.6,5.8),ease)
  camera.look_at(hunter_avatar.position+Vector3(0,1.9,0))
  if entrance_light != null:
   entrance_light.light_energy=5.0+sin(walk_elapsed*7.0)*2.0
  if alpha>=1.0:
   walking=false
   hunter_avatar.position=hunter_target
   _hunter_sits_and_speaks()

func _hunter_sits_and_speaks() -> void:
 # Camera holds the dialogue shot as the Hunter settles into the chair.
 var seat_motion:=create_tween()
 seat_motion.tween_property(hunter_avatar,"position:y",0.33 if mode=="hunt" else -0.42,0.48).set_trans(Tween.TRANS_SINE)
 seat_motion.parallel().tween_property(hunter_avatar,"scale:y",0.82,0.48)
 var shot:=create_tween()
 shot.tween_property(camera,"position",Vector3(4.6,3.05,2.3),0.75)
 message=("%s: %s" % [current_hunter,LINES.get(current_hunter,"Ready to play?")])
 if current_hunter=="The Professor":
  message+="  (Karli-Rae adjusts her reading glasses.)"
  # A small arm/hand gesture points to her frames during the line.
  if hunter_avatar.get_child_count()>3:
   var arm: Node3D=hunter_avatar.get_child(3) as Node3D
   if arm != null:
    var glasses_gesture:=create_tween()
    glasses_gesture.tween_property(arm,"position:y",1.85,0.3)
    glasses_gesture.tween_property(arm,"position:y",1.34,0.5)
 elif current_hunter=="The Girl Genius":
  message+="  (Jenny Kay smiles, braces visible.)"
 _label(message)

func _show_offers() -> void:
 countdown.stop()
 tron_active=true
 camera.position=Vector3(0,7.4,13.8)
 camera.look_at(Vector3(0,1.3,-1.0))
 phase="offers"
 music_director.stop_entrance()
 _clear_ui()
 message=SLOGANS.offers
 _heading(current_hunter+" — HUNTER OFFERS")
 _scoreboard()
 var base:=maxi(10000,individual_money)
 var offers=[maxi(1000,base/2),individual_money,base*3]
 for i in range(3):
  var pick:=i
  _button(["LOW","MIDDLE","HIGH"][i]+"  $"+_money(offers[i]),func() -> void:
   offered_money=offers[pick]
   player_steps=[1,2,3][pick]
   hunter_steps=0
   _head_to_head()
  )

func _head_to_head() -> void:
 if contestant_avatar != null and is_instance_valid(contestant_avatar):
  contestant_avatar.queue_free()
 contestant_avatar=_featured_contestant(contestant_index)
 contestant_avatar.position=Vector3(0,0,4.0)
 contestant_avatar.rotation.y=PI
 contestant_avatar.visible=true
 camera.position=Vector3(0,7.4,13.8)
 camera.look_at(Vector3(0,1.3,-1.0))
 phase="head_to_head"
 _clear_ui()
 message=SLOGANS.offers
 _heading("HEAD-TO-HEAD — "+current_hunter)
 _label(contestant_names[contestant_index]+" faces "+current_hunter)
 _scoreboard()
 _h2h_question()

func _h2h_question() -> void:
 _update_head_to_head_board()
 for child in content.get_children():
  content.remove_child(child)
  child.queue_free()
 _heading("FACE THE HUNTER")
 _label("Contestant step %d/6 · Hunter step %d/6" % [player_steps,hunter_steps])
 _label("At stake: $"+_money(offered_money))
 active_question=_question()
 _label(active_question[0],true)
 for i in range(4):
  var selected:=i
  _button(active_question[1][i],func() -> void:
   var correct: bool=selected==int(active_question[2])
   if correct:
    studio_burst=1.0
    player_steps+=1
   else:
    hunter_steps+=1
   if hunter_steps>=player_steps:
    _end_head_to_head(false)
   elif player_steps>=6:
    _end_head_to_head(true)
   else:
    if hunter_steps>=player_steps-1:
     message=SLOGANS.pressure
    _h2h_question()
  )

func _end_head_to_head(won: bool) -> void:
 if warning_light != null:
  warning_light.light_energy=0.0
 if won:
  surviving+=1
  team_money+=offered_money
 round_results.append({"name":contestant_names[contestant_index],"won":won,"hunter":current_hunter,"money":offered_money})
 contestant_index+=1
 if contestant_index<4:
  _builder_intro()
 else:
  _raven_offer()

func _raven_offer() -> void:
 phase="raven_offer"
 current_hunter="The Raven"
 message=SLOGANS.raven
 _clear_ui()
 _heading("FACE THE RAVEN — DOUBLE OR NOTHING")
 _label("You got past the Hunters. But double your prize pot says YOU CAN'T BEAT ME!")
 _label("Team prize: $"+_money(team_money)+" · "+str(surviving)+" survivors")
 if perfect_rounds>0:
  _label("SUPER OFFER UNLOCKED! Perfect Cash Builder rounds: "+str(perfect_rounds))
 music_director.play_entrance("The Raven","hunt")
 _button("DECLINE — KEEP $"+_money(team_money),func() -> void:
  double_or_nothing=false
  _final_team()
 )
 _button("ACCEPT — PLAY FOR $"+_money(team_money*2),func() -> void:
  double_or_nothing=true
  team_money*=2
  _final_team()
 )

func _final_team() -> void:
 phase="final_team"
 final_score=surviving
 raven_score=0
 time_remaining=120
 message=SLOGANS.final
 _clear_ui()
 _heading("FACE THE RAVEN — TEAM ROUND")
 _scoreboard()
 _label("Head start: "+str(surviving))
 countdown.start()
 _final_question()

func _final_question() -> void:
 if phase!="final_team" and phase!="final_raven":
  return
 _clear_ui()
 _heading("FACE THE RAVEN — "+("TEAM" if phase=="final_team" else "THE RAVEN"))
 _label("Team: %d  ·  Raven: %d" % [final_score,raven_score])
 _scoreboard()
 active_question=_question()
 _label(active_question[0],true)
 for i in range(4):
  var selected:=i
  _button(active_question[1][i],func() -> void:
   if phase=="final_team":
    if selected==int(active_question[2]):
     final_score+=1
   else:
    if selected==int(active_question[2]):
     raven_score+=1
    if raven_score>=final_score:
     _show_result(false)
     return
   _final_question()
  )

func _final_raven() -> void:
 phase="final_raven"
 countdown.stop()
 time_remaining=120
 music_director.play_entrance("The Raven","hunt")
 _clear_ui()
 message=SLOGANS.final
 _heading("THE RAVEN IS CHASING")
 _label("Raven needs %d points." % [maxi(1,final_score-raven_score)])
 _button("START RAVEN CLOCK",func() -> void:
  countdown.start()
  _final_question()
 )

func _btw_selection() -> void:
 phase="btw_selection"
 _clear_ui()
 message=SLOGANS.btw
 _heading("BEAT THE WOLFPACK")
 _scoreboard()
 for n in range(1,8):
  var count:=n
  _button("FACE %d HUNTERS — $%s" % [n,_money(team_money*n)],func() -> void:
   btw_hunters=count
   team_money*=count
   _btw_intro()
  )

func _btw_intro() -> void:
 phase="btw_intro"
 _clear_ui()
 _heading("THE PACK IS COMING")
 _label("Introducing "+str(btw_hunters)+" Hunters")
 # Entrance themes are announced in sequence; no proprietary songs bundled.
 for i in range(btw_hunters):
  _label(HUNTERS[i])
 _button("BEGIN CLOCK BATTLE",func() -> void:
  time_remaining=60
  btw_clock=45+float(7-btw_hunters)*10.0
  music_director.play_entrance(HUNTERS[0],"btw")
  _btw_duel()
 )

func _btw_duel() -> void:
 phase="btw_duel"
 countdown.start()
 _clear_ui()
 _heading("WOLFPACK CLOCK BATTLE")
 _scoreboard()
 _label("Your time: "+_clock_string(ceili(time_remaining))+" · Hunters: "+_clock_string(ceili(btw_clock)))
 active_question=_question()
 _label(active_question[0],true)
 for i in range(4):
  var selected:=i
  _button(active_question[1][i],func() -> void:
   if selected==int(active_question[2]):
    btw_clock=maxf(0.0,btw_clock-5.0)
    if btw_clock<=0:
     _show_result(true)
     return
   else:
    time_remaining=maxf(0.0,time_remaining-4.0)
   if time_remaining<=0:
    _show_result(false)
   else:
    _btw_duel()
  )

func _show_result(won: bool) -> void:
 countdown.stop()
 music_director.stop_entrance()
 phase="result"
 _clear_ui()
 message="VICTORY!" if won else "THE WOLFPACK WINS."
 _heading(message)
 _label("Prize awarded: $"+_money(team_money if won else 0))
 _button("PLAY AGAIN",_main_menu)
