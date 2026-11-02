extends SceneTree
## Fail if the game script does not parse, scene does not initialize, or
## the basic interactive stage is missing. Export success is not enough.

func _initialize() -> void:
 call_deferred("_verify")

func _fail(reason: String) -> void:
 push_error("GODOT SMOKE TEST FAILED: " + reason)
 quit(1)

func _verify() -> void:
 var packed: PackedScene = load("res://main.tscn") as PackedScene
 if packed == null:
  _fail("main.tscn cannot load")
  return
 var game: Node = packed.instantiate()
 if game == null or game.get_script() == null:
  _fail("Main GDScript failed to parse or attach")
  return
 root.add_child(game)
 await process_frame
 if game.get("phase") != "menu":
  _fail("Startup menu did not initialize")
  return
 if game.get("studio") == null or game.get("camera") == null or game.get("panel") == null:
  _fail("Studio, camera or UI missing")
  return
 if game.get("stage_clock") == null or game.get("table_prize") == null:
  _fail("3D clock or table prize LED missing")
  return
 game.call("_start_show", "hunt")
 await process_frame
 if game.get("phase") != "builder_intro":
  _fail("Cash Builder did not initialize")
  return
 # Clock must keep running even after rebuilding an answer screen.
 game.set("phase","builder")
 var timer: Timer=game.get("countdown")
 timer.start()
 game.call("_question_screen")
 await process_frame
 if timer.is_stopped():
  _fail("Cash Builder clock stopped while displaying first question")
  return
 var before: float=game.get("time_remaining")
 game.call("_tick")
 if float(game.get("time_remaining"))>=before:
  _fail("Cash Builder clock did not count down")
  return
 game.call("_respond",int(game.get("active_question")[2]))
 await process_frame
 if timer.is_stopped():
  _fail("Cash Builder clock stopped after an answer")
  return
 timer.stop()
 game.call("_begin_hunter_intro")
 await process_frame
 if game.get("host_rear_screen")==null:
  _fail("Host rear studio screen missing")
  return
 var led_banks: Array=game.get("uk_led_banks")
 if led_banks.size()<30:
  _fail("Side LED banks missing")
  return
 var screen: Node3D=game.get("hunter_tron")
 if screen==null:
  _fail("Hunter screen missing")
  return
 game.call("_set_hunter_presentation","The Red Raider",true)
 var text_node: Label3D=game.get("tron_title")
 if text_node.text!="THE RED RAIDER":
  _fail("Hunter identity did not update")
  return
 game.call("_set_hunter_presentation","The Professor",true)
 var route: Array=game.get("entrance_waypoints")
 var bridge: Array=game.get("bridge_lights")
 if route.size()<5 or bridge.size()<10:
  _fail("Detached cave bridge and waypoint walkout are missing")
  return
 var sloped: Node3D=game.get("tilt_table")
 if sloped==null or absf(sloped.rotation_degrees.x)<5.0:
  _fail("Chase-style tilted quiz table missing")
  return
 if game.get("phase") != "entrance" or game.get("hunter_avatar") == null:
  _fail("Hunter entrance did not initialize")
  return
 game.call("_hunter_sits_and_speaks")
 await process_frame
 game.call("_show_offers")
 game.call("_head_to_head")
 await process_frame
 if game.get("phase") != "head_to_head" or game.get("contestant_avatar") == null:
  _fail("Hunter desk and active contestant failed to initialize")
  return
 var board: Array=game.get("board_marks")
 if board.size() != 7:
  _fail("Seven-step LED table tracker is missing")
  return
 game.call("_start_show", "btw")
 await process_frame
 if game.get("phase") != "builder_intro":
  _fail("Beat the Wolfpack did not initialize")
  return
 print("GODOT SMOKE TEST PASS: script, broadcast HUD, 3D studio, Hunter entrance, chase table and BTW")
 quit(0)
