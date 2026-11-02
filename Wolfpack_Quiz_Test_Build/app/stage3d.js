import * as THREE from 'three';
const orange=0xff7900, black=0x090909;
let wardenMode=false,wardenSign=null,wardenLight=null;
let ledSurface=null,ledCtx=null,ledTexture=null,ledTimeline=null,ledPanel=null,introCam=null,cameraBeforeIntro=null;
let scene,camera,renderer,container,current='stage',mode='',animation,denCam,stageCam,closeCam,entranceCam,denDisplay,denReaction='WATCHING',denQuestion='LIVE QUESTION',denHunters=[];
const makeMat=(color,emissive=0)=>new THREE.MeshStandardMaterial({color,roughness:.42,metalness:.28,emissive,emissiveIntensity:.23});
const mDark=makeMat(0x111111),mMetal=makeMat(0x414141),mOrange=makeMat(orange,0x552200),mWhite=makeMat(0xffffff);
function block(w,h,d,x,y,z,mat=mDark,group=scene){
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);mesh.position.set(x,y,z);group.add(mesh);return mesh;
}
function textSurface(label,x,y,z,w=3,h=.6,group=scene) {
 const c=document.createElement('canvas');c.width=768;c.height=128;
 const ctx=c.getContext('2d');ctx.fillStyle='#080808';ctx.fillRect(0,0,768,128);
 ctx.strokeStyle='#ff7900';ctx.lineWidth=12;ctx.strokeRect(5,5,758,118);
 ctx.font='bold 54px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff';ctx.fillText(label,384,66,725);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t,side:THREE.DoubleSide}));
 mesh.position.set(x,y,z);group.add(mesh);return mesh;
}
function mannequin(x,z,group=scene,accent=mOrange){const skin=makeMat(0xd0a082),cloth=accent;const torso=new THREE.Mesh(new THREE.CylinderGeometry(.31,.44,.9,12),cloth);torso.position.set(x,1.35,z);group.add(torso);const head=new THREE.Mesh(new THREE.SphereGeometry(.26,14,10),skin);head.position.set(x,2.12,z);group.add(head);block(.22,.84,.28,x-.24,.67,z,cloth,group);block(.22,.84,.28,x+.24,.67,z,cloth,group);return {head,torso};}
function post(x,z,h=1.4){block(.85,h,.7,x,h/2,z,mDark);block(.95,.12,.8,x,h,z,mOrange);block(.82,.22,.12,x,h*.55,z+.37,mMetal)}
function panelWall(){block(19,.4,15,0,-.2,0,mDark);block(19,7,.25,0,3.3,-8,mMetal);block(.25,6,15,-9.3,2.8,0,mMetal);block(.25,6,15,9.3,2.8,0,mMetal);for(let x=-8;x<=8;x+=2){block(.09,6,.12,x,3,-7.8,mOrange)}for(let z=-6;z<=6;z+=2){block(17,.025,.05,0,.025,z,mOrange)}block(3.1,5,.4,-7.3,2.5,-7.65,mDark);textSurface('ENTRANCE TUNNEL',-7.2,4.3,-7.34,3,.4);}
function light(x,y,z,intensity=9){const p=new THREE.PointLight(orange,intensity,12);p.position.set(x,y,z);scene.add(p);}

const mBlue=makeMat(0x17365b,0x071c38),mIce=makeMat(0x5da4c5,0x082d45),mGold=makeMat(0xb87b30,0x422009),mFloor=makeMat(0x121b27),mGlass=new THREE.MeshPhysicalMaterial({color:0x37617d,metalness:.45,roughness:.12,transparent:true,opacity:.76});
function cylinder(rt,rb,h,x,y,z,mat=mMetal,group=scene,segments=32){const o=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,segments),mat);o.position.set(x,y,z);group.add(o);return o;}
function strip(x1,y1,z1,x2,y2,z2,thickness=.065,mat=mOrange,group=scene){
 const a=new THREE.Vector3(x1,y1,z1),b=new THREE.Vector3(x2,y2,z2),d=b.clone().sub(a);
 const o=new THREE.Mesh(new THREE.CylinderGeometry(thickness,thickness,d.length(),8),mat);
 o.position.copy(a.add(b).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());group.add(o);return o;
}
function truss(){for(let x of [-8,8])for(let z of [-5,1,6]){cylinder(.12,.12,6.2,x,3.1,z,mMetal);cylinder(.2,.2,.12,x,6.3,z,mOrange)}
 for(let z of [-5,1,6]){strip(-8,6.15,z,8,6.15,z,.12,mMetal);for(let x=-7;x<8;x+=2){strip(x,6.15,z,x+1,5.65,z,.045,mGold);strip(x+1,5.65,z,x+2,6.15,z,.045,mGold)}}}
