'use strict';
const base=[
['Which planet is known as the Red Planet?','Mars',['Venus','Jupiter','Mercury']],['How many sides does a hexagon have?','6',['5','7','8']],['What is the capital of Canada?','Ottawa',['Toronto','Vancouver','Montreal']],['Which element has the symbol Au?','Gold',['Silver','Argon','Aluminum']],['What is 12 multiplied by 8?','96',['86','98','108']],['Which ocean is the largest?','Pacific',['Atlantic','Indian','Arctic']],['What is the square root of 144?','12',['10','11','14']],['Which artist painted the Mona Lisa?','Leonardo da Vinci',['Michelangelo','Raphael','Van Gogh']],['What is the largest mammal?','Blue whale',['Elephant','Giraffe','Hippopotamus']],['What year did humans first land on the Moon?','1969',['1959','1972','1981']],['Which country is home to the city of Kyoto?','Japan',['China','South Korea','Thailand']],['What is the chemical formula for water?','H2O',['CO2','NaCl','O2']],['How many players are on the court for one basketball team?','5',['4','6','7']],['Which instrument has black and white keys?','Piano',['Trumpet','Violin','Flute']],['What is the capital of Australia?','Canberra',['Sydney','Melbourne','Perth']],['What does CPU stand for?','Central Processing Unit',['Computer Power Utility','Central Program Upload','Core Processor User']],['Which gas do plants absorb for photosynthesis?','Carbon dioxide',['Oxygen','Nitrogen','Helium']],['How many degrees are in a right angle?','90',['45','180','360']],['Which sport uses a puck?','Ice hockey',['Basketball','Cricket','Tennis']],['Who wrote Romeo and Juliet?','William Shakespeare',['Charles Dickens','Jane Austen','Mark Twain']],['Which continent is Egypt in?','Africa',['Asia','Europe','South America']],['How many minutes are in three hours?','180',['120','150','240']],['Which number is prime?','13',['12','15','21']],['Which is the fastest land animal?','Cheetah',['Lion','Horse','Greyhound']],['What is the freezing point of water in Celsius?','0',['10','32','100']],['What is the largest planet in our solar system?','Jupiter',['Saturn','Earth','Neptune']],['How many strings does a standard guitar have?','6',['4','5','8']],['Which US state is nicknamed the Lone Star State?','Texas',['Arizona','Oklahoma','Nevada']],['What is 15 percent of 200?','30',['15','20','40']],['Which language is primarily spoken in Brazil?','Portuguese',['Spanish','French','Italian']]
].map(([q,a,w])=>({q,a,opts:[a,...w]}));
const app=document.getElementById('app');let screen='home',session=null,tick=null,questions=load('wolf_questions',base),friends=['The Professor','The Red Raider','El Jefe','The Jet'],unlocked=load('wolf_unlocked',false);let seed=0;const hunterProfiles=[
 {title:'The Professor',name:'Karli Rae',theme:'Texas Fight',show:'The Hunt',music:'Player import required'},
 {title:'The Red Raider',name:'Scarlett Raines',theme:'Fight Raiders Fight',show:'The Hunt',music:'Player import required'},
 {title:'El Jefe',name:'Eric',theme:'Original entrance theme',show:'Both shows',music:'Prototype theme'},
 {title:'The Jet',name:'Justin',theme:'Original entrance theme',show:'Both shows',music:'Prototype theme'},
 {title:'The Raven',name:'Wolfpack Leader',theme:'Wings of the Raven',show:'Both shows',music:'Original theme planned'}
];
const ariDefault={name:'Arianna Dawson',hair:'Copper Red',style:'Long Waves',glasses:'Black Frames',braces:'Visible Silver',outfit:'Black Blazer / Orange Shirt'};let host=load('wolf_host',ariDefault);
let contestants=load('wolf_contestants',Array.from({length:4},(_,i)=>({name:'Contestant '+(i+1),hair:'Brown',glasses:'None',outfit:'Black & Orange'})));
let contestantIndex=0,showConfig=load('wolf_showConfig',{hunterSelection:'different',builderSeconds:60});
let stats=load('wolf_stats',{shows:0,wins:0,earnings:0}),importedTracks={},musicPlaying=null;
function selectedHunter(round){return showConfig.hunterSelection==='same'?friends[0]:friends[round%4]}
function stopImportedMusic(){if(musicPlaying){musicPlaying.pause();musicPlaying.currentTime=0;musicPlaying=null}}
function playHunterTheme(){if(!session||session.mode==='btw')return;let name=session.phase==='final'?'The Raven':selectedHunter(session.round),a=importedTracks[name];if(a){stopImportedMusic();musicPlaying=a;a.currentTime=0;a.play().catch(()=>{})}}
function contestantEditor(){let p=contestants[contestantIndex];shell('<p class="eyebrow">Contestant Creator</p><h1>Create a Contestant</h1><div class="card"><h2>Contestant '+(contestantIndex+1)+' / 4</h2><label>Name<input id="con_name" maxlength="60" value="'+esc(p.name)+'"></label><label>Hair<input id="con_hair" value="'+esc(p.hair)+'"></label><label>Glasses<select id="con_glasses">'+['None','Black Frames','Orange Frames','Silver Frames'].map(v=>'<option '+(p.glasses===v?'selected':'')+'>'+v+'</option>').join('')+'</select></label><label>Outfit<input id="con_outfit" value="'+esc(p.outfit)+'"></label><div class="btnrow"><button id="previousContestant" '+(contestantIndex===0?'disabled':'')+'>Previous</button><button class="primary" id="nextContestant">'+(contestantIndex===3?'Save Contestants':'Next ▶')+'</button></div></div>')}
function saveContestant(){contestants[contestantIndex]={name:document.getElementById('con_name').value.trim()||'Contestant '+(contestantIndex+1),hair:document.getElementById('con_hair').value,glasses:document.getElementById('con_glasses').value,outfit:document.getElementById('con_outfit').value};save('wolf_contestants',contestants)}
function showEditor(){shell('<h1>Create a Show</h1><div class="card"><label>Hunter rotation<select id="showSelection"><option value="different" '+(showConfig.hunterSelection==='different'?'selected':'')+'>Different Hunter per contestant</option><option value="same" '+(showConfig.hunterSelection==='same'?'selected':'')+'>Same Hunter every round</option></select></label><label>Cash Builder timer<select id="builderSeconds">'+[60,90,120].map(v=>'<option value="'+v+'" '+(showConfig.builderSeconds===v?'selected':'')+'>'+v+' seconds</option>').join('')+'</select></label><button class="primary" id="saveShow">Save Show Setup</button></div>')}
function musicEditor(){shell('<h1>Music Importer</h1><p>Player-supplied MP3, WAV or OGG audio. Tracks remain local to this running session and are not included in the game.</p><div class="grid">'+hunterProfiles.map(p=>'<div class="card"><h2>'+esc(p.title)+'</h2><p>'+esc(p.theme)+'</p><input type="file" accept="audio/*,.mp3,.wav,.ogg" data-music="'+esc(p.title)+'"><p>'+(importedTracks[p.title]?'Imported':'No track imported')+'</p><button data-preview="'+esc(p.title)+'" '+(importedTracks[p.title]?'':'disabled')+'>Preview</button></div>').join('')+'</div>')}
function creditsScreen(){shell('<p class="eyebrow">Wolfpack Studios</p><h1>Credits</h1><div class="card"><h2>The Hunt & Beat the Wolfpack</h2><p>Hosted by '+esc(host.name)+'</p><p>Hunters: '+hunterProfiles.map(p=>esc(p.title)+' ('+esc(p.name)+')').join(' · ')+'</p><p>Original Wolfpack game-show project. Any imported music remains user-provided and is not distributed with the game.</p><button data-go="home">Back to Home</button></div>')}
function recordScreen(){shell('<h1>Career Records</h1><div class="grid"><div class="card"><h2>'+stats.shows+'</h2>Shows completed</div><div class="card"><h2>'+stats.wins+'</h2>Victories</div><div class="card"><h2>$'+stats.earnings.toLocaleString()+'</h2>Prize money</div></div>')}

