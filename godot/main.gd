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
 countdown = Timer.new()
 countdown.wait_time = 1.0
 countdown.timeout.connect(_tick)
 add_child(countdown)
 _main_menu()

func _setup_world() -> void:
 camera = Camera3D.new()
 camera.position = Vector3(0, 8.8, 16.5)
 camera.look_at(Vector3(0, 1.2, -1.0))
 camera.current = true
 add_child(camera)
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

func _rebuild_studio() -> void:
 if studio != null:
  studio.queue_free()
 studio = Node3D.new()
 studio.name = "WolfpackStudio_%s" % mode
 add_child(studio)
 _box(studio,Vector3(23,0.35,19),Vector3(0,-0.3,0),Color("#131b27"))
 _box(studio,Vector3(23,8,0.35),Vector3(0,3.4,-8.2),Color("#111723"))
 for i in range(9):
  var x := (float(i)-4.0)*2.6
  _box(studio,Vector3(0.08,7.0,0.14),Vector3(x,3.1,-7.9),RED,true)
 _box(studio,Vector3(21,0.19,0.4),Vector3(0,6.45,-7.85),ORANGE,true)
 _text(studio,"THE HUNT" if mode == "hunt" else "BEAT THE WOLFPACK",Vector3(0,5.1,-7.65),125,0.007,WHITE)
 _arch(studio,7.7,-7.3)
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
 hunter_avatar = _avatar(studio,Color("#43141e"),SKIN,true,true)
 hunter_avatar.position=Vector3(7.7,0,-6.8)
 hunter_avatar.visible=false
 contestant_avatar = _avatar(studio,Color("#a41e31"),SKIN)
 contestant_avatar.position=Vector3(0,0,4.0)
 contestant_avatar.visible=false
 _update_3d_screens()

func _build_hunt_table() -> void:
 # Wide seated table, separate Hunter and contestant positions, not a runway.
 _box(studio,Vector3(8.6,0.25,4.5),Vector3(0,0.7,-0.2),DARK)
 _box(studio,Vector3(8.1,0.75,4.25),Vector3(0,1.05,-0.2),BLUE)
 _box(studio,Vector3(8.9,0.2,4.75),Vector3(0,1.52,-0.2),Color("#889ca7"))
 _box(studio,Vector3(8.9,0.055,4.78),Vector3(0,1.66,-0.2),Color("#1c2531"))
 for edge in [-4.42,4.42]:
  _box(studio,Vector3(0.10,0.17,4.78),Vector3(edge,1.7,-0.2),ORANGE,true)
 for i in range(7):
  _box(studio,Vector3(6.3,0.035,0.47),Vector3(0,1.70,-1.75+float(i)*0.55),RED if i%2==0 else BLUE,true)
 # Front-of-table team prize LED
 _box(studio,Vector3(7.95,0.95,0.11),Vector3(0,1.05,2.08),DARK)
 _box(studio,Vector3(8,0.06,0.13),Vector3(0,1.53,2.10),RED,true)
 table_prize=_text(studio,"TEAM PRIZE   $0",Vector3(0,1.08,2.22),73,0.007,WHITE)
 _box(studio,Vector3(9.2,1.65,0.18),Vector3(0,3.0,-7.3),DARK)
 prize_label=_text(studio,"TEAM PRIZE   $0",Vector3(0,3.0,-7.12),70,0.008,WHITE)
 # Clock visible beside contestant
 _box(studio,Vector3(4.35,1.85,0.22),Vector3(-6.1,2.25,3.2),DARK)
 _box(studio,Vector3(4.35,0.13,0.28),Vector3(-6.1,3.2,3.2),RED,true)
 stage_clock=_text(studio,"02:00",Vector3(-6.1,2.22,3.37),117,0.009,WHITE)
 _seat(Vector3(0,0,3.05))
 _seat(Vector3(0,0,-3.25))

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
 panel.custom_minimum_size=Vector2(520,0)
 ui.add_child(panel)
 content=VBoxContainer.new()
 content.add_theme_constant_override("separation",9)
 panel.add_child(content)