function studioLights(){for(let x=-7;x<=7;x+=3.5){const p=new THREE.SpotLight(0xff9b39,35,22,Math.PI/6,.35);p.position.set(x,6,5);p.target.position.set(x*.45,.2,-3);scene.add(p,p.target);const head=cylinder(.25,.35,.48,x,5.86,5,mMetal);head.rotation.x=.3}
 for(let x of [-8.5,8.5])for(let z of [-5,-1,3]){const p=new THREE.PointLight(0x3b90b9,9,8);p.position.set(x,2.6,z);scene.add(p)}}
function mainFloor(){block(19,.36,15,0,-.32,0,mFloor);for(let i=-8;i<=8;i++){strip(i,.015,-7,i,.015,6.4,.014,mIce)}
 for(let z=-6;z<7;z+=1.5)strip(-8.5,.018,z,8.5,.018,z,.02,mBlue);
 block(15,.21,4,0,.11,-1.8,mDark);block(15,.11,.12,0,.23,.12,mOrange);
 for(let x of [-7.8,7.8])for(let z=-4;z<=4;z+=1.3){cylinder(.09,.09,.05,x,.07,z,mGold)}
}
function doorway(x,z,label){
 block(3.25,4.7,.55,x,2.35,z,mMetal);block(2.58,4,.1,x,2.15,z+.34,mDark);
 for(let k=0;k<4;k++){const w=2.9-k*.35;block(w,.055,.12,x,.7+k*.96,z+.48,mOrange);}
 textSurface(label,x,4.9,z+.51,3,.38);
}
function stageArch(){
 for(let x of [-8.8,8.8]){block(.36,6,.6,x,3,-7.45,mBlue);block(.13,5,.7,x,3,-7.01,mIce)}
 block(18,.38,.75,0,5.95,-7.45,mBlue);
 for(let x=-7;x<=7;x+=2){block(.08,5.3,.18,x,3,-7.04,mOrange);block(1.55,.07,.15,x,5.55,-7.01,mGold)}
}
function curvedDesk(x,y,z,w,name){
 cylinder(w/2.2,w/2.05,.31,x,y,z,mBlue);
 block(w,.23,1.17,x,y+.22,z,mMetal);
 block(w+.12,.095,1.32,x,y+.36,z,mIce);
 block(w-.12,.71,.15,x,y-.2,z+.6,mBlue);
 textSurface(name,x,y-.18,z+.72,w-.14,.42);
}

// Dedicated architectural details rather than a generic podium backdrop.
function ringPlatform(x,y,z,outer,inner,color=mOrange,group=scene){
 const torus=new THREE.Mesh(new THREE.TorusGeometry(outer,.065,8,64),color);
 torus.rotation.x=-Math.PI/2;torus.position.set(x,y,z);group.add(torus);
 const center=new THREE.Mesh(new THREE.CylinderGeometry(inner,inner,.1,48),mBlue);
 center.position.set(x,y-.07,z);group.add(center);
}
function gantry(x,z){for(let y=.8;y<6;y+=.8){block(.07,.09,.22,x,y,z,mIce)}}
function beamFace(x,y,z,w,h,mat=mBlue){block(w,h,.12,x,y,z,mat);block(w,.035,.14,x,y+h/2,z+.03,mIce)}
function verticalWallFrames(){for(const x of [-8.6,-6.6,6.6,8.6]){block(.22,5.6,.25,x,2.95,-7.08,mIce);gantry(x,-6.87)}
 for(let k=0;k<3;k++){beamFace(0,5.68-k*.55,-7.01,11.7-k*.65,.09,k===1?mOrange:mMetal)}}
function seatDetail(x,y,z,angle=0){const group=new THREE.Group();group.position.set(x,y,z);group.rotation.y=angle;scene.add(group);block(.8,.14,.78,0,.48,0,mMetal,group);block(.82,.9,.15,0,.98,-.3,mDark,group);block(.14,.35,.8,-.46,.65,0,mOrange,group);block(.14,.35,.8,.46,.65,0,mOrange,group);cylinder(.13,.13,.55,0,.12,0,mMetal,group)}
function floorChevron(x,z,flip=1){for(let i=0;i<4;i++){strip(x-1.35+i*.4,.07,z,x,.07,z+flip*.65,.04,mIce);strip(x,.07,z+flip*.65,x+1.35-i*.4,.07,z,.04,mIce)}}

