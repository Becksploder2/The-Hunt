extends Node
## Original game-show answer stings. Synthesized PCM at startup; no copyrighted
## recordings or external dependencies. Each cue has its own channel.

const SAMPLE_RATE := 22050
const CORRECT_DURATION := 0.44
const WRONG_DURATION := 0.57
const MASTER_VOLUME_DB := -10.0

var correct_player: AudioStreamPlayer
var wrong_player: AudioStreamPlayer

func _ready() -> void:
 correct_player=AudioStreamPlayer.new()
 correct_player.name="CorrectAnswerCue"
 correct_player.volume_db=MASTER_VOLUME_DB
 correct_player.stream=_make_cue(true)
 add_child(correct_player)
 wrong_player=AudioStreamPlayer.new()
 wrong_player.name="WrongAnswerCue"
 wrong_player.volume_db=MASTER_VOLUME_DB-1.0
 wrong_player.stream=_make_cue(false)
 add_child(wrong_player)

func play_answer(correct: bool) -> void:
 if correct:
  wrong_player.stop()
  correct_player.stop()
  correct_player.play()
 else:
  correct_player.stop()
  wrong_player.stop()
  wrong_player.play()

func _make_cue(correct: bool) -> AudioStreamWAV:
 var duration:float=CORRECT_DURATION if correct else WRONG_DURATION
 var length:int=int(duration*float(SAMPLE_RATE))
 var pcm:=PackedByteArray()
 pcm.resize(length*2)
 for i in range(length):
  var t:float=float(i)/float(SAMPLE_RATE)
  var attack:float=minf(t/0.012,1.0)
  var release:float=pow(maxf(0.0,1.0-t/duration),2.2)
  var sample:float=0.0
  if correct:
   # Two brisk rising brass-like synth notes, followed by a bright resolve.
   var second:bool=t>=0.16
   var local_t:float=t-0.16 if second else t
   var fundamental:float=740.0 if second else 590.0
   var phase:float=TAU*fundamental*local_t
   var pluck:float=exp(-local_t*6.0)
   sample=(sin(phase)+0.32*sin(phase*2.0)+0.15*sin(phase*3.0))*pluck
   sample+=0.23*sin(TAU*1174.0*t)*exp(-t*8.0)
  else:
   # Descending dissonant synth sting: low buzz with a short two-note fall.
   var fundamental:float=330.0 if t<0.22 else 220.0
   var local_t:float=t if t<0.22 else t-0.22
   var phase:float=TAU*(fundamental-42.0*local_t)*local_t
   sample=(sin(phase)+0.39*sin(phase*1.98)+0.20*sin(phase*0.5))
   sample*=exp(-local_t*3.5)
   sample+=0.13*sin(TAU*73.0*t)*exp(-t*5.0)
  var amplitude:float=clampf(sample*attack*release*0.50,-1.0,1.0)
  var sample_i:int=int(round(amplitude*32767.0))
  pcm[i*2]=sample_i&255
  pcm[i*2+1]=(sample_i>>8)&255
 var stream:=AudioStreamWAV.new()
 stream.format=AudioStreamWAV.FORMAT_16_BITS
 stream.mix_rate=SAMPLE_RATE
 stream.stereo=false
 stream.data=pcm
 return stream
