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
for(const name of ['The Professor','Karli Rae','The Red Raider','Scarlett Raines','El Jefe','Eric','The Jet','Justin','The Raven'])assert.ok(output.includes(name),'Missing roster entry '+name);
assert.ok(!output.includes('Eric Herrera'),'Eric should be credited by first name only');
assert.ok(output.includes('Fight Raiders Fight'),'Scarlett music assignment missing');
verify('CASH BUILDER','start("hunt")');
assert.ok(output.includes('stage3d'),'The Hunt 3D stage container failed to render');
assert.ok(output.includes('Start Cash Builder'),'Cash Builder opening step missing');
vm.runInContext('session.phase="builder";advance()',context,{timeout:3000});
assert.ok(output.includes('data-answer='),'Cash Builder answer buttons did not start');
verify('FACE THE RAVEN','session.phase="final";advance()');
verify('BEAT THE WOLFPACK','start("btw")');
assert.ok(output.includes('Hunter&#39;s Den')||output.includes("Hunter's Den"),'Hunter Den view missing');
verify('Wolfpack Showdown','session.phase="duel";advance()');
assert.ok(output.includes('stage3d'),'Wolfpack 3D scene missing');
for(const view of ['stage','close','entrance','den'])assert.ok(output.includes('data-camera="'+view+'"'),'Missing 3D camera: '+view);
const stageCode=fs.readFileSync(require('node:path').join(__dirname,'app/stage3d.js'),'utf8');
for(const item of ['buildHunt','buildWolfpack','buildDen','updateDen','HUNTER DEN — LIVE','ENTRANCE TUNNEL'])assert.ok(stageCode.includes(item),'Missing 3D stage component: '+item);
console.log('PASS: renderer starts, home and menus render, Arianna host editor opens, Hunt finale and BTW showdown render');
