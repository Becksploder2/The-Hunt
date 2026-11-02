'use strict';
const base=[
['Which planet is known as the Red Planet?','Mars',['Venus','Jupiter','Mercury']],['How many sides does a hexagon have?','6',['5','7','8']],['What is the capital of Canada?','Ottawa',['Toronto','Vancouver','Montreal']],['Which element has the symbol Au?','Gold',['Silver','Argon','Aluminum']],['What is 12 multiplied by 8?','96',['86','98','108']],['Which ocean is the largest?','Pacific',['Atlantic','Indian','Arctic']],['What is the square root of 144?','12',['10','11','14']],['Which artist painted the Mona Lisa?','Leonardo da Vinci',['Michelangelo','Raphael','Van Gogh']],['What is the largest mammal?','Blue whale',['Elephant','Giraffe','Hippopotamus']],['What year did humans first land on the Moon?','1969',['1959','1972','1981']],['Which country is home to the city of Kyoto?','Japan',['China','South Korea','Thailand']],['What is the chemical formula for water?','H2O',['CO2','NaCl','O2']],['How many players are on the court for one basketball team?','5',['4','6','7']],['Which instrument has black and white keys?','Piano',['Trumpet','Violin','Flute']],['What is the capital of Australia?','Canberra',['Sydney','Melbourne','Perth']],['What does CPU stand for?','Central Processing Unit',['Computer Power Utility','Central Program Upload','Core Processor User']],['Which gas do plants absorb for photosynthesis?','Carbon dioxide',['Oxygen','Nitrogen','Helium']],['How many degrees are in a right angle?','90',['45','180','360']],['Which sport uses a puck?','Ice hockey',['Basketball','Cricket','Tennis']],['Who wrote Romeo and Juliet?','William Shakespeare',['Charles Dickens','Jane Austen','Mark Twain']],['Which continent is Egypt in?','Africa',['Asia','Europe','South America']],['How many minutes are in three hours?','180',['120','150','240']],['Which number is prime?','13',['12','15','21']],['Which is the fastest land animal?','Cheetah',['Lion','Horse','Greyhound']],['What is the freezing point of water in Celsius?','0',['10','32','100']],['What is the largest planet in our solar system?','Jupiter',['Saturn','Earth','Neptune']],['How many strings does a standard guitar have?','6',['4','5','8']],['Which US state is nicknamed the Lone Star State?','Texas',['Arizona','Oklahoma','Nevada']],['What is 15 percent of 200?','30',['15','20','40']],['Which language is primarily spoken in Brazil?','Portuguese',['Spanish','French','Italian']]
].map(([q,a,w])=>({q,a,opts:[a,...w]}));
const app=document.getElementById('app');let screen='home',session=null,tick=null,questions=load('wolf_questions',base),friends=['The Professor','The Red Raider','El Jefe','The Jet','The Warden','The Girl Genius'],unlocked=load('wolf_unlocked',false);let seed=0;const hunterProfiles=[
 {title:'The Professor',name:'Karli-Rae Gomez',theme:'Texas Fight',show:'The Hunt',music:'Player import required',personality:'The Professor: strict academic authority, theatrical wit and sharp banter; a blend of Anne Hegerty and Jenny Ryan.'},
 {title:'The Red Raider',name:'Scarlett Raines',theme:'Fight Raiders Fight',show:'The Hunt',music:'Player import required',personality:'The Red Raider: fiery, determined and proudly Texas Tech. Compares opponents to Texas Tech football rivals and conference opponents.'},
 {title:'El Jefe',name:'Eric Herrera',theme:'Original entrance theme',show:'Both shows',music:'Prototype theme',personality:'The smartass: sarcastic, quick comebacks, playful condescension'},
 {title:'The Jet',name:'Justin Silva',theme:'Original entrance theme',show:'Both shows',music:'Prototype theme',country:'Canada',personality:'First Canadian Hunter. The group troll: mischievous, teasing, playful trash talk'},
 {title:'The Warden',name:'Abby Warren',theme:'Lockdown (original theme cue)',show:'Both shows',music:'Original theme planned',speed:10,personality:'The Warden: friendly and composed off the clock; judge-and-warden verdicts, gavel imagery, and lightning-fast answers when in session. Her nickname honors her mother’s former job.'},
 {title:'The Girl Genius',name:'Jenny Kay',theme:'Original retro-game theme',show:'Both shows',music:'Original theme planned',appearance:'Pink hair with blonde streaks; glasses and braces',personality:'The Raven’s longtime school best friend. Bright, playful, retro-game obsessed, quick with 8-bit jokes and surprisingly strategic.'},
 {title:'The Raven',name:'Wolfpack Leader',theme:'Wings of the Raven',show:'Both shows',music:'Original theme planned',personality:'The Raven: composed quiz intellect, competitive retro-gaming wit and occasional self-deprecating humor.'}
];
const ariDefault={name:'Arianna Dawson',hair:'Copper Red',style:'Long Waves',glasses:'Black Frames',braces:'Visible Silver',outfit:'Black Blazer / Orange Shirt'};let host=load('wolf_host',ariDefault);
let contestants=load('wolf_contestants',Array.from({length:4},(_,i)=>({name:'Contestant '+(i+1),hair:'Brown',glasses:'None',outfit:'Black & Orange'})));
let contestantIndex=0,showConfig=load('wolf_showConfig',{hunterSelection:'different',builderSeconds:60});
let stats=load('wolf_stats',{shows:0,wins:0,earnings:0}),importedTracks={},musicPlaying=null,importedTrackNames={};
let themesLoaded=false,themeLoading=null;
async function loadSavedHunterThemes(){
 if(themesLoaded||themeLoading)return themeLoading;
 if(!window.wolfThemes?.list){themesLoaded=true;return}
 themeLoading=(async()=>{
  try{
   const stored=await window.wolfThemes.list();
   for(const [hunter,track] of Object.entries(stored||{})){
    if(!hunterProfiles.some(p=>p.title===hunter)||!track?.base64||!['mp3','wav','ogg'].includes(track.ext))continue;
    const raw=atob(track.base64),bytes=new Uint8Array(raw.length);
    for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
    const blob=new Blob([bytes],{type:track.ext==='mp3'?'audio/mpeg':track.ext==='wav'?'audio/wav':'audio/ogg'});
    if(importedTracks[hunter]){importedTracks[hunter].pause();URL.revokeObjectURL(importedTracks[hunter].src)}
    importedTracks[hunter]=new Audio(URL.createObjectURL(blob));importedTrackNames[hunter]=track.name||'Saved theme';
   }
   themesLoaded=true;
  }catch(err){console.warn('Could not load saved Hunter themes',err)}
  finally{themeLoading=null}
 })();
 return themeLoading;
}

