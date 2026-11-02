import * as THREE from 'three';
const orange=0xff7900, black=0x090909;
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
function buildHunt(){
 panelWall();mainFloor();truss();studioLights();stageArch();verticalWallFrames();doorway(-7.0,-7.28,'HUNTER TUNNEL');
 for(let k=0;k<4;k++)floorChevron(-5.5+k*3.6,3.65,-1);
 for(let x of [-7.15,7.15]){ringPlatform(x,.35,1.5,1.55,1.35);seatDetail(x,.4,2.9)}
 beamFace(0,2.85,-7.01,12,.27,mDark);
 // Wide television set: raised long transparent chase table with stepped plinths.
 for(let i=0;i<3;i++){block(14-i*.8,.2,4.6-i*.52,0,.24+i*.23,-2.05,mDark);block(14-i*.8,.045,4.6-i*.52,0,.35+i*.23,-.05-i*.26,mIce)}
 block(10.8,.48,2.2,0,1.25,-1.9,mBlue);
 block(10.9,.11,2.3,0,1.56,-1.9,mGlass);
 block(10.8,.11,.17,0,1.66,-.69,mOrange);
 for(let x=-4.6;x<=4.6;x+=1.15){block(.12,.065,1.6,x,1.68,-1.9,mIce)}
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
 for(let k=0;k<6;k++){const x=(k-2.5)*2.75;floorChevron(x,1.72,1);}
 beamFace(0,2.85,-7.01,13.6,.28,mDark);
 textSurface('BEAT THE WOLFPACK',0,4.65,-7.03,11.4,1.05);
 // Six raised Hunter stations in a shallow arc, not a flat wall graphic.
 for(let i=0;i<6;i++){
  const x=(i-2.5)*2.75,z=-3.8+Math.abs(i-2.5)*.35;
  ringPlatform(x,.2,z,1.58,1.37,i===5?mWhite:mOrange);
  cylinder(1.28,1.5,.4,x,.34,z,mMetal);
  cylinder(1.18,1.33,.14,x,.59,z,mOrange);
  block(2.48,1.5,1.18,x,1.42,z,mBlue);
  block(2.65,.17,1.43,x,2.29,z,mGlass);
  block(2.42,.15,.2,x,1.52,z+.66,mIce);
  mannequin(x,z+.13,scene,i===5?mWhite:mDark);
  const name=['THE PROFESSOR','THE RED RAIDER','EL JEFE','THE JET','THE WARDEN','THE RAVEN'][i];
  textSurface(name,x,1.17,z+.68,2.38,.42);
  for(let j=0;j<3;j++)block(2.6,.045,.1,x,.83+j*.23,z+.69,mGold);
  if(i===5){block(2.8,.14,1.48,x,2.47,z,mWhite);light(x,4.7,z,17)}
 }
 cylinder(1.65,1.8,.35,0,.24,4,mMetal);
 cylinder(1.49,1.61,.14,0,.5,4,mOrange);
 curvedDesk(0,1.8,4,2.8,'CONTESTANT');
 mannequin(0,3.15);
 textSurface('ONE CONTESTANT  ·  SIX HUNTERS',0,3.45,-7.02,8.4,.43);
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
 for(let i=0;i<6;i++){
   const x=(i-2.5)*2.55;
   block(1.9,.5,1.3,x,.5,1.2,mOrange,group);
   block(1.9,1.2,.33,x,1.12,.57,mMetal,group);
   block(.23,.6,1.3,x-.95,.75,1.2,mMetal,group);
   block(.23,.6,1.3,x+.95,.75,1.2,mMetal,group);
   const person=mannequin(x,1.12,group,i===5?mWhite:mDark);
   denHunters.push(person);
   textSurface(['PROFESSOR','RED RAIDER','EL JEFE','THE JET','THE WARDEN','THE RAVEN'][i],x,.23,2.04,2.45,.3,group);
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
 const den=new THREE.Group();den.userData.isDen=true;den.position.x=30;scene.add(den);buildDen(den);
 const denLight=new THREE.PointLight(orange,85,25);denLight.position.set(30,4,2);scene.add(denLight);
 stageCam=new THREE.PerspectiveCamera(58,(el.clientWidth||850)/(el.clientHeight||420),.1,100);
 stageCam.position.set(0,5,12);stageCam.lookAt(0,1.5,-1.5);
 denCam=new THREE.PerspectiveCamera(65,stageCam.aspect,.1,100);
 denCam.position.set(30,3.5,9);denCam.lookAt(30,2,-1);
 closeCam=new THREE.PerspectiveCamera(55,stageCam.aspect,.1,100);closeCam.position.set(4,3.6,5);closeCam.lookAt(0,1.5,-2);
 entranceCam=new THREE.PerspectiveCamera(55,stageCam.aspect,.1,100);entranceCam.position.set(-6.8,2.3,4);entranceCam.lookAt(-7.2,2,-7);
 setView(view);
 const animate=()=>{if(!renderer||!scene)return;animation=requestAnimationFrame(animate);renderer.render(scene,camera)};
 animate();
}
function setView(view){current=['den','close','entrance'].includes(view)?view:'stage';camera=current==='den'?denCam:current==='close'?closeCam:current==='entrance'?entranceCam:stageCam;}
function destroy(){if(animation)cancelAnimationFrame(animation);animation=null;if(renderer){renderer.dispose();if(renderer.domElement?.parentNode)renderer.domElement.parentNode.removeChild(renderer.domElement);}renderer=null;container=null;scene=null;camera=null;}
window.wolfStage={render,setView,destroy,updateDen};