function load(k,fallback){try{const v=JSON.parse(localStorage.getItem(k));return v??fallback}catch{return fallback}}
function save(k,v){localStorage.setItem(k,JSON.stringify(v))}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
function nextQ(){if(!session) return null;let pool=questions.length?questions:base;let q=pool[session.qi++%pool.length];return {...q,opts:shuffle(q.opts)}}
function stop(){if(tick)clearInterval(tick);tick=null}
function shell(html){app.innerHTML=`<header><b>🐺 <span class="logo">WOLFPACK</span> QUIZ GAMES</b><nav class="topnav"><button data-go="home">Home</button><button data-go="create">Create Studio</button><button data-go="host">Create a Host</button><button data-go="contestants">Contestants</button><button data-go="music">Music</button><button data-go="records">Records</button><button data-go="credits">Credits</button><button id="toggleAudio">🔊 Music / SFX</button><button data-go="about">About</button></nav></header><main>${html}</main>`}
function go(s){stop();stopImportedMusic();if(window.wolfStage)window.wolfStage.destroy();if(window.wolfAudio)window.wolfAudio.stop();screen=s;session=null;render()}
function render(){if(screen==='host')return hostEditor();if(screen==='contestants')return contestantEditor();if(screen==='show')return showEditor();if(screen==='music')return musicEditor();if(screen==='records')return recordScreen();if(screen==='credits')return creditsScreen();if(screen==='home')return home();if(screen==='create')return create();if(screen==='about')return shell('<p class="eyebrow">Wolfpack Studios · Alpha 0.1</p><h1>About this prototype</h1><div class="card">Original game-show test mechanics, placeholder Hunter names, and a local question editor. The Raven is the exclusive Face the Raven finale opponent in The Hunt and one of six Hunters in Beat the Wolfpack. All progress is saved locally on this computer. This build has original synthesized sound cues and prototype music, but no recorded soundtrack, character models, voice acting, cinematic entrances, or finished 3D sets yet.</div>');if(screen==='play')return draw()}
function home(){shell(`<p class="eyebrow">Wolfpack Studios · First playable prototype</p><h1>Choose your show.</h1><p class="sub">Hosted by ${esc(host.name)}. Two original trivia competitions and five Wolfpack Hunters.</p><div class="grid"><section class="card gold"><span class="pill">TEAM COMPETITION</span><h2>THE HUNT</h2><p>Four contestants build their prize fund and face individual Hunters. Survivors advance to <b>Face the Raven</b>.</p><button class="primary" data-start="hunt">Play The Hunt</button></section><section class="card red"><span class="pill">SOLO COMPETITION</span><h2>BEAT THE WOLFPACK</h2><p>Build a prize, select your opposition, and outlast the Hunters in a timed quiz battle.</p><button class="primary" data-start="btw">Play Beat the Wolfpack</button></section><section class="card"><span class="pill">CAREER CHALLENGE</span><h2>WOLFPACK TRIALS</h2><p>Four contestants face four separate Hunters. The survivors must defeat The Raven to unlock Become a Hunter.</p><button data-start="trials">Begin Trials</button></section><section class="card ${unlocked?'gold':'lock'}"><span class="pill">${unlocked?'UNLOCKED':'LOCKED'}</span><h2>BECOME A HUNTER</h2><p>${unlocked?'Play from the Hunter side and stop the contestants.':'Defeat The Raven in the Wolfpack Trials to unlock.'}</p><button data-start="hunter" ${unlocked?'':'disabled'}>${unlocked?'Play as a Hunter':'🔒 Locked'}</button></section></div>`)}

