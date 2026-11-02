'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync(require('node:path').join(__dirname,'app/game.js'),'utf8');
const elements={};
let output='';
const context={
 console,Math,JSON,Number,String,Array,Object,Set,Date,Boolean,window:{wolfStage:{render(){},destroy(){},setView(){},updateDen(){}},wolfAudio:{start(){},stop(){},answer(){},result(){},toggle(){}}},
 localStorage:{getItem(){return null},setItem(){}},
 document:{
   querySelectorAll(){return []},querySelector(){return null},
   getElementById(id){return id==='app'?{set innerHTML(v){output=v},get innerHTML(){return output}}:(elements[id]||null)},
   addEventListener(){}
 },
 alert(){},confirm(){return true},
 setInterval(){return 1},clearInterval(){}
};
vm.createContext(context);
vm.runInContext(html,context,{filename:'game.js',timeout:3000});
function verify(label,expression){vm.runInContext(expression,context,{timeout:3000});assert.ok(output.includes(label),'Missing '+label);}
assert.ok(output.includes('THE HUNT'),'Home screen failed to render');
verify('Create a Host','go("host")');
assert.ok(output.includes('Arianna Dawson'),'Default host missing');
verify('Question Creator','go("create")');
for(const name of ['The Professor','Karli Rae','The Red Raider','Scarlett Raines','El Jefe','Eric Herrera','The Jet','Justin Silva','The Warden','Abby Warren','The Girl Genius','Jenny Kay','The Raven'])assert.ok(output.includes(name),'Missing roster entry '+name);
assert.ok(output.includes('Eric Herrera'),'Eric full name missing');
assert.ok(output.includes('Justin Silva'),'Justin full name missing');
assert.ok(output.includes('judge-and-warden verdicts'),'Abby Warden persona missing');
assert.ok(output.includes('Anne Hegerty and Jenny Ryan'),'Karli personality blend missing');
assert.equal(vm.runInContext('hunterResponseDelay({selectedHunters:["The Warden"]})',context),1,'Abby must answer fastest');
assert.equal(vm.runInContext('hunterResponseDelay({selectedHunters:["El Jefe"]})',context),3,'Other Hunters should differ in speed');
assert.ok(vm.runInContext('hunterAccuracy({selectedHunters:["The Warden"]})',context)>vm.runInContext('hunterAccuracy({selectedHunters:["The Jet"]})',context),'Abby accuracy should exceed Justin');
assert.ok(output.includes('Fight Raiders Fight'),'Scarlett music assignment missing');
assert.ok(output.includes('Lockdown (original theme cue)'),'Warden music cue missing');
assert.equal(vm.runInContext('hunterLine("The Warden","intro")',context),'All rise. The Warden is now in session.','Warden judge entrance missing');
assert.ok(vm.runInContext('hunterLine("The Warden","victory")',context).includes('Case closed'),'Warden verdict line missing');
assert.ok(output.includes('pink hair')||output.includes('Pink hair'),'Jenny appearance specification missing');
assert.ok(vm.runInContext('hunterLine("The Girl Genius","intro")',context).includes('Player two'),'Jenny retro gaming dialogue missing');
assert.ok(vm.runInContext('hunterLine("The Red Raider","offer")',context).includes('TCU'),'Scarlett rivalry dialogue missing');
verify('Create a Contestant','go("contestants")');
assert.ok(output.includes('Save & Next ▶'),'Contestant step wizard missing');
for(const select of ['con_hair','con_glasses','con_outfit'])assert.ok(output.includes('<select id="'+select+'"'),'Contestant dropdown missing: '+select);
verify('Hunter rotation','go("show")');
assert.ok(output.includes('builderSeconds'),'Show timer dropdown missing');
verify('Edit Host','go("host")');
for(const select of ['host_hair','host_style','host_glasses','host_braces','host_outfit'])assert.ok(output.includes('<select id="'+select+'"'),'Host dropdown missing: '+select);
verify('Music Importer','go("music")');
verify('Career Records','go("records")');
verify('CASH BUILDER','start("hunt")');
assert.ok(output.includes('stage3d'),'The Hunt 3D stage container failed to render');
assert.ok(output.includes('metal-timer'),'Metallic blue live countdown missing');
assert.ok(output.includes('Start Cash Builder'),'Cash Builder opening step missing');
vm.runInContext('session.phase="builder";advance()',context,{timeout:3000});
assert.ok(output.includes('data-answer='),'Cash Builder answer buttons did not start');
assert.ok(output.includes('broadcast-question')&&output.includes('broadcast-answer'),'Broadcast-style answer boxes missing');
verify('FACE THE RAVEN','session.phase="final";advance()');
verify('BEAT THE WOLFPACK','start("btw")');
assert.ok(output.includes('Hunter&#39;s Den')||output.includes("Hunter's Den"),'Hunter Den view missing');
verify('Wolfpack Showdown','session.phase="duel";advance()');
verify('Hunter Offers','start("hunt");session.phase="offers";advance()');
assert.ok(output.includes('HIGH OFFER'),'Three offer selection not available');
verify('Head-to-Head','session.offer=3000;session.offerStep=2;session.phase="qual";advance()');
assert.ok(output.includes('chase-track'),'Moving money and hunter board missing');
verify('FACE THE RAVEN','session.survivors=2;session.phase="final";advance()');
assert.equal(vm.runInContext('session.score',context),2,'Final Chase missing survivor head start');
verify('THE RAVEN IS CHASING','session.phase="finalHunter";advance()');
verify('Choose your challenge','start("btw");session.phase="choice";advance()');
assert.ok(output.includes('Face 1 Hunter'),'Beat the Wolfpack must allow one Hunter');
verify('Wolfpack Showdown','session.opponents=5;session.phase="duel";advance()');
assert.equal(vm.runInContext('session.selectedHunters.length',context),5,'Five Hunter battle broken');
verify('Face 6 Hunters','session.phase="choice";advance()');
assert.equal(vm.runInContext('selectWolfpackHunters(6).length',context),6,'Six Hunter lineup broken');
verify('Face 7 Hunters','session.phase="choice";advance()');
assert.equal(vm.runInContext('selectWolfpackHunters(7).length',context),7,'Seven Hunter lineup broken');
assert.ok(output.includes('stage3d'),'Wolfpack 3D scene missing');
for(const view of ['stage','close','entrance','den'])assert.ok(output.includes('data-camera="'+view+'"'),'Missing 3D camera: '+view);
const stageCode=fs.readFileSync(require('node:path').join(__dirname,'app/stage3d.js'),'utf8');
for(const item of ['buildHunt','buildWolfpack','buildDen','updateDen','HUNTER DEN — LIVE','ENTRANCE TUNNEL','studioLights','stageArch','curvedDesk','mainFloor','ringPlatform','floorChevron','verticalWallFrames'])assert.ok(stageCode.includes(item),'Missing 3D stage component: '+item);
assert.ok(stageCode.includes('THE GIRL GENIUS'),'Jenny stage station missing');
for(const marker of ['makeIntroLed','introCharacter','paintIntro','playIntroductions','stopIntroductions','updateIntroductions','SHADOW REVEAL','KARLI RAE','SCARLETT RAINES','ERIC HERRERA','JUSTIN SILVA','ABBY WARREN','JENNY KAY','THE RAVEN'])assert.ok(stageCode.includes(marker),'Missing Hunter LED intro element: '+marker);
assert.ok(html.includes("window.wolfStage.playIntroductions([selectedHunter(s.round)])"),'Head-to-Head Hunter reveal is not wired to the intro');
assert.ok(html.includes("window.wolfStage.playIntroductions([...friends,'The Raven'])"),'Beat the Wolfpack all-Hunter reveal missing');

assert.ok(stageCode.includes('addWardenStageEffects')&&stageCode.includes('setWardenMode'),'Warden visual stage effects missing');
assert.ok(stageCode.includes('GIRL GENIUS'),'Jenny Den station missing');
console.log('PASS: expanded 3D studios and broadcast display, Hunter offers, chase board, survivor head start, pushback, BTW 1–7 Hunter battles and editors');
