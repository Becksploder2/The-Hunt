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
 game.call("_start_show", "btw")
 await process_frame
 if game.get("phase") != "builder_intro":
  _fail("Beat the Wolfpack did not initialize")
  return
 print("GODOT SMOKE TEST PASS: script, HUD, 3D stage, Hunt and BTW")
 quit(0)
