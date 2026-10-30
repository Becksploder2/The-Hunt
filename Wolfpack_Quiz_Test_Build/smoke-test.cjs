'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync(require('node:path').join(__dirname,'app/game.js'),'utf8');
const elements={};
let output='';
const context={
 console,Math,JSON,Number,String,Array,Object,Set,Date,Boolean,
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
verify('FACE THE RAVEN','start("hunt");session.phase="final";advance()');
verify('Wolfpack Showdown','start("btw");session.phase="duel";advance()');
assert.ok(output.includes('Hunters'),'Wolfpack lineup missing');
console.log('PASS: renderer starts, home and menus render, Arianna host editor opens, Hunt finale and BTW showdown render');