function start(mode){
 stop();stopImportedMusic();
 session={mode,phase:mode==='hunter'?'hunter':'builderIntro',round:0,qi:Math.floor(Math.random()*questions.length),
 money:0,roundMoney:0,builderCount:0,survivors:0,score:0,opp:0,clock:60,oppclock:60,
 turn:'player',opponents:2,selectedHunters:[],offer:0,playerStep:0,hunterStep:0,
 finalStage:'team',pushbacks:0,headStart:0,allCaught:false,log:'',q:null,answered:false,
 lastCorrect:null,roundResults:[],finalTeamSet:[],finalHunterSet:[]};
 screen='play';if(window.wolfAudio)window.wolfAudio.start(mode);advance();
}
function advance(){
 stop();const s=session;if(!s)return;s.answered=false;s.lastCorrect=null;s.q=nextQ();
 if(s.phase==='builderIntro'){
  s.builderCount=0;s.roundMoney=0;s.score=0;s.clock=showConfig.builderSeconds;
  s.log=s.mode==='btw'?'One contestant. Your first wrong answer ends the episode; later misses end the Cash Builder.':'Contestant '+(s.round+1)+' — earn money in the Cash Builder before meeting a Hunter.';
 }else if(s.phase==='builder'){
  s.clock=showConfig.builderSeconds;s.builderCount=0;s.roundMoney=0;s.score=0;s.log='Cash Builder: $1,000 for every correct answer.';
 }else if(s.phase==='qualIntro'){
  s.log='Cash Builder complete: $'+s.roundMoney.toLocaleString()+'. '+selectedHunter(s.round)+' approaches the table.';
  playHunterTheme();
 }else if(s.phase==='offers'){
  let base=Math.max(1000,s.roundMoney);
  s.offers=[{label:'LOW OFFER',money:Math.max(1000,Math.round(base*.4/1000)*1000),step:1},
   {label:'MIDDLE OFFER',money:s.roundMoney,step:2},
   {label:'HIGH OFFER',money:Math.max(5000,Math.round(base*3/1000)*1000),step:3}];
  s.log=selectedHunter(s.round)+' offers three positions on the board. High offer: more money, one fewer step from being caught.';
 }else if(s.phase==='qual'){
  s.clock=0;s.score=0;s.opp=0;s.playerStep=s.offerStep||2;s.hunterStep=0;
  s.log=selectedHunter(s.round)+' vs '+contestants[s.round].name+'. Answer correctly to move your money down the board. The Hunter advances on correct answers.';
 }else if(s.phase==='final'){
  s.finalStage='team';s.clock=120;s.oppclock=120;s.score=s.survivors;s.headStart=s.survivors;s.opp=0;s.pushbacks=0;s.turn='player';
  s.log='FACE THE RAVEN — '+s.survivors+' survivor(s), '+s.headStart+' point head start. Team plays first for 120 seconds.';
 }else if(s.phase==='finalHunter'){
  s.finalStage='hunter';s.turn='hunter';s.oppclock=120;
  s.log='THE RAVEN CHASES — Target '+s.score+'. Each wrong answer gives the team a pushback opportunity.';
 }else if(s.phase==='pushback'){
  s.turn='player';s.log='PUSHBACK CHANCE! Answer correctly to push The Raven back one step.';
 }else if(s.phase==='choice'){
  s.money=s.roundMoney;s.log='Choose how many Hunters to face. More Hunters offer more money and a tougher clock.';
 }else if(s.phase==='duel'){
  s.clock=60;s.oppclock=45+Math.max(0,5-s.opponents)*10;s.turn='player';s.score=0;s.opp=0;
  s.selectedHunters=selectWolfpackHunters(s.opponents);
  s.log='Beat '+s.opponents+' Hunters: '+s.selectedHunters.join(', ')+'. Clocks alternate after each answer. First clock to zero loses.';
 }else if(s.phase==='hunter'){
  s.clock=60;s.oppclock=60;s.turn='player';s.score=0;s.opp=0;s.log='Become a Hunter — answer questions before the opposing contestant.';
 }
 draw();if(['builder','final','finalHunter','duel','hunter'].includes(s.phase))startTimer();
}
function selectWolfpackHunters(n){
 const lineup=[...friends,'The Raven'];
 return lineup.slice(0,Math.max(1,Math.min(5,n)));
}
function startTimer(){
 stop();
 tick=setInterval(()=>{
  const s=session;if(!s)return;
  if(s.phase==='builder')s.clock--;
  else if(s.phase==='duel'){if(s.turn==='player')s.clock--;else s.oppclock--;}
  else if(s.phase==='final')s.clock--;
  else if(s.phase==='finalHunter')s.oppclock--;
  else if(s.phase==='hunter'){if(s.turn==='player')s.clock--;else s.oppclock--;}
  else return;
  const el=document.getElementById('timer');
  if(el)el.textContent=s.phase==='builder'?'Cash Builder: '+s.clock+'s':'Contestant: '+s.clock+'s · Hunters: '+s.oppclock+'s';
  if(s.phase==='builder'&&s.clock<=0){finishBuilder();return}
  if(s.phase==='final'&&s.clock<=0){s.phase='finalHunter';advance();return}
  if(s.phase==='finalHunter'&&s.oppclock<=0){finish(true);return}
  if(s.phase==='duel'&&(s.clock<=0||s.oppclock<=0)){finish(s.oppclock<=0);return}
  if(s.phase==='hunter'&&(s.clock<=0||s.oppclock<=0)){finish(s.oppclock<=0);return}
 },1000);
}
function finishBuilder(){
 const s=session;if(!s)return;stop();
 if(s.mode==='btw'){
  if(s.builderCount===0){end('Cash Builder expired without an answer. Episode over.');return}
  s.money=s.roundMoney;s.phase='choice';advance();
 }else{s.phase='qualIntro';advance()}
}
function gamePanel(s){
 if(s.phase==='offers'){
  return '<h2>Hunter Offers</h2><div class="offer-grid">'+s.offers.map((o,i)=>'<div class="card"><h3>'+o.label+'</h3><strong>$'+o.money.toLocaleString()+'</strong><p>Starting position: '+o.step+' steps from home</p><button data-offer="'+i+'">Accept Offer</button></div>').join('')+'</div>';
 }
 if(s.phase==='qual')return '<div class="card"><h2>Head-to-Head Board</h2><div class="chase-track">'+Array.from({length:7},(_,i)=>'<div class="track-cell '+(s.playerStep===i?'player-cell ':'')+(s.hunterStep===i?'hunter-cell':'')+'">'+(s.playerStep===i?'$'+s.offer.toLocaleString():'')+(s.hunterStep===i?' ◆':'')+'</div>').join('')+'</div><p>Money moves toward HOME. Red Hunter marker follows when the Hunter answers correctly.</p></div>';
 if(['final','finalHunter','pushback'].includes(s.phase))return '<div class="card"><h2>'+ (s.phase==='final'?'TEAM FINAL CHASE':s.phase==='pushback'?'PUSHBACK':'THE RAVEN IS CHASING')+'</h2><p>Team score: '+s.score+' · Raven score: '+s.opp+' · Pushbacks: '+s.pushbacks+'</p><p>Head start: '+s.headStart+'</p></div>';
 if(s.phase==='duel')return '<div class="card"><h2>Wolfpack Clock Battle</h2><p>'+s.selectedHunters.map(esc).join(' · ')+'</p><p>Contestant: '+s.clock+' seconds · Hunters: '+s.oppclock+' seconds · Turn: '+s.turn+'</p></div>';
 return '';
}
function draw(){
 const s=session;if(!s)return home();
 const heading=s.mode==='hunt'?'THE HUNT':s.mode==='btw'?'BEAT THE WOLFPACK':s.mode==='trials'?'WOLFPACK TRIALS':'BECOME A HUNTER';
 const phase=({builderIntro:'Cash Builder',builder:'Cash Builder',qualIntro:'Hunter Entrance',offers:'Hunter Offers',qual:'Head-to-Head',final:'FACE THE RAVEN',finalHunter:'FACE THE RAVEN',pushback:'Pushback',choice:'Choose Hunters',duel:'Wolfpack Showdown',hunter:'Hunter Challenge'})[s.phase]||s.phase;
 const isIntro=['builderIntro','qualIntro'].includes(s.phase);
 const choice=['choice','offers'].includes(s.phase);
 const timerText=s.phase==='builder'?'Cash Builder: '+s.clock+'s':'Contestant: '+s.clock+'s · Hunters: '+s.oppclock+'s';
 shell('<p class="eyebrow">'+heading+' · '+phase+'</p><h1>'+phase+'</h1><div class="status"><span>Team prize: $'+s.money.toLocaleString()+'</span><span>Round money: $'+s.roundMoney.toLocaleString()+'</span><span>Correct: '+s.score+'</span><span>Hunter: '+s.opp+'</span><span>Qualified: '+s.survivors+'</span><span id="timer">'+timerText+'</span></div><div class="message">'+esc(s.log)+'</div>'+setHtml(s)+gamePanel(s)+(isIntro?introHtml(s):s.phase==='choice'?choiceHtml(s):s.phase==='offers'?'':'<div class="question">'+esc(s.q.q)+'</div><div class="answers">'+s.q.opts.map((a,i)=>'<button data-answer="'+i+'">'+esc(a)+'</button>').join('')+'</div>'));
 if(window.wolfStage){window.wolfStage.render(s.mode==='btw'?'btw':'hunt');window.wolfStage.updateDen(s.q?.q,s.lastCorrect)}
}