function selectedHunter(round){return showConfig.hunterSelection==='same'?friends[0]:friends[round%friends.length]}
function stopImportedMusic(){if(musicPlaying){musicPlaying.pause();musicPlaying.currentTime=0;musicPlaying=null}}
function playHunterTheme(name){if(!name){if(!session)return;name=['final','finalHunter','bonusOffer','pushback'].includes(session.phase)?'The Raven':selectedHunter(session.round)}const a=importedTracks[name];if(a&&musicPlaying!==a){stopImportedMusic();musicPlaying=a;a.currentTime=0;a.play().catch(()=>{})}if(window.wolfStage?.setWardenMode)window.wolfStage.setWardenMode(name==='The Warden');}
const CREATOR_HAIR=['Brown','Black','Dark Brown','Light Brown','Blonde','Auburn','Copper Red','Bright Red','Gray','White','Blue','Purple'];
const CREATOR_GLASSES=['None','Black Frames','Orange Frames','Silver Frames','Thick Frames','Round Frames','Rimless'];
const CREATOR_OUTFITS=['Black & Orange','Black Suit','Orange Suit','White Suit','Casual Shirt','Casual Jacket','Evening Wear','Sports Jersey'];
function creatorSelect(id,values,current){const options=[...new Set([...values,current].filter(Boolean))];return '<select id="'+id+'">'+options.map(v=>'<option value="'+esc(v)+'" '+(v===current?'selected':'')+'>'+esc(v)+'</option>').join('')+'</select>'}
const CHASE_CONTESTANT_OPTIONS=[
 ['outfit','Clothing',['Purple','Red','Blue','Green','Gold','Black']],
 ['skin','Skin tone',['Light','Medium','Tan','Dark']],
 ['hairStyle','Hairstyle',['Short','Long','Bald','Curly']],
 ['hair','Hair color',['Brown','Black','Blonde','Red','Gray']],
 ['glasses','Glasses',['No','Yes']],
 ['braces','Braces',['No','Yes']],
 ['gender','Gender',['Female','Male','Nonbinary']]
];
const CHASE_PIERCINGS=['Left Ear Lobe','Right Ear Lobe','Left Ear Upper','Right Ear Upper','Helix','Forward Helix','Tragus','Anti-Tragus','Conch','Daith','Rook','Industrial','Snug','Orbital','Nostril Left','Nostril Right','Septum','Bridge','Eyebrow Left','Eyebrow Right','Vertical Labret','Labret','Monroe','Madonna','Medusa','Ashley','Snake Bites','Spider Bites','Angel Bites','Dahlia','Smiley','Tongue','Cheek Left','Cheek Right','Dermal'];
function chaseOptionDefault(p,key){
 const value=p[key];
 if(key==='glasses')return value==='None'?'No':value==='Yes'?'Yes':value?'Yes':'No';
 if(key==='outfit')return ['Purple','Red','Blue','Green','Gold','Black'].includes(value)?value:'Black';
 return value??({skin:'Medium',hairStyle:'Short',hair:'Brown',braces:'No',gender:'Female'}[key]);
}
function contestantEditor(){
 const p=contestants[contestantIndex];
 const fields=CHASE_CONTESTANT_OPTIONS.map(([key,label,options])=>'<label for="con_'+key+'">'+label+creatorSelect('con_'+key,options,chaseOptionDefault(p,key))+'</label>').join('');
 const height=Math.min(90,Math.max(54,Number(p.height_inches)||66));
 const piercingChoices=CHASE_PIERCINGS.map((kind,i)=>'<label class="piercing-choice"><input type="checkbox" data-con-piercing="'+i+'" '+((p.piercings||[]).includes(kind)?'checked':'')+'>'+esc(kind)+'</label>').join('');
 shell('<div class="creator-page"><p class="eyebrow">Contestant Creator</p><h1>Create a Contestant</h1><p class="sub">The Chase contestant options, adapted for The Hunt. Choose one contestant at a time and save the team.</p><div class="card creator-card"><h2>Contestant '+(contestantIndex+1)+' of 4</h2><div class="creator-form"><label for="con_name">Contestant name<input id="con_name" maxlength="60" value="'+esc(p.name)+'"></label>'+fields+'<label for="con_height">Height <strong id="heightLabel">'+Math.floor(height/12)+' ft '+(height%12)+' in · '+Math.round(height*2.54)+' cm</strong><input id="con_height" type="range" min="54" max="90" step="1" value="'+height+'"></label><details class="piercings-dropdown"><summary>Piercings ('+(p.piercings||[]).length+' selected)</summary><div class="piercing-grid">'+piercingChoices+'</div></details></div><div class="btnrow"><button id="previousContestant" '+(contestantIndex===0?'disabled':'')+'>Previous contestant</button><button class="primary" id="nextContestant">'+(contestantIndex===3?'Save Contestants':'Save & Next ▶')+'</button></div></div></div>');
}
function saveContestant(){
 const previous=contestants[contestantIndex];
 const updated={...previous,name:document.getElementById('con_name').value.trim()||'Contestant '+(contestantIndex+1)};
 for(const [key] of CHASE_CONTESTANT_OPTIONS)updated[key]=document.getElementById('con_'+key).value;
 updated.height_inches=Number(document.getElementById('con_height').value);
 updated.piercings=[...document.querySelectorAll('[data-con-piercing]')].filter(el=>el.checked).map(el=>CHASE_PIERCINGS[Number(el.dataset.conPiercing)]);
 contestantIndex=Math.min(3,contestantIndex);contestants[contestantIndex]=updated;save('wolf_contestants',contestants);
}
function showEditor(){
 shell('<div class="creator-page"><p class="eyebrow">Show Settings</p><h1>Create a Show</h1><p class="sub">The Hunt Cash Builder is always 120 seconds or 10 questions, whichever comes first. Beat the Wolfpack keeps its own settings. All format settings use readable dropdowns.</p><div class="card creator-card"><div class="creator-form"><label for="showSelection">Hunter rotation'+creatorSelect('showSelection',['different','same'],showConfig.hunterSelection).replace('value="different"','value="different"').replace('>different</option>','>Different Hunter for each contestant</option>').replace('>same</option>','>Same Hunter every round</option>')+'</label><label for="builderSeconds">Beat the Wolfpack Cash Builder duration<select id="builderSeconds">'+[60,90,120].map(v=>'<option value="'+v+'" '+(showConfig.builderSeconds===v?'selected':'')+'>'+v+' seconds</option>').join('')+'</select></label></div><div class="btnrow"><button class="primary" id="saveShow">Save Show Setup</button><button data-go="create">Back to Create Studio</button></div></div></div>');
}
function musicEditor(){if(!themesLoaded&&window.wolfThemes?.list){loadSavedHunterThemes().then(()=>{if(screen==='music')musicEditor()});}shell('<h1>Music Importer</h1><p>Import a different entrance theme for every Hunter. Themes play across The Hunt, Beat the Wolfpack, Wolfpack Trials and Raven finales when that Hunter is introduced. MP3, WAV and OGG files are saved locally in your app data and reloaded automatically next time you open the game. Imported audio is never bundled in the public installers.</p><div class="grid">'+hunterProfiles.map(p=>'<div class="card"><h2>'+esc(p.title)+'</h2><p>'+esc(p.name)+' · '+esc(p.theme)+'</p><label>Hunter entrance theme<input type="file" accept="audio/*,.mp3,.wav,.ogg" data-music="'+esc(p.title)+'"></label><p>'+(importedTracks[p.title]?esc(importedTrackNames[p.title]||'Imported') :'No saved theme')+'</p><button data-preview="'+esc(p.title)+'" '+(importedTracks[p.title]?'':'disabled')+'>Preview</button><button data-remove-music="'+esc(p.title)+'" '+(importedTracks[p.title]?'':'disabled')+'>Remove Track</button></div>').join('')+'</div><button data-stop-music="yes">Stop Preview</button>')}
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
function home(){shell(`<p class="eyebrow">Wolfpack Studios · First playable prototype</p><h1>Choose your show.</h1><p class="sub">Hosted by ${esc(host.name)}. Two original trivia competitions and seven Wolfpack Hunters.</p><div class="grid"><section class="card gold"><span class="pill">TEAM COMPETITION</span><h2>THE HUNT</h2><p class="show-motto">The Hunt Starts Here!</p><p>Four contestants build their prize fund and face individual Hunters. Survivors advance to <b>Face the Raven</b>.</p><button class="primary" data-start="hunt">Play The Hunt</button></section><section class="card red"><span class="pill">SOLO COMPETITION</span><h2>BEAT THE WOLFPACK</h2><p class="show-motto">Time to Face the Pack!</p><p>Build a prize, select your opposition, and outlast the Hunters in a timed quiz battle.</p><button class="primary" data-start="btw">Play Beat the Wolfpack</button></section><section class="card"><span class="pill">CAREER CHALLENGE</span><h2>WOLFPACK TRIALS</h2><p>Four contestants face four separate Hunters. The survivors must defeat The Raven to unlock Become a Hunter.</p><button data-start="trials">Begin Trials</button></section><section class="card ${unlocked?'gold':'lock'}"><span class="pill">${unlocked?'UNLOCKED':'LOCKED'}</span><h2>BECOME A HUNTER</h2><p>${unlocked?'Play from the Hunter side and stop the contestants.':'Defeat The Raven in the Wolfpack Trials to unlock.'}</p><button data-start="hunter" ${unlocked?'':'disabled'}>${unlocked?'Play as a Hunter':'🔒 Locked'}</button></section></div>`)}