function buildChaseLedTable(compact=false){
 const front=compact?1.15:3.45;
 const rear=compact?-1.85:-4.15;
 const center=(front+rear)/2,depth=front-rear;
 const width=compact?3.65:3.85;
 // Suspended, sloped-looking blue-metal frame with illuminated side rails.
 block(width+.50,.27,depth+.42,0,.42,center,mDark);
 block(width+.26,.65,depth+.20,0,.79,center,mBlue);
 block(width+.20,.17,depth+.12,0,1.16,center,mMetal);
 block(width+.12,.065,depth+.02,0,1.28,center,mIce);
 for(const x of [-width/2,width/2]){
  block(.12,.21,depth+.23,x,1.33,center,mOrange);
  block(.065,.055,depth+.27,x,1.47,center,mIce);
  for(let z=rear+.35;z<front;z+=1.05)block(.14,.18,.13,x,1.12,z,mGold);
 }
 // Seven independently legible display segments, like the tracked Hunt board.
 const step=depth/7;
 for(let k=0;k<7;k++){
  const z=rear+(k+.5)*step;
  block(width-.19,.075,step-.075,0,1.365,z,k%2?mBlue:mIce);
  block(width-.10,.032,.06,0,1.418,rear+k*step,mOrange);
 }
 block(width+.4,.17,.22,0,.96,front+.11,mOrange);
 block(width+.4,.17,.22,0,.96,rear-.11,mIce);
 // Distinctive Wolfpack illuminated fascia, leaving the table surface visible.
 textSurface(compact?'WOLFPACK SHOWDOWN':'THE HUNT  •  CHASE BOARD',0,.81,front+.235,width,.40);
 for(const z of [rear+.6,front-.6]){
  const lamp=new THREE.PointLight(0x238fd8,3.4,4.8);
  lamp.position.set(0,1.65,z);scene.add(lamp);
 }
}