function setHtml(s){return '<section class="three-scene"><div class="three-controls"><strong>FULL 3D STUDIO</strong><div><button data-camera="stage">Wide Stage</button><button data-camera="close">Podium Camera</button><button data-camera="entrance">Entrance Tunnel</button><button data-camera="den">Hunter\'s Den</button></div></div><div id="stage3d" class="stage3d" aria-label="Interactive 3D game show stage"></div><p class="muted">3D prototype: modeled stage, podiums, studio lighting, tunnel entrance and Hunter\'s Den. Characters and animation are still in development.</p></section>'}

function introHtml(s){
 const first=s.phase==='builderIntro';
 return '<div class="card round-intro"><h2>'+(first?'CASH BUILDER':'HEAD-TO-HEAD')+'</h2><p>'+(first?'Answer as many questions as possible in '+showConfig.builderSeconds+' seconds. Every correct answer is worth $1,000.':'You earned $'+s.roundMoney.toLocaleString()+'. '+esc(selectedHunter(s.round))+' is ready with three offers.')+'</p><button class="primary" data-round-next="'+(first?'builder':'offers')+'">'+(first?'Start Cash Builder':'Meet the Hunter')+'</button></div>';
}
function choiceHtml(s){
 return '<h2>Choose your challenge</h2><p>Face between one and five Wolfpack Hunters. Your Cash Builder stake is $'+s.money.toLocaleString()+'.</p><div class="offer-grid">'+[1,2,3,4,5].map(n=>'<div class="card"><h2>'+n+' Hunter'+(n===1?'':'s')+'</h2><p>Potential prize: $'+(Math.max(1000,s.money)*n).toLocaleString()+'</p><p>Hunter clock: '+(45+Math.max(0,5-n)*10)+' seconds</p><button data-choose="'+n+'">Face '+n+' Hunter'+(n===1?'':'s')+'</button></div>').join('')+'</div>';
}
function endQualifier(won){
 const s=session;if(won){s.survivors++;s.money+=s.offer;}
 s.roundResults.push({name:contestants[s.round]?.name||'Contestant',won,offer:s.offer});
 s.round++;s.roundMoney=0;
 if(s.round>=4){
  if(s.survivors===0){s.allCaught=true;s.money=4000}
  s.phase='final';advance();return;
 }
 s.phase='builderIntro';advance();
}
function answer(index){
 const s=session;if(!s||s.answered||['choice','offers','builderIntro','qualIntro'].includes(s.phase))return;
 const good=s.q.opts[+index]===s.q.a;
 s.answered=true;s.lastCorrect=good;
 if(window.wolfAudio)window.wolfAudio.answer(good);
 if(document.querySelectorAll)document.querySelectorAll('[data-answer]').forEach(btn=>{const correct=s.q.opts[Number(btn.dataset.answer)]===s.q.a;btn.classList.add(correct?'answer-correct':'answer-wrong');btn.disabled=true});
 if(s.phase==='builder'){
  s.builderCount++;
  if(good){s.roundMoney+=1000;s.score++;}else s.miss++;
  s.log=good?'Correct! +$1,000':'Wrong: '+s.q.a;
  if(s.mode==='btw'&&!good){
   if(s.builderCount===1){end('First Cash Builder answer missed — Beat the Wolfpack episode over.');return}
   s.phase='choice';s.money=s.roundMoney;advance();return;
  }
  if(s.mode==='btw'&&s.builderCount>=5){s.money=s.roundMoney;s.phase='choice';advance();return}
  nextTurn();return;
 }
 if(s.phase==='qual'){
  if(good)s.playerStep=Math.min(6,s.playerStep+1);
  else if(Math.random()<.75)s.hunterStep=Math.min(6,s.hunterStep+1);
  s.log=good?'Contestant advances toward home!':selectedHunter(s.round)+' takes a step closer.';
  if(s.playerStep>=6){endQualifier(true);return}
  if(s.hunterStep>=s.playerStep){endQualifier(false);return}
  nextTurn();return;
 }
 if(s.phase==='final'){
  if(good)s.score++;
  s.log=good?'Team scores!':'Incorrect — '+s.q.a;
  nextTurn();return;
 }
 if(s.phase==='pushback'){
  if(good){s.opp=Math.max(0,s.opp-1);s.pushbacks++;s.log='Successful pushback! The Raven moves back one step.';}
  else s.log='Pushback missed. The Raven remains on '+s.opp+'.';
  s.phase='finalHunter';s.turn='hunter';s.answered=false;s.q=nextQ();draw();startTimer();return;
 }
 if(s.phase==='duel'){
  if(s.turn!=='player')return;
  if(good)s.score++;
  s.log=good?'Correct! Your clock stops. The Hunters now answer.':'Incorrect. Your clock continues until you answer correctly.';
  if(good){s.turn='hunter';s.aiDelay=0;}
  nextTurn();return;
 }
 if(s.phase==='hunter'){
  if(good)s.score++;else s.opp++;
  s.log=good?'Hunter correct!':'Opponent makes progress.';
  nextTurn();return;
 }
}
function nextTurn(){const s=session;if(!s)return;s.answered=false;s.q=nextQ();draw()}
function finish(win){
 stop();const s=session;if(!s)return;
 if(window.wolfAudio)window.wolfAudio.result(win);
 if(win&&s.mode==='trials'&&['final','finalHunter'].includes(s.phase)){unlocked=true;save('wolf_unlocked',true)}
 if(win&&s.phase==='duel')s.money=Math.max(1000,s.money)*s.opponents;
 stats.shows++;if(win){stats.wins++;stats.earnings+=s.money}save('wolf_stats',stats);
 const amount=win?'$'+s.money.toLocaleString():'$0';
 const split=win&&(s.phase==='final'||s.phase==='finalHunter')?(s.allCaught?' · $1,000 for each of the four original contestants':' · $'+Math.floor(s.money/s.survivors).toLocaleString()+' per surviving contestant'):'';
 end((win?'VICTORY — ':'DEFEAT — ')+(win?(s.mode==='trials'?'The Raven defeated! Become a Hunter unlocked. ':'Prize won: '+amount+split):'The Wolfpack wins.'));
}
function end(msg){
 stop();stopImportedMusic();if(window.wolfAudio)window.wolfAudio.stop();
 session=null;screen='result';
 shell('<p class="eyebrow">Round complete</p><h1>'+esc(msg)+'</h1><div class="card"><p>Play another show, edit your contestants, or review the rules.</p><div class="btnrow"><button class="primary" data-go="home">Main Menu</button><button data-go="create">Create Studio</button></div></div>');
}