const HUNT_SLOGANS=Object.freeze({
 opening:'Let the Hunt Begin!',
 begin:'The Hunt Starts Here!',
 entrance:"You're in Their Territory Now!",
 danger:'The Pack Is Closing In!',
 choice:'Run With the Pack… or Fall Behind!',
 wolfpack:'Time to Face the Pack!',
 raven:'The Raven Awaits!',
 finale:"There's Nowhere Left to Hide!"
});
function sloganForPhase(s){
 if(s.phase==='builderIntro')return s.mode==='btw'?HUNT_SLOGANS.wolfpack:HUNT_SLOGANS.opening;
 if(s.phase==='builder')return HUNT_SLOGANS.begin;
 if(s.phase==='qualIntro')return HUNT_SLOGANS.entrance;
 if(s.phase==='offers')return HUNT_SLOGANS.choice;
 if(s.phase==='qual')return s.hunterStep>=s.playerStep-1?HUNT_SLOGANS.danger:HUNT_SLOGANS.choice;
 if(s.phase==='choice'||s.phase==='duel')return HUNT_SLOGANS.wolfpack;
 if(s.phase==='bonusOffer')return HUNT_SLOGANS.raven;
 if(['final','finalHunter','pushback'].includes(s.phase))return HUNT_SLOGANS.finale;
 return HUNT_SLOGANS.begin;
}
function start(mode){
 stop();stopImportedMusic();
 session={mode,phase:mode==='hunter'?'hunter':'builderIntro',round:0,qi:Math.floor(Math.random()*questions.length),
 money:0,roundMoney:0,builderCount:0,perfectBuilderCount:0,perfectBuilders:[],survivors:0,score:0,opp:0,clock:60,oppclock:60,
 turn:'player',opponents:2,selectedHunters:[],offer:0,playerStep:0,hunterStep:0,
 finalStage:'team',pushbacks:0,headStart:0,allCaught:false,log:'',q:null,answered:false,
 lastCorrect:null,doubleOrNothing:false,originalFinalPot:0,roundResults:[],finalTeamSet:[],finalHunterSet:[]};
 screen='play';if(window.wolfAudio)window.wolfAudio.start(mode);advance();
}
function advance(){
 stop();const s=session;if(!s)return;s.answered=false;s.lastCorrect=null;s.q=nextQ();
 if(s.phase==='builderIntro'){
  s.builderCount=0;s.roundMoney=0;s.score=0;s.clock=s.mode==='hunt'?120:showConfig.builderSeconds;
  s.log=s.mode==='btw'?HUNT_SLOGANS.wolfpack+' One contestant. Your first wrong answer ends the episode; later misses end the Cash Builder.':HUNT_SLOGANS.opening+' Contestant '+(s.round+1)+' — earn money in the Cash Builder before meeting a Hunter.';
 }else if(s.phase==='builder'){
  s.clock=s.mode==='hunt'?120:showConfig.builderSeconds;s.builderCount=0;s.roundMoney=0;s.score=0;s.log=s.mode==='hunt'?'Ten questions or two minutes. $10,000 for every correct answer. Perfect 10/10 unlocks the Raven Super Offer and time bonus.':'Cash Builder: $1,000 for every correct answer.';
 }else if(s.phase==='qualIntro'){
  s.log=HUNT_SLOGANS.entrance+' Cash Builder complete: $'+s.roundMoney.toLocaleString()+'. '+selectedHunter(s.round)+' approaches the table. '+hunterLine(selectedHunter(s.round),'intro');
  playHunterTheme();
 }else if(s.phase==='offers'){
  let base=Math.max(1000,s.roundMoney),style=hunterOfferStyle(selectedHunter(s.round));
  s.offers=[{label:'LOW OFFER',money:Math.max(1000,Math.round(base*style.low/1000)*1000),step:1},
   {label:'MIDDLE OFFER',money:s.roundMoney,step:2},
   {label:'HIGH OFFER',money:Math.max(5000,Math.round(base*style.high/1000)*1000),step:3}];
  s.log=HUNT_SLOGANS.choice+' '+selectedHunter(s.round)+' offers three positions on the board. High offer: more money, one fewer step from being caught. '+hunterLine(selectedHunter(s.round),'offer');
 }else if(s.phase==='qual'){
  s.clock=0;s.score=0;s.opp=0;s.playerStep=s.offerStep||2;s.hunterStep=0;
  s.log=selectedHunter(s.round)+' vs '+contestants[s.round].name+'. Answer correctly to move your money down the board. The Hunter advances on correct answers.';
 }else if(s.phase==='bonusOffer'){
  s.originalFinalPot=s.money;s.doubleOrNothing=false;
  s.log=HUNT_SLOGANS.raven+' The Raven challenges the team to Double or Nothing before the final chase.';
 }else if(s.phase==='final'){
  s.finalStage='team';s.clock=120;s.oppclock=120;s.score=s.survivors;s.headStart=s.survivors;s.opp=0;s.pushbacks=0;s.turn='player';
  s.log=HUNT_SLOGANS.finale+' FACE THE RAVEN — '+s.survivors+' survivor(s), '+s.headStart+' point head start. Team plays first for 120 seconds.';
 }else if(s.phase==='finalHunter'){
  s.finalStage='hunter';s.turn='hunter';s.oppclock=120;s.aiDelay=0;
  s.log='THE RAVEN CHASES — Target '+s.score+'. Each wrong answer gives the team a pushback opportunity.';
 }else if(s.phase==='pushback'){
  s.turn='player';s.log='PUSHBACK CHANCE! Answer correctly to push The Raven back one step.';
 }else if(s.phase==='choice'){
  s.money=s.roundMoney;s.log=HUNT_SLOGANS.wolfpack+' The LED table is introducing all seven Hunters. Choose how many Hunters to face. More Hunters offer more money and a tougher clock.';
 }else if(s.phase==='duel'){
  s.clock=60;s.oppclock=45+Math.max(0,7-s.opponents)*10;s.aiDelay=0;s.turn='player';s.score=0;s.opp=0;
  s.selectedHunters=selectWolfpackHunters(s.opponents);
  s.log='Beat '+s.opponents+' Hunters: '+s.selectedHunters.join(', ')+'. Clocks alternate after each answer. First clock to zero loses.';
 }else if(s.phase==='hunter'){
  s.clock=60;s.oppclock=60;s.turn='player';s.score=0;s.opp=0;s.log='Become a Hunter — answer questions before the opposing contestant.';
 }
 draw();if(['builder','final','finalHunter','duel','hunter'].includes(s.phase))startTimer();
}
const hunterLines={
 'The Professor':{
  intro:'Welcome to your oral examination. I do hope you revised.',
  offer:'Knowledge is valuable. Whether you possess any is another question.',
  correct:'Precisely. I expected nothing less.',
  wrong:'A rare slip. Do enjoy it while it lasts.',
  victory:'Class dismissed.',
  defeat:'A surprisingly good answer. Well done.'
 },
 'The Red Raider':{
  intro:'Wreck Em! You better be ready for a fight. This feels like playing Baylor on a Saturday.',
  offer:'This is a bigger gamble than a fourth-down call against TCU.',
  correct:'Thats how we do it in Raider country! Guns up!',
  wrong:'That went about as well as a rivalry game against Texas. Next question.',
  victory:'Red Raider takes the win! Put that one in the win column.',
  defeat:'All right, you played that like a tough conference opponent.'
 },
 'El Jefe':{
  intro:'That is an interesting strategy. Wrong, obviously, but interesting.',
  offer:'I can make it expensive for you to be wrong.',
  correct:'I could explain it, but we only have so much time.',
  wrong:'Well, that was embarrassing. For me, unfortunately.',
  victory:'Another excellent decision by the management.',
  defeat:'Fine. You got me. Try not to make a habit of it.'
 },
 'The Jet':{
  intro:'Canada has arrived. Try not to take the bait!',
  offer:'The high offer looks great. What could possibly go wrong?',
  correct:'Oh, that one was too easy. Sorry!',
  wrong:'I was just testing whether you were paying attention. Obviously.',
  victory:'Sorry about that. Its a Canadian thing.',
  defeat:'Okay, you win this round. Ill be back with better jokes.'
 },
 'The Warden':{
  intro:'All rise. The Warden is now in session.',
  offer:'I will give you a chance at freedom. But it will cost you.',
  correct:'Objection overruled. Next!',
  wrong:'Sustained. Good catch. Next question.',
  victory:'Guilty as charged. Case closed.',
  defeat:'You earned your freedom. Well played.'
 },
 'The Girl Genius':{
  intro:'Player two has entered the game. Jenny Kay, ready to play!',
  offer:'Low, middle, high. Choose your difficulty setting!',
  correct:'Perfect input! Next level.',
  wrong:'Oops. That was a Game Over screen for me.',
  victory:'High score! Better luck on the next continue.',
  defeat:'You beat the final boss. Respect!'
 },
 'The Raven':{
  intro:'Welcome to the Wolfpack. Lets see what youve got.',
  offer:'Its a big number. Hope you can back it up.',
  correct:'Got it. Next!',
  wrong:'Oh, youve got to be kidding me. That one was mine!',
  victory:'The Wolfpack takes another one!',
  defeat:'Fair play. That was a great chase.'
 }
};
const hunterTempo={'The Professor':2,'The Red Raider':2,'El Jefe':3,'The Jet':2,'The Warden':1,'The Girl Genius':2,'The Raven':3};
function hunterLine(name,event){return hunterLines[name]?.[event]||''}
function hunterResponseDelay(s){
 const lineup=s.selectedHunters||[];
 return Math.max(1,Math.min(3,Math.round(lineup.reduce((total,name)=>total+(hunterTempo[name]||3),0)/(lineup.length||1))));
}
function hunterAccuracy(s){
 const lineup=s.selectedHunters||[];
 const ratings={'The Professor':.86,'The Red Raider':.79,'El Jefe':.84,'The Jet':.82,'The Warden':.89,'The Girl Genius':.87,'The Raven':.86};
 return lineup.length?lineup.reduce((total,name)=>total+(ratings[name]||.8),0)/lineup.length:.8;
}
function hunterOfferStyle(name){
 const profile={
  'The Professor':{low:.3,high:3.1},
  'The Red Raider':{low:.55,high:3.7},
  'El Jefe':{low:.4,high:3.3},
  'The Jet':{low:.45,high:3.2},
  'The Warden':{low:.42,high:2.8},
  'The Girl Genius':{low:.5,high:3.4}
 };
 return profile[name]||{low:.4,high:3};
}
function selectWolfpackHunters(n){
 const lineup=[...friends,'The Raven'];
 return lineup.slice(0,Math.max(1,Math.min(7,n)));
}
function startTimer(){
 stop();
 tick=setInterval(()=>{
  const s=session;if(!s)return;
  if(s.phase==='builder')s.clock--;
  else if(s.phase==='duel'){
   if(s.turn==='player')s.clock--;
   else{s.oppclock--;s.aiDelay=(s.aiDelay||0)+1;
    if(s.aiDelay>=hunterResponseDelay(s)){
     s.aiDelay=0;
     if(Math.random()<hunterAccuracy(s)){s.opp++;s.turn='player';const speaker=s.selectedHunters[(s.opp-1)%s.selectedHunters.length]||'The Raven';s.log=speaker+': '+hunterLine(speaker,'correct')+' Your clock is running!';nextTurn()}
     else{const speaker=s.selectedHunters[s.opp%s.selectedHunters.length]||'The Raven';s.log=speaker+': '+hunterLine(speaker,'wrong')+' Their clock keeps running.';const msg=document.querySelector('.message');if(msg)msg.textContent=s.log}
    }
   }
  }else if(s.phase==='final')s.clock--;
  else if(s.phase==='finalHunter'){
   s.oppclock--;s.aiDelay=(s.aiDelay||0)+1;
   if(s.aiDelay>=4){
    s.aiDelay=0;
    if(Math.random()<.76){s.opp++;s.log='The Raven: '+hunterLine('The Raven','correct')+' '+s.opp+' / '+s.score;}
    else{s.phase='pushback';s.log='The Raven gets one wrong — a pushback chance for the team.';stop();draw();return}
    if(s.opp>=s.score){finish(false);return}
    nextTurn();
   }
  }else if(s.phase==='hunter'){if(s.turn==='player')s.clock--;else s.oppclock--;}
  else return;
  const el=document.getElementById('timer');
  if(el)syncBroadcastBug(s);
  if(s.phase==='builder'&&s.clock<=0){finishBuilder();return}
  if(s.phase==='final'&&s.clock<=0){s.phase='finalHunter';advance();return}
  if(s.phase==='finalHunter'&&s.oppclock<=0){finish(true);return}
  if(s.phase==='duel'&&(s.clock<=0||s.oppclock<=0)){finish(s.oppclock<=0);return}
  if(s.phase==='hunter'&&(s.clock<=0||s.oppclock<=0)){finish(s.oppclock<=0)}
 },1000);
}
function finishBuilder(){
 const s=session;if(!s)return;stop();
 if(s.mode==='btw'){
  if(s.builderCount===0){end('Cash Builder expired without an answer. Episode over.');return}
  s.money=s.roundMoney;s.phase='choice';advance();
  }else{
  if(s.mode==='hunt'&&s.builderCount===10&&s.score===10){
   const bonus=Math.floor(Math.max(0,s.clock)/10)*1000;
   s.roundMoney+=bonus;s.perfectBuilderCount++;
   s.perfectBuilders.push({name:contestants[s.round]?.name||'Contestant',bonus});
   s.log='Perfect Cash Builder! $'+bonus.toLocaleString()+' time bonus earned and Raven Super Offer unlocked.';
  }
  s.phase='qualIntro';advance();
 }
}
function gamePanel(s){
 if(s.phase==='bonusOffer'){
  const beaten=s.roundResults.filter(r=>r.won).map(r=>r.hunter);
  const hunterName=beaten.length?beaten.join(', '):'the Hunters';
  return '<div class="card bonus-offer"><h2>'+(s.perfectBuilderCount?'SUPER OFFER UNLOCKED — ':'')+'DOUBLE OR NOTHING — THE RAVEN\'S CHALLENGE</h2><p>You got passed '+esc(hunterName)+'. But double your current prize pot says <strong>YOU CAN\'T BEAT ME!</strong> Do you accept my offer?</p><div class="offer-grid"><div class="card"><h3>DECLINE</h3><strong>$'+s.money.toLocaleString()+'</strong><p>Keep the original prize for Face the Raven.</p><button class="primary" data-double="no">Decline Offer</button></div><div class="card"><h3>ACCEPT</h3><strong>$'+(s.money*2).toLocaleString()+'</strong><p>Win to split the doubled prize. Lose and the team takes home $0.</p><button class="primary" data-double="yes">Accept Double or Nothing</button></div></div></div>';
 }
 if(s.phase==='offers'){
  return '<h2>Hunter Offers</h2><div class="offer-grid">'+s.offers.map((o,i)=>'<div class="card"><h3>'+o.label+'</h3><strong>$'+o.money.toLocaleString()+'</strong><p>Starting position: '+o.step+' steps from home</p><button data-offer="'+i+'">Accept Offer</button></div>').join('')+'</div>';
 }
 if(s.phase==='qual')return '<div class="card"><h2>Head-to-Head Board</h2><div class="chase-track">'+Array.from({length:7},(_,i)=>'<div class="track-cell '+(s.playerStep===i?'player-cell ':'')+(s.hunterStep===i?'hunter-cell':'')+'">'+(s.playerStep===i?'$'+s.offer.toLocaleString():'')+(s.hunterStep===i?' ◆':'')+'</div>').join('')+'</div><p>Money moves toward HOME. Red Hunter marker follows when the Hunter answers correctly.</p></div>';
 if(['final','finalHunter','pushback'].includes(s.phase))return '<div class="card"><h2>'+ (s.phase==='final'?'TEAM FINAL CHASE':s.phase==='pushback'?'PUSHBACK':'THE RAVEN IS CHASING')+'</h2><p>Team score: '+s.score+' · Raven score: '+s.opp+' · Pushbacks: '+s.pushbacks+'</p><p>Head start: '+s.headStart+'</p></div>';
 if(s.phase==='duel')return '<div class="card"><h2>Wolfpack Clock Battle</h2><p>'+s.selectedHunters.map(esc).join(' · ')+'</p><p>Contestant: '+s.clock+' seconds · Hunters: '+s.oppclock+' seconds · Turn: '+s.turn+'</p></div>';
 return '';
}
function chaseClock(seconds){
 const n=Math.max(0,Math.floor(Number(seconds)||0));
 return String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');
}
function broadcastBug(s){
 const cash=s.phase==='builder', seconds=s.phase==='finalHunter'?s.oppclock:s.clock;
 return '<section class="hunt-tv-bug" aria-label="Time and cash builder broadcast information">'+
 '<div class="tv-bug-money"><span class="tv-bug-label">'+(cash?(s.mode==='hunt'?esc(contestants[s.round]?.name||'CONTESTANT')+' · CASH EARNED':'CASH EARNED'):'TEAM PRIZE')+'</span><strong id="bugMoney">$'+(cash?s.roundMoney:s.money).toLocaleString()+'</strong></div>'+
 '<div class="tv-bug-time"><span class="tv-bug-label">'+(cash?'CASH BUILDER · 10 QUESTIONS':'TIME')+'</span><strong id="timer" class="tv-bug-digits">'+chaseClock(seconds)+'</strong></div>'+
 '<div class="tv-bug-round"><span class="tv-bug-label">'+(cash?'ANSWERS':'SCORE')+'</span><strong id="bugScore">'+(cash?s.builderCount:s.score)+'</strong></div></section>';
}
function syncBroadcastBug(s){
 const timer=document.getElementById('timer');if(timer)timer.textContent=chaseClock(s.phase==='finalHunter'?s.oppclock:s.clock);
 const money=document.getElementById('bugMoney');if(money)money.textContent='$'+(s.phase==='builder'?s.roundMoney:s.money).toLocaleString();
 const score=document.getElementById('bugScore');if(score)score.textContent=s.phase==='builder'?s.builderCount:s.score;
 if(window.wolfStage?.updateTeamPrize)window.wolfStage.updateTeamPrize(s.money,s.phase==='builder'?'TEAM PRIZE · CASH BUILDER':'TEAM PRIZE',s.roundMoney);
}