function buildHunt(){
 panelWall();mainFloor();truss();studioLights();stageArch();verticalWallFrames();doorway(-7.0,-7.28,'HUNTER TUNNEL');
 for(let k=0;k<4;k++)floorChevron(-5.5+k*3.6,3.65,-1);
 for(let x of [-7.15,7.15]){ringPlatform(x,.35,1.5,1.55,1.35);seatDetail(x,.4,2.9)}
 beamFace(0,2.85,-7.01,12,.27,mDark);
 // Original Wolfpack studio with the Chase-style longitudinal seven-step LED table.
 // The LED playing surface runs toward the host, not across the rear of the stage.
 buildChaseLedTable(false);
 for(let x of [-6.3,6.3]){
  cylinder(1.0,1.26,.38,x,.42,1.38,mMetal);
  cylinder(.85,.95,.28,x,.77,1.38,mOrange);
  block(1.75,1.25,.82,x,1.42,1.38,mBlue);
  block(1.9,.16,1.1,x,2.1,1.38,mGlass);
  mannequin(x,.17,scene,x<0?mOrange:mDark);
 }
 textSurface('THE HUNT',0,4.45,-7.05,7.7,1.1);
 textSurface('CONTESTANT',-6.3,1.45,1.83,1.65,.36);
 textSurface('HUNTER',6.3,1.45,1.83,1.65,.36);
 textSurface('CASH BUILDER  •  HEAD-TO-HEAD  •  FACE THE RAVEN',0,3.46,-7.05,9.2,.47);
 for(let x of [-7.4,0,7.4])light(x,5,-1,10);
}
function buildWolfpack(){
 panelWall();mainFloor();truss();studioLights();stageArch();verticalWallFrames();doorway(-7.1,-7.28,'HUNTER ENTRANCE');
 for(let k=0;k<7;k++){const x=(k-3)*2.23;floorChevron(x,1.72,1);}
 beamFace(0,2.85,-7.01,13.6,.28,mDark);
 textSurface('BEAT THE WOLFPACK',0,4.65,-7.03,11.4,1.05);
 // Seven raised Hunter stations in a shallow arc, not a flat wall graphic.
 for(let i=0;i<7;i++){
  const x=(i-3)*2.23,z=-3.8+Math.abs(i-3)*.32;
  ringPlatform(x,.2,z,1.12,.94,i===6?mWhite:mOrange);
  cylinder(1.28,1.5,.4,x,.34,z,mMetal);
  cylinder(1.18,1.33,.14,x,.59,z,mOrange);
  block(2.48,1.5,1.18,x,1.42,z,mBlue);
  block(2.65,.17,1.43,x,2.29,z,mGlass);
  block(2.42,.15,.2,x,1.52,z+.66,mIce);
  mannequin(x,z+.13,scene,i===6?mWhite:mDark);
  const name=['THE PROFESSOR','THE RED RAIDER','EL JEFE','THE JET','THE WARDEN','THE GIRL GENIUS','THE RAVEN'][i];
  textSurface(name,x,1.17,z+.68,2.38,.42);
  for(let j=0;j<3;j++)block(2.6,.045,.1,x,.83+j*.23,z+.69,mGold);
  if(i===6){block(2.8,.14,1.48,x,2.47,z,mWhite);light(x,4.7,z,17)}
 }
 buildChaseLedTable(true);
 cylinder(1.65,1.8,.35,0,.24,4,mMetal);
 cylinder(1.49,1.61,.14,0,.5,4,mOrange);
 curvedDesk(0,1.8,4,2.8,'CONTESTANT');
 mannequin(0,3.15);
 textSurface('ONE CONTESTANT  ·  SEVEN HUNTERS',0,3.45,-7.02,8.4,.43);
 for(let x of [-7,0,7])light(x,5,-1,12);
}
function buildDen(group){
 // A complete second room, with theater seating, visible Hunter figures, a live
 // question display, reaction indicator, refreshments, doors and a studio feed.
 denHunters=[];
 block(17,.3,11,0,-.12,0,mDark,group);
 block(17,5,.3,0,2.45,-5.4,mMetal,group);
 block(.35,5,11,-8.5,2.45,0,mMetal,group);
 block(.35,5,11,8.5,2.45,0,mMetal,group);
 for(let i=-7;i<=7;i+=2){block(.08,4.6,.12,i,2.35,-5.19,mOrange,group)}
 block(9,3.5,.18,0,3,-5.17,mOrange,group);
 block(8.65,3.13,.2,0,3,-5.02,mDark,group);
 denDisplay=textSurface(denQuestion,0,3.4,-4.84,7.9,.95,group);
 textSurface('HUNTER DEN — LIVE',0,4.4,-4.83,7.7,.37,group);
 const reaction=textSurface('WATCHING THE CONTESTANT',0,2.62,-4.82,7.8,.43,group);
 denReaction=reaction;
 for(let i=0;i<7;i++){
   const x=(i-3)*2.22;
   block(1.9,.5,1.3,x,.5,1.2,mOrange,group);
   block(1.9,1.2,.33,x,1.12,.57,mMetal,group);
   block(.23,.6,1.3,x-.95,.75,1.2,mMetal,group);
   block(.23,.6,1.3,x+.95,.75,1.2,mMetal,group);
   const person=mannequin(x,1.12,group,i===6?mWhite:mDark);
   denHunters.push(person);
   textSurface(['PROFESSOR','RED RAIDER','EL JEFE','THE JET','THE WARDEN','GIRL GENIUS','THE RAVEN'][i],x,.23,2.04,2.45,.3,group);
 }
 block(5,.5,1.6,0,.65,3.75,mMetal,group);
 block(2.1,3.9,.2,6.1,2,-5.1,mOrange,group);
 textSurface('HUNTER ENTRANCE',6.1,3.5,-4.95,2,.33,group);
 block(5,.12,4,-5.5,.04,3.5,mOrange,group);
 const lamp=new THREE.PointLight(orange,25,15);lamp.position.set(0,4,2);group.add(lamp);
}
function updateDen(question,correct){
 denQuestion=String(question||'LIVE QUESTION').slice(0,65);
 if(typeof correct==='boolean')denReaction=correct?'HUNTERS REACT — CONTESTANT CORRECT':'HUNTERS CELEBRATE — CONTESTANT MISSED';
 else denReaction='WATCHING THE CONTESTANT';
 if(!scene)return;
 // Replace only the screen textures when possible, without rebuilding the room.
 const group=scene.children.find(o=>o.userData?.isDen);
 if(!group)return;
 const old=group.children.filter(o=>o.userData?.isLiveFeed);
 for(const o of old){group.remove(o);o.geometry.dispose();o.material.map?.dispose();o.material.dispose();}
 const q=textSurface(denQuestion,0,3.4,-4.76,7.9,.95,group);
 const reaction=textSurface(denReaction,0,2.62,-4.75,7.8,.43,group);
 q.userData.isLiveFeed=true;reaction.userData.isLiveFeed=true;
 denHunters.forEach((p,i)=>{p.head.position.y=2.12+(correct===false?.12:0)+(i%2)*.03});
}