function hostEditor(){const options=(id,values,selected)=>`<select id="host_${id}">${values.map(v=>`<option value="${esc(v)}" ${v===selected?'selected':''}>${esc(v)}</option>`).join('')}</select>`;shell(`<p class="eyebrow">Available from the start · Host Studio</p><h1>Create a Host</h1><p class="sub">Keep Arianna Dawson and customize her look, or give your host a new identity. Appearance settings are saved locally.</p><div class="grid"><section class="card"><span class="pill">ACTIVE HOST</span><h2>${esc(host.name)}</h2><div class="host-avatar"><div class="host-hair">${host.hair.includes('Red')?'🦰':'👩'}</div><strong>${esc(host.name)}</strong><span>${esc(host.glasses)} · ${esc(host.braces)}</span><small>Placeholder portrait · no 3D model in this alpha</small></div></section><section class="card"><h2>Edit Host</h2><label>Host Name<input id="host_name" maxlength="60" value="${esc(host.name)}"></label><label>Hair Color${options('hair',['Copper Red','Bright Red','Auburn','Dark Brown','Blonde','Black'],host.hair)}</label><label>Hair Style${options('style',['Long Waves','Straight','Ponytail','Bob','Curly'],host.style)}</label><label>Glasses${options('glasses',['Black Frames','Orange Frames','Silver Frames','No Glasses'],host.glasses)}</label><label>Braces${options('braces',['Visible Silver','Orange Bands','Clear Brackets','No Braces'],host.braces)}</label><label>Outfit${options('outfit',['Black Blazer / Orange Shirt','Orange Jacket / Black Shirt','White Blazer / Black Shirt','Black Evening Dress','Orange Evening Dress'],host.outfit)}</label><div class="btnrow"><button class="primary" id="saveHost">Save Host</button><button id="resetHost">Restore Original Arianna</button></div></section></div>`)}
function create(){
 const cards=hunterProfiles.map((p,i)=>'<div class="hunter-profile '+(i===4?'leader-profile':'')+'"><div class="hunter-title">'+esc(p.title)+'</div><strong>'+esc(p.name)+'</strong><small>'+esc(p.theme)+' · '+esc(p.show)+'</small><span class="muted">'+esc(p.music)+'</span></div>').join('');
 shell('<p class="eyebrow">Creation tools · Alpha</p><h1>Create Studio</h1><h2>Official Hunters</h2><p class="sub">Five confirmed Hunters. Eric is credited by first name only. The Raven is the Wolfpack leader.</p><div class="hunter-roster">'+cards+'</div><div class="grid"><div class="card"><h2>Hunter Entrance Music</h2><p>Scarlett\'s Fight Raiders Fight and Karli\'s Texas Fight are assigned to The Hunt only. No fight-song recordings are bundled. Use Music Importer to load tracks for this session. The Hunt plays imported Hunter themes at the Head-to-Head introduction.</p><p>El Jefe (Eric), The Jet (Justin), and The Raven use original planned themes.</p></div><div class="card"><h2>Question Creator</h2><p>Current questions: <b>'+questions.length+'</b></p><label>Question<input id="qtext" placeholder="Your trivia question"></label><label>Correct answer<input id="qanswer" placeholder="Correct answer"></label><label>Wrong answer 1<input id="wrong1"></label><label>Wrong answer 2<input id="wrong2"></label><label>Wrong answer 3<input id="wrong3"></label><button id="addQuestion">Add Question</button><div class="btnrow"><button id="exportQuestions">Export JSON</button><label class="pill">Import JSON<input type="file" id="importQuestions" accept="application/json,.json"></label></div><button id="resetQuestions">Reset Sample Questions</button></div></div><div class="card" style="margin-top:16px"><h2>Character & Show Studio</h2><div class="btnrow"><button data-go="host">Create a Host — Available</button><button data-go="contestants">Create a Contestant</button><button data-go="show">Create a Show</button><button data-go="music">Music Importer</button><button data-go="records">Records</button><button disabled>Create a Hunter Appearance — Coming Soon</button></div></div>');
}
function validQuestion(x){return x&&typeof x.q==='string'&&typeof x.a==='string'&&Array.isArray(x.opts)&&x.opts.length===4&&x.opts.every(y=>typeof y==='string')&&x.opts.includes(x.a)}
document.addEventListener('click',e=>{let b=e.target.closest('button');if(!b)return;if(b.dataset.go){go(b.dataset.go);return}if(b.dataset.start){start(b.dataset.start);return}if(b.dataset.roundNext){session.phase=b.dataset.roundNext;advance();return}if(b.dataset.offer!==undefined){const offer=session.offers[Number(b.dataset.offer)];if(!offer)return;session.offer=offer.money;session.offerStep=offer.step;session.phase='qual';advance();return}if(b.dataset.camera){if(window.wolfStage)window.wolfStage.setView(b.dataset.camera);return}if(b.dataset.answer!==undefined){answer(b.dataset.answer);return}if(b.dataset.choose){session.opponents=+b.dataset.choose;session.phase='duel';advance();return}if(b.id==='nextContestant'){saveContestant();if(contestantIndex<3){contestantIndex++;contestantEditor()}else go('create');return}if(b.id==='previousContestant'){saveContestant();contestantIndex=Math.max(0,contestantIndex-1);contestantEditor();return}if(b.id==='saveShow'){showConfig={hunterSelection:document.getElementById('showSelection').value,builderSeconds:+document.getElementById('builderSeconds').value};save('wolf_showConfig',showConfig);go('create');return}if(b.dataset.preview){stopImportedMusic();const a=importedTracks[b.dataset.preview];if(a){musicPlaying=a;a.currentTime=0;a.play().catch(()=>{})}return}if(b.id==='toggleAudio'){if(window.wolfAudio)window.wolfAudio.toggle();return}if(b.id==='saveHost'){host={name:document.getElementById('host_name').value.trim()||'Arianna Dawson',hair:document.getElementById('host_hair').value,style:document.getElementById('host_style').value,glasses:document.getElementById('host_glasses').value,braces:document.getElementById('host_braces').value,outfit:document.getElementById('host_outfit').value};save('wolf_host',host);hostEditor();return}if(b.id==='resetHost'){if(confirm('Restore Arianna Dawson to her original appearance?')){host={...ariDefault};save('wolf_host',host);hostEditor()}return}if(b.id==='addQuestion'){let ids=['qtext','qanswer','wrong1','wrong2','wrong3'];let vals=ids.map(x=>document.getElementById(x).value.trim());if(vals.some(x=>!x)||new Set(vals.slice(1).map(x=>x.toLowerCase())).size!==4){alert('Enter a question and four different answers.');return}questions.push({q:vals[0],a:vals[1],opts:vals.slice(1)});save('wolf_questions',questions);create();return}if(b.id==='resetQuestions'){if(confirm('Replace all questions with the sample bank?')){questions=base;save('wolf_questions',questions);create()}return}if(b.id==='exportQuestions'){let blob=new Blob([JSON.stringify(questions,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='wolfpack-questions.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)}});
document.addEventListener('change',async e=>{if(e.target.dataset.music){const file=e.target.files?.[0];if(!file)return;if(file.size>30000000){alert('30 MB maximum');return}const key=e.target.dataset.music,old=importedTracks[key];if(old){old.pause();URL.revokeObjectURL(old.src)}importedTracks[key]=new Audio(URL.createObjectURL(file));musicEditor();return}if(e.target.id!=='importQuestions')return;try{let arr=JSON.parse(await e.target.files[0].text());if(!Array.isArray(arr)||!arr.length||!arr.every(validQuestion))throw Error('Invalid question format');questions=arr;save('wolf_questions',questions);create();alert(`Imported ${questions.length} questions.`)}catch(err){alert('Import failed: '+err.message)}});
render();