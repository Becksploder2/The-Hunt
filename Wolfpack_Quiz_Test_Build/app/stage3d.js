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
function buildHunt(){
 panelWall();block(17,.1,1,0,.06,1.4,mOrange);
 block(9,.75,2.2,0,1.1,-1.5,mMetal);block(9,.12,2.3,0,1.55,-1.5,mOrange);
 for(let x of [-3.2,-1.5,0,1.5,3.2])textSurface('◆',x,1.69,-.72,.8,.27);
 post(-6,2.1);post(6,2.1);mannequin(-6,1.1);mannequin(6,1.1);block(12,.12,1,0,.1,4.2,mOrange);textSurface('THE HUNT',0,4.4,-7.7,8,1.25);
 textSurface('CONTESTANT',-6,1.95,2.51,2,.4);textSurface('HUNTER',6,1.95,2.51,2,.4);
 for(let x of [-7,0,7])light(x,5,-1);
}
function buildWolfpack(){
 panelWall();
 for(let i=0;i<5;i++){
  let x=(i-2)*3.2,z=-4+Math.abs(i-2)*.36;
  block(2.45,2.35,1.2,x,1.17,z,mMetal);block(2.5,.17,1.24,x,2.38,z,mOrange);
  const label=['PROFESSOR','RED RAIDER','EL JEFE','THE JET','THE RAVEN'][i];mannequin(x,z+.2,scene,i===4?mWhite:mDark);
  textSurface(label,x,1.42,z+.63,2.25,.47);
  if(i===4){block(2.65,.12,1.4,x,2.53,z,mWhite);light(x,4,z,14)}
 }
 post(0,3.8,1.6);mannequin(0,3.2);block(15,.13,.8,0,.1,4.6,mOrange);textSurface('CONTESTANT',0,2.07,4.23,2.3,.44);
 textSurface('BEAT THE WOLFPACK',0,4.5,-7.7,10,1.22);
 for(let x of [-6,0,6])light(x,5,-1);
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
 for(let i=0;i<5;i++){
   const x=(i-2)*2.85;
   block(1.9,.5,1.3,x,.5,1.2,mOrange,group);
   block(1.9,1.2,.33,x,1.12,.57,mMetal,group);
   block(.23,.6,1.3,x-.95,.75,1.2,mMetal,group);
   block(.23,.6,1.3,x+.95,.75,1.2,mMetal,group);
   const person=mannequin(x,1.12,group,i===4?mWhite:mDark);
   denHunters.push(person);
   textSurface(['PROFESSOR','RED RAIDER','EL JEFE','THE JET','THE RAVEN'][i],x,.23,2.04,2.45,.3,group);
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
 if(el===container && mode===modeValue){setView(view);return;}
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