function addWardenStageEffects(){
 // Warden entrance cue uses original graphics: courtroom brass, gavel, and cell-door bars.
 const frame=new THREE.Group();frame.position.set(0,0,0);scene.add(frame);
 block(3.3,2.3,.12,0,3.3,-6.71,mMetal,frame);
 for(let n=-2;n<=2;n++)block(.12,2.06,.16,n*.55,3.32,-6.58,mGold,frame);
 block(3.4,.22,.16,0,4.5,-6.57,mGold,frame);
 const court=textSurface('THE WARDEN  •  CASE CLOSED',0,2.35,-6.43,7.4,.46,frame);
 wardenSign=frame;frame.visible=wardenMode;
 wardenLight=new THREE.PointLight(0xffa64d,20,12);
 wardenLight.position.set(0,4,-5.4);wardenLight.visible=wardenMode;scene.add(wardenLight);
}
function setWardenMode(enabled){
 wardenMode=Boolean(enabled);
 if(wardenSign)wardenSign.visible=wardenMode;
 if(wardenLight)wardenLight.visible=wardenMode;
}

const INTRO_HUNTERS={
 'The Professor':{name:'KARLI RAE',title:'THE PROFESSOR',hair:'#82482e',outfit:'#4e163c',accent:'#d4a54d',detail:'glasses',line:'CLASS IS IN SESSION'},
 'The Red Raider':{name:'SCARLETT RAINES',title:'THE RED RAIDER',hair:'#b73b2a',outfit:'#a52828',accent:'#ff3c26',detail:'guns',line:'WRECK EM'},
 'El Jefe':{name:'ERIC HERRERA',title:'EL JEFE',hair:'#24202a',outfit:'#262f43',accent:'#daa954',detail:'tie',line:'YOU ARE IN MY HOUSE'},
 'The Jet':{name:'JUSTIN SILVA',title:'THE JET',hair:'#332a28',outfit:'#25406e',accent:'#e1f4ff',detail:'maple',line:'TRY AND KEEP UP'},
 'The Warden':{name:'ABBY WARREN',title:'THE WARDEN',hair:'#795345',outfit:'#202833',accent:'#e9bb6f',detail:'gavel',line:'ALL RISE'},
 'The Girl Genius':{name:'JENNY KAY',title:'THE GIRL GENIUS',hair:'#f241ac',outfit:'#54337e',accent:'#f3c5e1',detail:'glasses-braces',line:'PLAYER TWO HAS ENTERED'},
 'The Raven':{name:'THE WOLFPACK LEADER',title:'THE RAVEN',hair:'#191b23',outfit:'#101522',accent:'#ff7900',detail:'raven',line:'WELCOME TO THE WOLFPACK'}
};
function makeIntroLed(){
 ledSurface=document.createElement('canvas');ledSurface.width=1024;ledSurface.height=480;
 ledCtx=ledSurface.getContext('2d');ledTexture=new THREE.CanvasTexture(ledSurface);
 ledTexture.colorSpace=THREE.SRGBColorSpace;
 // The silhouette and animated Hunter are displayed ON the physical playing
 // surface of the desk, exactly where the normal Chase-like track is shown.
 const compact=mode==='btw';
 const depth=compact?2.10:2.22,width=compact?3.42:3.58;
 const screen=new THREE.Mesh(
  new THREE.PlaneGeometry(width,depth),
  new THREE.MeshBasicMaterial({map:ledTexture,side:THREE.DoubleSide,depthWrite:false})
 );
 screen.rotation.x=-Math.PI/2;
 screen.position.set(0,1.468,compact?-.35:-.25);
 screen.renderOrder=4;
 scene.add(screen);ledPanel=screen;screen.visible=false;
}
function introCharacter(ctx,profile,shadow,t){
 ctx.save();ctx.translate(524+Math.sin(t*1.8)*5,270);
 const bob=shadow?0:Math.sin(t*2)*5;
 ctx.translate(0,bob);
 ctx.fillStyle=shadow?'#020509':profile.outfit;
 ctx.beginPath();ctx.moveTo(-120,140);ctx.lineTo(-100,-56);ctx.quadraticCurveTo(-76,-94,-48,-95);ctx.lineTo(56,-95);ctx.quadraticCurveTo(92,-82,104,-50);ctx.lineTo(126,140);ctx.closePath();ctx.fill();
 ctx.fillStyle=shadow?'#020509':'#d6a685';
 ctx.beginPath();ctx.ellipse(0,-122,65,81,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle=shadow?'#020509':profile.hair;
 ctx.beginPath();ctx.ellipse(0,-172,66,37,0,Math.PI,Math.PI*2);ctx.lineTo(66,-152);ctx.quadraticCurveTo(0,-192,-66,-151);ctx.closePath();ctx.fill();
 if(!shadow){
  ctx.fillStyle='#222';ctx.fillRect(-30,-113,16,5);ctx.fillRect(18,-113,16,5);
  if(profile.detail.includes('glasses')){ctx.strokeStyle='#242332';ctx.lineWidth=7;ctx.strokeRect(-54,-123,43,27);ctx.strokeRect(11,-123,43,27);ctx.beginPath();ctx.moveTo(-11,-111);ctx.lineTo(11,-111);ctx.stroke();}
  if(profile.detail==='glasses-braces'){ctx.fillStyle='#e8eef0';ctx.fillRect(-19,-74,38,7);ctx.fillStyle='#b8babc';for(let x=-15;x<18;x+=10)ctx.fillRect(x,-74,3,7);
    ctx.fillStyle='#f0ce8f';ctx.fillRect(-45,-184,12,34);ctx.fillRect(26,-186,12,35);}
  if(profile.detail==='gavel'){ctx.fillStyle='#e8b954';ctx.fillRect(92,-54,16,92);ctx.fillRect(75,-68,52,24);}
  if(profile.detail==='raven'){ctx.fillStyle='#fa791d';ctx.beginPath();ctx.moveTo(-78,29);ctx.lineTo(-28,72);ctx.lineTo(-60,75);ctx.closePath();ctx.fill();}
  if(profile.detail==='maple'){ctx.fillStyle='#ffffff';ctx.font='42px Arial';ctx.fillText('✦',-9,56);}
  if(profile.detail==='tie'){ctx.fillStyle=profile.accent;ctx.fillRect(-8,-79,16,70);}
  if(profile.detail==='guns'){ctx.fillStyle=profile.accent;ctx.font='36px Arial';ctx.fillText('★',-20,60);}
 }
 ctx.restore();
}
function paintIntro(name,elapsed){
 if(!ledCtx||!ledTexture)return;
 const ctx=ledCtx,p=INTRO_HUNTERS[name]||INTRO_HUNTERS['The Raven'];
 const shadow=elapsed<1.45,enter= Math.min(1,Math.max(0,(elapsed-1.45)/.55));
 ctx.fillStyle='#050b15';ctx.fillRect(0,0,1024,480);
 const glow=ctx.createLinearGradient(0,0,1024,0);glow.addColorStop(0,'#082a43');glow.addColorStop(.5,shadow?'#231610':p.accent);glow.addColorStop(1,'#06182d');
 ctx.globalAlpha=shadow?.36:.2+enter*.12;ctx.fillStyle=glow;ctx.fillRect(0,0,1024,480);ctx.globalAlpha=1;
 for(let y=0;y<480;y+=12){ctx.fillStyle='rgba(114,185,225,.07)';ctx.fillRect(0,y,1024,2);}
 ctx.strokeStyle=p.accent;ctx.lineWidth=12;ctx.strokeRect(7,7,1010,466);
 ctx.save();ctx.beginPath();ctx.rect(270,34,500,395);ctx.clip();introCharacter(ctx,p,shadow,elapsed);ctx.restore();
 ctx.fillStyle='#ffffff';ctx.textAlign='center';ctx.font='bold 48px Arial';ctx.fillText(shadow?'WHO IS THE HUNTER?':p.title,512,65,940);
 ctx.font='bold 35px Arial';ctx.fillStyle=shadow?'#ffb767':'#e9f4ff';ctx.fillText(shadow?'SHADOW REVEAL':p.name,512,431,940);
 if(!shadow){ctx.font='bold 20px Arial';ctx.fillStyle='#ffd99a';ctx.fillText(p.line,512,462,940);}
 ledTexture.needsUpdate=true;
}
function playIntroductions(names){
 const roster=(Array.isArray(names)?names:[names]).filter(n=>INTRO_HUNTERS[n]);
 if(!roster.length||!ledPanel)return;
 ledTimeline={names:roster,start:performance.now(),secondsPer:4.1};
 ledPanel.visible=true;
 if(!cameraBeforeIntro)cameraBeforeIntro=camera;
 if(introCam)camera=introCam;
}
function stopIntroductions(){ledTimeline=null;if(ledPanel)ledPanel.visible=false;if(cameraBeforeIntro){camera=cameraBeforeIntro;cameraBeforeIntro=null;}}
function updateIntroductions(now){
 if(!ledTimeline||!ledPanel)return;
 const elapsed=(now-ledTimeline.start)/1000;
 const idx=Math.floor(elapsed/ledTimeline.secondsPer);
 if(idx>=ledTimeline.names.length){stopIntroductions();return;}
 paintIntro(ledTimeline.names[idx],elapsed-idx*ledTimeline.secondsPer);
}

function render(modeValue='hunt',view='stage'){
 const el=document.getElementById('stage3d');
 if(!el){destroy();return}
 if(el===container && mode===modeValue){return;}
 destroy();container=el;mode=modeValue;
 try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});}catch(err){el.textContent='3D rendering unavailable on this computer: '+err.message;return}
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
 renderer.setSize(el.clientWidth||850,el.clientHeight||420);
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 el.appendChild(renderer.domElement);
 scene=new THREE.Scene();scene.background=new THREE.Color(0x070707);
 scene.add(new THREE.AmbientLight(0xffffff,1.8));
 const spot=new THREE.DirectionalLight(0xffffff,2);spot.position.set(3,9,8);scene.add(spot);
 if(mode==='btw')buildWolfpack();else buildHunt();
 addWardenStageEffects();
 makeIntroLed();
 const den=new THREE.Group();den.userData.isDen=true;den.position.x=30;scene.add(den);buildDen(den);
 const denLight=new THREE.PointLight(orange,85,25);denLight.position.set(30,4,2);scene.add(denLight);
 stageCam=new THREE.PerspectiveCamera(58,(el.clientWidth||850)/(el.clientHeight||420),.1,100);
 stageCam.position.set(0,5,12);stageCam.lookAt(0,1.5,-1.5);
 denCam=new THREE.PerspectiveCamera(65,stageCam.aspect,.1,100);
 denCam.position.set(30,3.5,9);denCam.lookAt(30,2,-1);
 closeCam=new THREE.PerspectiveCamera(55,stageCam.aspect,.1,100);closeCam.position.set(4,3.6,5);closeCam.lookAt(0,1.5,-2);
 entranceCam=new THREE.PerspectiveCamera(55,stageCam.aspect,.1,100);entranceCam.position.set(-6.8,2.3,4);entranceCam.lookAt(-7.2,2,-7);
 introCam=new THREE.PerspectiveCamera(47,stageCam.aspect,.1,100);introCam.position.set(0,5.9,5.8);introCam.lookAt(0,1.35,-.4);
 setView(view);
 const animate=()=>{if(!renderer||!scene)return;animation=requestAnimationFrame(animate);updateIntroductions(performance.now());renderer.render(scene,camera)};
 animate();
}
function setView(view){current=['den','close','entrance'].includes(view)?view:'stage';const selected=current==='den'?denCam:current==='close'?closeCam:current==='entrance'?entranceCam:stageCam;if(ledTimeline)cameraBeforeIntro=selected;else camera=selected;}
function destroy(){if(animation)cancelAnimationFrame(animation);animation=null;if(renderer){renderer.dispose();if(renderer.domElement?.parentNode)renderer.domElement.parentNode.removeChild(renderer.domElement);}renderer=null;container=null;scene=null;camera=null;wardenSign=null;wardenLight=null;ledPanel=null;ledTimeline=null;ledCtx=null;if(ledTexture)ledTexture.dispose();ledTexture=null;ledSurface=null;introCam=null;cameraBeforeIntro=null;}
window.wolfStage={render,setView,destroy,updateDen,setWardenMode,playIntroductions,stopIntroductions};