func _clear_ui() -> void:
 if countdown != null:
  countdown.stop()
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
 button.custom_minimum_size=Vector2(460,44)
 content.add_child(button)
 button.pressed.connect(action)
 return button

func _heading(title: String) -> void:
 _label(title,true)
 _label(message)

func _scoreboard() -> void:
 cash_label=_label("Prize: $%s  |  Team: $%s" % [_money(individual_money),_money(team_money)])
 timer_label=_label("TIME  %s  |  Correct %d/10" % [_clock_string(int(time_remaining)),right_answers])
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

func _update_3d_screens() -> void:
 if prize_label != null and is_instance_valid(prize_label):
  prize_label.text=("TEAM PRIZE   $" if mode=="hunt" else "PRIZE   $")+_money(team_money)
 if table_prize != null and is_instance_valid(table_prize):
  table_prize.text=("TEAM PRIZE   $" if mode=="hunt" else "PRIZE   $")+_money(team_money)
 if stage_clock != null and is_instance_valid(stage_clock):
  stage_clock.text=_clock_string(ceili(time_remaining))

func _main_menu() -> void:
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
  countdown.start()
  _question_screen()
 )
 _button("MAIN MENU",_main_menu)

func _question() -> Array:
 var q: Array=QUESTIONS[question_index%QUESTIONS.size()]
 question_index+=1
 return q

var active_question: Array=[]
func _question_screen() -> void:
 _clear_ui()
 _heading("CASH BUILDER" if phase=="builder" else "THE HUNT")
 _scoreboard()
 active_question=_question()
 _label(active_question[0],true)
 for i in range(4):
  var choice:=i
  _button(active_question[1][i],func() -> void: _respond(choice))

func _respond(choice: int) -> void:
 if phase!="builder":
  return
 var correct: bool=choice==int(active_question[2])
 answer_number+=1
 if correct:
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
   timer_label.text="TIME  %s  |  Correct %d/10" % [_clock_string(ceili(time_remaining)),right_answers]
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
 hunter_avatar.visible=true
 hunter_avatar.position=Vector3(7.7,0,-6.8)
 hunter_target=Vector3(0,0,-3.4)
 walking=true
 walk_elapsed=0
 music_director.play_entrance(hunter,mode)
 _text(studio,hunter.to_upper(),Vector3(0,4.0,-3.8),67,0.006,ORANGE)

func _process(delta: float) -> void:
 if walking and hunter_avatar != null and is_instance_valid(hunter_avatar):
  walk_elapsed+=delta
  var alpha:=clampf(walk_elapsed/3.0,0.0,1.0)
  hunter_avatar.position=Vector3(7.7,0,-6.8).lerp(hunter_target,alpha)
  hunter_avatar.rotation.y=sin(walk_elapsed*10.0)*0.1*(1.0-alpha)
  if alpha>=1.0:
   walking=false
   hunter_avatar.position=hunter_target
   _hunter_sits_and_speaks()

func _hunter_sits_and_speaks() -> void:
 # First-pass seated pose, to be replaced with rigged animation.
 hunter_avatar.position.y=-0.42
 message=("%s: %s" % [current_hunter,LINES.get(current_hunter,"Ready to play?")])
 if current_hunter=="The Professor":
  message+="  (Karli-Rae Gomez adjusts her reading glasses.)"
 elif current_hunter=="The Girl Genius":
  message+="  (Jenny Kay grins, braces visible.)"
 if status_label != null and is_instance_valid(status_label):
  status_label.text=message
 else:
  _label(message)

func _show_offers() -> void:
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
 contestant_avatar.visible=true
 phase="head_to_head"
 _clear_ui()
 message=SLOGANS.offers
 _heading("HEAD-TO-HEAD — "+current_hunter)
 _label(contestant_names[contestant_index]+" faces "+current_hunter)
 _scoreboard()
 _h2h_question()

func _h2h_question() -> void:
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