function draw(){
 const s=session;if(!s)return home();
 const heading=s.mode==='hunt'?'THE HUNT':s.mode==='btw'?'BEAT THE WOLFPACK':s.mode==='trials'?'WOLFPACK TRIALS':'BECOME A HUNTER';
 const phase=({builderIntro:'Cash Builder',builder:'Cash Builder',qualIntro:'Hunter Entrance',offers:'Hunter Offers',qual:'Head-to-Head',bonusOffer:'Double or Nothing',final:'FACE THE RAVEN',finalHunter:'FACE THE RAVEN',pushback:'Pushback',choice:'Choose Hunters',duel:'Wolfpack Showdown',hunter:'Hunter Challenge'})[s.phase]||s.phase;
 const isIntro=['builderIntro','qualIntro'].includes(s.phase);
 const choice=['choice','offers'].includes(s.phase);
 const timerText=s.phase==='builder'?'Cash Builder: '+s.clock+'s':'Contestant: '+s.clock+'s · Hunters: '+s.oppclock+'s';
 shell('<p class="eyebrow">'+heading+' · '+phase+'</p><h1>'+phase+'</h1><div class="status broadcast-scorebar"><span>Team prize: $'+s.money.toLocaleString()+'</span><span>Round money: $'+s.roundMoney.toLocaleString()+'</span><span>Correct: '+s.score+'</span><span>Hunter: '+s.opp+'</span><span>Qualified: '+s.survivors+'</span></div>'+broadcastBug(s)+'<p class="hunt-show-slogan" aria-label="Wolfpack show catchphrase">'+esc(sloganForPhase(s))+'</p><div class="message metallic-message">'+esc(s.log)+'</div>'+setHtml(s)+gamePanel(s)+(isIntro?introHtml(s):s.phase==='choice'?choiceHtml(s):s.phase==='offers'||s.phase==='bonusOffer'?'':'<div class="question broadcast-question">'+esc(s.q.q)+'</div><div class="answers broadcast-answers">'+s.q.opts.map((a,i)=>'<button class="broadcast-answer" data-answer="'+i+'">'+esc(a)+'</button>').join('')+'</div>'));
 if(window.wolfStage){
  window.wolfStage.render(s.mode==='btw'?'btw':'hunt');
  if(window.wolfStage.setProfessorPortrait)window.wolfStage.setProfessorPortrait(localStorage.getItem('wolf_professor_photo'));
  window.wolfStage.updateDen(s.q?.q,s.lastCorrect);
  if(window.wolfStage.setActiveContestant)window.wolfStage.setActiveContestant(contestants[s.round]?.name||'Contestant',s.mode==='hunt'&&['qualIntro','offers','qual'].includes(s.phase),contestants[s.round]);
  if(window.wolfStage.updateTeamPrize)window.wolfStage.updateTeamPrize(s.money,s.phase==='builder'?'TEAM PRIZE · CASH BUILDER':'TEAM PRIZE',s.roundMoney);
  if(window.wolfStage.setWardenMode)window.wolfStage.setWardenMode(s.phase==='qualIntro'&&selectedHunter(s.round)==='The Warden');
  if(window.wolfStage.setIntroHunterCallback)window.wolfStage.setIntroHunterCallback(playHunterTheme);
  if(window.wolfStage.playIntroductions){
   if(s.phase==='qualIntro')window.wolfStage.playIntroductions([selectedHunter(s.round)]);
   else if(s.phase==='choice')window.wolfStage.playIntroductions([...friends,'The Raven']);
   else if(s.phase==='bonusOffer'||s.phase==='final')window.wolfStage.playIntroductions(['The Raven']);
  }
 }
}

