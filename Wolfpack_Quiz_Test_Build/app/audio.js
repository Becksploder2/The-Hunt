'use strict';
// Original synthetic score and sound effects, generated locally with Web Audio.
// No copyrighted songs, recorded samples, or external dependencies.
(() => {
 let ctx=null,master=null,loop=null,step=0,mode='hunt',muted=false;
 function init(){
   if(ctx)return;
   const A=window.AudioContext||window.webkitAudioContext;
   if(!A)return;
   ctx=new A();master=ctx.createGain();master.gain.value=.15;master.connect(ctx.destination);
 }
 function note(freq,duration=.18,kind='sine',volume=.12,delay=0){
   if(muted)return;
   init();if(!ctx)return;
   if(ctx.state==='suspended')ctx.resume().catch(()=>{});
   const t=ctx.currentTime+delay,osc=ctx.createOscillator(),gain=ctx.createGain();
   osc.type=kind;osc.frequency.setValueAtTime(Math.max(35,freq),t);
   gain.gain.setValueAtTime(.0001,t);
   gain.gain.exponentialRampToValueAtTime(volume,t+.015);
   gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
   osc.connect(gain);gain.connect(master);osc.start(t);osc.stop(t+duration+.03);
 }
 function answer(correct){
   if(correct){note(523,.12,'triangle',.28);note(659,.14,'triangle',.24,.12);note(784,.25,'triangle',.28,.25)}
   else{note(311,.2,'sawtooth',.16);note(220,.33,'sawtooth',.17,.17)}
 }
 function result(won){
   if(won){[392,494,587,784].forEach((n,i)=>note(n,.35,'triangle',.22,i*.13))}
   else{[294,247,196,147].forEach((n,i)=>note(n,.4,'sawtooth',.13,i*.18))}
 }
 function pulse(){
   if(!ctx||muted)return;
   const bass=mode==='btw'?[110,110,146.83,98][step%4]:[110,146.83,130.81,98][step%4];
   note(bass,.21,'triangle',.085);
   if(step%2===0)note(880,.055,'sine',.035,.04);
   if(step%4===3)note(55,.12,'sawtooth',.048);
   step++;
 }
 function stop(){if(loop!==null){clearInterval(loop);loop=null}}
 function start(nextMode){
   mode=nextMode;stop();if(muted)return;init();
   if(!ctx)return;ctx.resume().catch(()=>{});
   pulse();loop=setInterval(pulse,375);
 }
 function toggle(){
   muted=!muted;
   if(muted){stop();if(master)master.gain.value=0;}
   else{if(master)master.gain.value=.15;if(typeof session!=='undefined'&&session)start(session.mode);else answer(true);}
   return !muted;
 }
 window.wolfAudio={start,stop,answer,result,toggle};
})();