function setHtml(s){return '<section class="three-scene"><div class="three-controls"><strong>FULL 3D STUDIO + HUNTER LED INTRO</strong><div><button data-camera="stage">Wide Stage</button><button data-camera="close">Podium Camera</button><button data-camera="entrance">Entrance Tunnel</button><button data-camera="den">Hunter\'s Den</button><button data-intro="replay">Replay Hunter Intro</button></div></div><div id="stage3d" class="stage3d" aria-label="Interactive 3D game show stage"></div><p class="muted">3D prototype: modeled stage, podiums, studio lighting, tunnel entrance and Hunter\'s Den. Stylized 2D character animations on the in-world LED table; realistic 3D Hunter characters are still in development.</p></section>'}

function introHtml(s){
 const first=s.phase==='builderIntro';
 return '<div class="card round-intro"><h2>'+(first?'CASH BUILDER':'HEAD-TO-HEAD')+'</h2><p>'+(first?'Answer up to ten questions in two minutes. Each correct answer earns $10,000. A perfect 10/10 wins $1,000 for each full 10 seconds left and unlocks the Raven Super Offer.':'You earned $'+s.roundMoney.toLocaleString()+'. '+esc(selectedHunter(s.round))+' is ready with three offers.')+'</p><button class="primary" data-round-next="'+(first?'builder':'offers')+'">'+(first?'Start Cash Builder':'Meet the Hunter')+'</button></div>';
}
function choiceHtml(s){
 return '<h2>Choose your challenge</h2><p>Face between one and seven Wolfpack Hunters. Your Cash Builder stake is $'+s.money.toLocaleString()+'.</p><div class="offer-grid">'+[1,2,3,4,5,6,7].map(n=>'<div class="card"><h2>'+n+' Hunter'+(n===1?'':'s')+'</h2><p>Potential prize: $'+(Math.max(1000,s.money)*n).toLocaleString()+'</p><p>Hunter clock: '+(45+Math.max(0,7-n)*10)+' seconds</p><button data-choose="'+n+'">Face '+n+' Hunter'+(n===1?'':'s')+'</button></div>').join('')+'</div>';
}
function endQualifier(won){
 const s=session;if(won){s.survivors++;s.money+=s.offer;}
 s.roundResults.push({name:contestants[s.round]?.name||'Contestant',hunter:selectedHunter(s.round),won,offer:s.offer,comment:hunterLine(selectedHunter(s.round),won?'defeat':'victory')});
 s.round++;s.roundMoney=0;
 if(s.round>=4){
  if(s.survivors===0){s.allCaught=true;s.money=4000}
  s.phase=s.mode==='hunt'?'bonusOffer':'final';advance();return;
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
  if(good){s.roundMoney+=s.mode==='hunt'?10000:1000;s.score++;}else s.miss++;
  s.log=good?'Correct! +$'+(s.mode==='hunt'?'10,000':'1,000'):'Wrong: '+s.q.a;
  if(s.mode==='btw'&&!good){
   if(s.builderCount===1){end('First Cash Builder answer missed — Beat the Wolfpack episode over.');return}
   s.phase='choice';s.money=s.roundMoney;advance();return;
  }
  if(s.mode==='btw'&&s.builderCount>=5){s.money=s.roundMoney;s.phase='choice';advance();return}
  if(s.mode==='hunt'&&s.builderCount>=10){finishBuilder();return}
  syncBroadcastBug(s);
  nextTurn();return;
 }
 if(s.phase==='qual'){
  if(good)s.playerStep=Math.min(6,s.playerStep+1);
  else if(Math.random()<.75)s.hunterStep=Math.min(6,s.hunterStep+1);
  s.log=good?'Contestant advances toward home! '+hunterLine(selectedHunter(s.round),'wrong'):selectedHunter(s.round)+' takes a step closer. '+hunterLine(selectedHunter(s.round),'correct');
  if(s.hunterStep>=s.playerStep-1&&s.hunterStep<s.playerStep)s.log=HUNT_SLOGANS.danger+' '+s.log;
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
function nextTurn(){const s=session;if(!s)return;const reveal=s.answered===true;const proceed=()=>{if(session!==s)return;s.answered=false;s.q=nextQ();draw()};if(reveal)setTimeout(proceed,650);else proceed()}
function finish(win){
 stop();const s=session;if(!s)return;
 if(window.wolfAudio)window.wolfAudio.result(win);
 if(win&&s.mode==='trials'&&['final','finalHunter'].includes(s.phase)){unlocked=true;save('wolf_unlocked',true)}
 if(win&&s.phase==='duel')s.money=Math.max(1000,s.money)*s.opponents;
 stats.shows++;if(win){stats.wins++;stats.earnings+=s.money}save('wolf_stats',stats);
 const amount=win?'$'+s.money.toLocaleString():'$0';
 const split=win&&(s.phase==='final'||s.phase==='finalHunter')?(s.allCaught?' · $'+Math.floor(s.money/4).toLocaleString()+' for each of the four original contestants':' · $'+Math.floor(s.money/s.survivors).toLocaleString()+' per surviving contestant'):'';
 end((win?'VICTORY — ':'DEFEAT — ')+(win?(s.mode==='trials'?'The Raven defeated! Become a Hunter unlocked. ':'Prize won: '+amount+split):'The Wolfpack wins.'));
}
function end(msg){
 stop();stopImportedMusic();if(window.wolfAudio)window.wolfAudio.stop();
 session=null;screen='result';
 shell('<p class="eyebrow">Round complete</p><h1>'+esc(msg)+'</h1><div class="card"><p>Play another show, edit your contestants, or review the rules.</p><div class="btnrow"><button class="primary" data-go="home">Main Menu</button><button data-go="create">Create Studio</button></div></div>');
}

function hostEditor(){
 const options=(id,values,selected)=>creatorSelect('host_'+id,values,selected);
 shell('<div class="creator-page"><p class="eyebrow">Host Studio</p><h1>Create a Host</h1><p class="sub">Customize Arianna Dawson or create a new host. Dropdown options are fully visible and scrollable.</p><div class="grid"><section class="card"><h2>Active Host</h2><div class="host-avatar"><div class="host-hair">'+(host.hair.includes('Red')?'🦰':'👩')+'</div><strong>'+esc(host.name)+'</strong><span>'+esc(host.glasses)+' · '+esc(host.braces)+'</span></div></section><section class="card creator-card"><h2>Edit Host</h2><div class="creator-form"><label for="host_name">Host Name<input id="host_name" maxlength="60" value="'+esc(host.name)+'"></label><label for="host_hair">Hair Color'+options('hair',['Copper Red','Bright Red','Auburn','Dark Brown','Blonde','Black'],host.hair)+'</label><label for="host_style">Hair Style'+options('style',['Long Waves','Straight','Ponytail','Bob','Curly'],host.style)+'</label><label for="host_glasses">Glasses'+options('glasses',CREATOR_GLASSES,host.glasses)+'</label><label for="host_braces">Braces'+options('braces',['Visible Silver','Orange Bands','Clear Brackets','No Braces'],host.braces)+'</label><label for="host_outfit">Outfit'+options('outfit',['Black Blazer / Orange Shirt','Orange Jacket / Black Shirt','White Blazer / Black Shirt','Black Evening Dress','Orange Evening Dress'],host.outfit)+'</label></div><div class="btnrow"><button class="primary" id="saveHost">Save Host</button><button id="resetHost">Restore Original Arianna</button></div></section></div></div>');
}
function create(){
 const cards=hunterProfiles.map((p,i)=>'<div class="hunter-profile '+(i===6?'leader-profile':'')+'"><div class="hunter-title">'+esc(p.title)+'</div><strong>'+esc(p.name)+'</strong><small>'+esc(p.theme)+' · '+esc(p.show)+'</small><span class="muted">'+esc(p.personality||p.music)+'</span>'+(p.appearance?'<small class="muted">Appearance: '+esc(p.appearance)+'</small>':'')+'</div>').join('');
 shell('<p class="eyebrow">Creation tools · Alpha</p><h1>Create Studio</h1><h2>Official Hunters</h2><p class="sub">Seven confirmed Hunters, including Jenny Kay (The Girl Genius). Eric Herrera and Justin Silva are credited by their full names. The Raven is the Wolfpack leader. Abby Warren (The Warden) answers faster than the other Hunters.</p><div class="hunter-roster">'+cards+'</div><div class="card"><h2>Professor Sims Portrait</h2><p>Import the Karli-Rae Gomez Sims everyday screenshot for her LED reveal. The image stays on this computer.</p><label>Professor portrait<input id="professorPortrait" type="file" accept="image/png,image/jpeg,image/webp"></label><p id="professorPortraitStatus">Choose a portrait to replace the stylized avatar.</p></div><div class="grid"><div class="card"><h2>Hunter Entrance Music</h2><p>Scarlett\'s Fight Raiders Fight and Karli-Rae\'s Texas Fight are assigned to The Hunt only. No fight-song recordings are bundled. Use Music Importer to load tracks for this session. The Hunt plays imported Hunter themes at the Head-to-Head introduction.</p><p>El Jefe (Eric), The Jet (Justin), and The Raven use original planned themes.</p></div><div class="card"><h2>Question Creator</h2><p>Current questions: <b>'+questions.length+'</b></p><label>Question<input id="qtext" placeholder="Your trivia question"></label><label>Correct answer<input id="qanswer" placeholder="Correct answer"></label><label>Wrong answer 1<input id="wrong1"></label><label>Wrong answer 2<input id="wrong2"></label><label>Wrong answer 3<input id="wrong3"></label><button id="addQuestion">Add Question</button><div class="btnrow"><button id="exportQuestions">Export JSON</button><label class="pill">Import JSON<input type="file" id="importQuestions" accept="application/json,.json"></label></div><button id="resetQuestions">Reset Sample Questions</button></div></div><div class="card" style="margin-top:16px"><h2>Character & Show Studio</h2><div class="btnrow"><button data-go="host">Create a Host — Available</button><button data-go="contestants">Create a Contestant</button><button data-go="show">Create a Show</button><button data-go="music">Music Importer</button><button data-go="records">Records</button><button disabled>Create a Hunter Appearance — Coming Soon</button></div></div>');
}
function validQuestion(x){return x&&typeof x.q==='string'&&typeof x.a==='string'&&Array.isArray(x.opts)&&x.opts.length===4&&x.opts.every(y=>typeof y==='string')&&x.opts.includes(x.a)}
document.addEventListener('click',e=>{let b=e.target.closest('button');if(!b)return;if(b.dataset.go){go(b.dataset.go);return}if(b.dataset.start){start(b.dataset.start);return}if(b.dataset.roundNext){session.phase=b.dataset.roundNext;advance();return}if(b.dataset.double!==undefined){if(!session||session.phase!=='bonusOffer')return;session.doubleOrNothing=b.dataset.double==='yes';session.money=session.doubleOrNothing?session.originalFinalPot*2:session.originalFinalPot;session.phase='final';advance();return}if(b.dataset.offer!==undefined){const offer=session.offers[Number(b.dataset.offer)];if(!offer)return;session.offer=offer.money;session.offerStep=offer.step;session.phase='qual';advance();return}if(b.dataset.intro==='replay'){if(session&&window.wolfStage?.playIntroductions){const hunters=session.mode==='btw'?[...friends,'The Raven']:[session.phase==='final'||session.phase==='finalHunter'?'The Raven':selectedHunter(session.round)];window.wolfStage.playIntroductions(hunters)}return}if(b.dataset.camera){if(window.wolfStage)window.wolfStage.setView(b.dataset.camera);return}if(b.dataset.answer!==undefined){answer(b.dataset.answer);return}if(b.dataset.choose){session.opponents=+b.dataset.choose;session.phase='duel';advance();return}if(b.id==='nextContestant'){saveContestant();if(contestantIndex<3){contestantIndex++;contestantEditor()}else go('create');return}if(b.id==='previousContestant'){saveContestant();contestantIndex=Math.max(0,contestantIndex-1);contestantEditor();return}if(b.id==='saveShow'){showConfig={hunterSelection:document.getElementById('showSelection').value,builderSeconds:+document.getElementById('builderSeconds').value};save('wolf_showConfig',showConfig);go('create');return}if(b.dataset.preview){stopImportedMusic();playHunterTheme(b.dataset.preview);return}if(b.dataset.stopMusic){stopImportedMusic();return}if(b.dataset.removeMusic){const k=b.dataset.removeMusic;const a=importedTracks[k];if(!a)return;(async()=>{try{if(window.wolfThemes?.remove)await window.wolfThemes.remove(k);if(musicPlaying===a)stopImportedMusic();a.pause();URL.revokeObjectURL(a.src);delete importedTracks[k];delete importedTrackNames[k];musicEditor()}catch(err){alert('Could not remove saved theme: '+err.message)}})();return}if(b.id==='toggleAudio'){if(window.wolfAudio)window.wolfAudio.toggle();return}if(b.id==='saveHost'){host={name:document.getElementById('host_name').value.trim()||'Arianna Dawson',hair:document.getElementById('host_hair').value,style:document.getElementById('host_style').value,glasses:document.getElementById('host_glasses').value,braces:document.getElementById('host_braces').value,outfit:document.getElementById('host_outfit').value};save('wolf_host',host);hostEditor();return}if(b.id==='resetHost'){if(confirm('Restore Arianna Dawson to her original appearance?')){host={...ariDefault};save('wolf_host',host);hostEditor()}return}if(b.id==='addQuestion'){let ids=['qtext','qanswer','wrong1','wrong2','wrong3'];let vals=ids.map(x=>document.getElementById(x).value.trim());if(vals.some(x=>!x)||new Set(vals.slice(1).map(x=>x.toLowerCase())).size!==4){alert('Enter a question and four different answers.');return}questions.push({q:vals[0],a:vals[1],opts:vals.slice(1)});save('wolf_questions',questions);create();return}if(b.id==='resetQuestions'){if(confirm('Replace all questions with the sample bank?')){questions=base;save('wolf_questions',questions);create()}return}if(b.id==='exportQuestions'){let blob=new Blob([JSON.stringify(questions,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='wolfpack-questions.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)}});
document.addEventListener('input',e=>{if(e.target.id==='con_height'){const v=Number(e.target.value),label=document.getElementById('heightLabel');if(label)label.textContent=Math.floor(v/12)+' ft '+(v%12)+' in · '+Math.round(v*2.54)+' cm';}});
document.addEventListener('change',async e=>{if(e.target.id==='professorPortrait'){
 const file=e.target.files?.[0];if(!file)return;
 if(!/^image\/(png|jpeg|webp)$/.test(file.type)){alert('Choose PNG, JPG, or WebP.');return}
 const url=URL.createObjectURL(file);
 try{
  const picture=new Image();
  await new Promise((ok,fail)=>{picture.onload=ok;picture.onerror=fail;picture.src=url});
  const canvas=document.createElement('canvas'),ratio=Math.min(1,1000/Math.max(picture.naturalWidth,picture.naturalHeight));
  canvas.width=Math.max(1,Math.round(picture.naturalWidth*ratio));canvas.height=Math.max(1,Math.round(picture.naturalHeight*ratio));
  canvas.getContext('2d').drawImage(picture,0,0,canvas.width,canvas.height);
  const data=canvas.toDataURL('image/jpeg',.82);localStorage.setItem('wolf_professor_photo',data);
  if(window.wolfStage?.setProfessorPortrait)window.wolfStage.setProfessorPortrait(data);
  const label=document.getElementById('professorPortraitStatus');if(label)label.textContent='Karli-Rae Gomez Sims portrait imported';
 }catch(err){alert('Portrait import failed: '+err.message)}
 finally{URL.revokeObjectURL(url)}
 return;
}if(e.target.dataset.music){
 const file=e.target.files?.[0];if(!file)return;
 if(file.size>30000000){alert('30 MB maximum');return}
 const key=e.target.dataset.music,ext=file.name.split('.').pop().toLowerCase();
 if(!['mp3','wav','ogg'].includes(ext)){alert('Choose an MP3, WAV or OGG track');return}
 try{
  if(window.wolfThemes?.save){
   const bytes=new Uint8Array(await file.arrayBuffer()),batch=0x8000;let binary='';
   for(let i=0;i<bytes.length;i+=batch)binary+=String.fromCharCode(...bytes.subarray(i,i+batch));
   await window.wolfThemes.save(key,file.name,btoa(binary),ext);
  }
  const old=importedTracks[key];
  if(old){if(musicPlaying===old)stopImportedMusic();old.pause();URL.revokeObjectURL(old.src)}
  importedTracks[key]=new Audio(URL.createObjectURL(file));
  importedTrackNames[key]=file.name;musicEditor();
 }catch(err){alert('Could not save theme: '+err.message)}
 return;
}if(e.target.id!=='importQuestions')return;try{let arr=JSON.parse(await e.target.files[0].text());if(!Array.isArray(arr)||!arr.length||!arr.every(validQuestion))throw Error('Invalid question format');questions=arr;save('wolf_questions',questions);create();alert(`Imported ${questions.length} questions.`)}catch(err){alert('Import failed: '+err.message)}});
loadSavedHunterThemes().finally(()=>render());