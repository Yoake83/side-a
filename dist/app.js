const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
$$('.sound-toggle').forEach(b=>b.setAttribute('aria-label','Toggle sound'));
let paused=reduced.matches,selected=0,audioOn=false,audioContext,master,audioTimer,beat=0;
const records=[{name:'After hours',bpm:82,root:110,notes:[0,7,10,14]},{name:'Golden state',bpm:68,root:130.81,notes:[0,4,7,11]},{name:'Off centre',bpm:112,root:98,notes:[0,3,7,10]}];
function updateAudioUI(){document.body.classList.toggle('audio-on',audioOn);$$('.sound-toggle').forEach(b=>{b.setAttribute('aria-pressed',String(audioOn));const label=b.querySelector('.sound-label');if(label)label.textContent=audioOn?'SOUND ON':'SOUND OFF';else b.textContent=audioOn?'SOUND ON':'SOUND OFF'});$('#listen').innerHTML=audioOn?'PAUSE THE MOOD <span>Ⅱ</span>':'LISTEN TO THE MOOD <span>▶</span>';$('.now-label').textContent=`${audioOn?'NOW PLAYING':'SELECTED'} / ${records[selected].name.toUpperCase()}`}
function tone(freq,type,time,duration,volume){const o=audioContext.createOscillator(),g=audioContext.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(0,time);g.gain.linearRampToValueAtTime(volume,time+.018);g.gain.exponentialRampToValueAtTime(.0001,time+duration);o.connect(g);g.connect(master);o.start(time);o.stop(time+duration+.03)}
function scheduleBeat(){if(!audioOn)return;const r=records[selected],t=audioContext.currentTime+.03;const duration=60/r.bpm;const step=beat%16;if(step%4===0){r.notes.forEach((n,i)=>tone(r.root*2**(n/12),'sine',t+i*.023,duration*3.6,.055));tone(r.root/2,'sine',t,duration*1.5,.11)}if(selected!==1){if(step%4===0||step%4===2){const o=audioContext.createOscillator(),g=audioContext.createGain();o.frequency.setValueAtTime(110,t);o.frequency.exponentialRampToValueAtTime(36,t+.18);g.gain.setValueAtTime(.16,t);g.gain.exponentialRampToValueAtTime(.0001,t+.23);o.connect(g);g.connect(master);o.start(t);o.stop(t+.24)}if(step%2===1)tone(1800,'triangle',t,.035,.018)}const n=r.notes[(step*3)%4];tone(r.root*2**((n+12)/12),'sine',t+.02,duration*.8,.025);beat++;audioTimer=setTimeout(scheduleBeat,duration*500)}
async function setAudio(on){if(on){try{audioContext??=new(window.AudioContext||window.webkitAudioContext)();if(!master){master=audioContext.createGain();master.gain.value=.34;master.connect(audioContext.destination)}await audioContext.resume();audioOn=true;clearTimeout(audioTimer);scheduleBeat()}catch{audioOn=false;$('.now-label').textContent='AUDIO IS UNAVAILABLE IN THIS BROWSER';return}}else{audioOn=false;clearTimeout(audioTimer);if(audioContext)await audioContext.suspend()}updateAudioUI()}
$$('.sound-toggle').forEach(b=>b.addEventListener('click',()=>setAudio(!audioOn)));$('#listen').addEventListener('click',()=>setAudio(!audioOn));
function chooseRecord(i){selected=i;beat=0;$$('[data-record]').forEach((c,n)=>{c.classList.toggle('selected',n===i);c.setAttribute('aria-pressed',String(n===i))});updateAudioUI()}
$$('[data-record]').forEach(b=>b.addEventListener('click',()=>{chooseRecord(+b.dataset.record);setAudio(true)}));
function syncMotion(){document.body.classList.toggle('paused',paused);$('#motion').textContent=paused?'▶':'Ⅱ';$('#motion').setAttribute('aria-pressed',String(paused));$('#motion').setAttribute('aria-label',paused?'Resume motion':'Pause motion')}$('#motion').addEventListener('click',()=>{paused=!paused;syncMotion()});reduced.addEventListener('change',()=>{paused=reduced.matches;syncMotion()});syncMotion();
function openDialog(d){d.showModal();document.body.style.overflow='hidden'}
const navDialog=$('#nav-dialog'),sessionDialog=$('#session-dialog');$('.menu-toggle').addEventListener('click',()=>openDialog(navDialog));$('#session-open').addEventListener('click',()=>openDialog(sessionDialog));
$$('dialog').forEach(d=>{d.querySelector('.close').addEventListener('click',()=>d.close());d.addEventListener('close',()=>document.body.style.overflow='');d.addEventListener('click',e=>{const r=d.getBoundingClientRect();if(e.target===d&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))d.close()})});
$$('#nav-dialog a').forEach(a=>a.addEventListener('click',()=>navDialog.close()));$$('[data-session]').forEach(b=>b.addEventListener('click',()=>{chooseRecord(+b.dataset.session);sessionDialog.close();setAudio(true);$('#collection').scrollIntoView({behavior:'instant'})}));

const experience=$('.experience'),room=$('.room'),panels=$$('.scene-copy'),progressButtons=$$('[data-scene]');
progressButtons.forEach(b=>b.addEventListener('click',()=>{const positions=[0,1.3,2.48,3.4];scrollTo({top:experience.offsetTop+positions[+b.dataset.scene]/4*(experience.offsetHeight-innerHeight),behavior:reduced.matches?'instant':'smooth'})}));
// Each word brightens in reading order as the manifesto enters the viewport.
const textWalker=document.createTreeWalker($('.big-statement'),NodeFilter.SHOW_TEXT);const textNodes=[];while(textWalker.nextNode())textNodes.push(textWalker.currentNode);textNodes.forEach(node=>{const frag=document.createDocumentFragment();node.textContent.split(/(\s+)/).forEach(word=>{if(word.trim()){const span=document.createElement('span');span.className='word';span.textContent=word;frag.append(span)}else frag.append(document.createTextNode(word))});node.replaceWith(frag)});const words=$$('.word');
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),mix=(a,b,t)=>a+(b-a)*t,smooth=(a,b,x)=>{const v=clamp((x-a)/(b-a));return v*v*(3-2*v)};
function blendColor(a,b,t){return `rgb(${a.map((v,i)=>Math.round(mix(v,b[i],t))).join(',')})`}
let scenePosition=0,rawPosition=0,lastTime=0,ambient=0,pointerX=0,pointerY=0,px=0,py=0,renderScene;
addEventListener('pointermove',e=>{pointerX=e.clientX/innerWidth-.5;pointerY=e.clientY/innerHeight-.5},{passive:true});addEventListener('pointerleave',()=>{pointerX=pointerY=0});
function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-lastTime)/1000,.04);lastTime=now;if(document.hidden)return;if(!paused)ambient+=dt;const rect=experience.getBoundingClientRect();rawPosition=clamp(-rect.top/(experience.offsetHeight-innerHeight))*4;scenePosition=paused?rawPosition:mix(scenePosition,rawPosition,1-Math.exp(-dt*5.5));px=mix(px,paused?0:pointerX,dt*3);py=mix(py,paused?0:pointerY,dt*3);
 const s=scenePosition;const weights=[1-smooth(.38,.70,s),smooth(.74,1.05,s)*(1-smooth(1.7,2.02,s)),smooth(1.82,2.15,s)*(1-smooth(2.8,3.1,s)),smooth(2.93,3.3,s)];let active=weights.indexOf(Math.max(...weights));
 panels.forEach((p,i)=>{const w=weights[i];p.style.opacity=w;p.style.visibility=w>.01?'visible':'hidden';p.style.transform=w>.999?"none":`translateY(${(1-w)*(i===0?-45:35)}px)`;const hidden=w<.5;p.setAttribute('aria-hidden',String(hidden));p.inert=hidden});progressButtons.forEach((b,i)=>b.classList.toggle('active',active===i));
 const light=smooth(.45,1.0,s),dark=smooth(1.72,2.15,s);const orange=[232,167,143],ivory=[239,223,202],black=[33,22,28];const bg=orange.map((v,i)=>mix(mix(v,ivory[i],light),black[i],dark));$('.stage-background').style.background=`rgb(${bg.join(',')})`;$('.experience-foot').style.color=s<.65||dark>.5?'#fff0df':'#392126';$('.orbit-graphic').style.opacity=1-light;const worldExit=smooth(.40,1.05,s);$('.sound-world').style.opacity=1-worldExit;$('.sound-world img').style.transform=`translate3d(${px*-18}px,${py*-12-s*38}px,0) scale(${1.055+s*.24})`;$('.world-grid').style.opacity=smooth(.75,1.15,s)*(1-smooth(1.6,2.1,s))*.3;
 const rr=room.getBoundingClientRect(),rp=clamp(-rr.top/(room.offsetHeight-innerHeight));const reveal=smooth(.05,.85,rp);$('.room-image').style.clipPath=`circle(${mix(17,85,reveal)}% at 50% 55%)`;$('.room-image img').style.transform=`scale(${mix(1.25,1,reveal)})`;$('.room-title').style.transform=`scale(${mix(1,1.25,reveal)}) translateY(${-reveal*60}px)`;$('.room-title').style.opacity=1-smooth(.1,.6,rp);$('.room-caption').style.opacity=smooth(.5,.85,rp);
 const mr=$('.manifesto').getBoundingClientRect();const reading=clamp((innerHeight*.85-mr.top)/(mr.height*.75));words.forEach((w,i)=>w.style.opacity=reduced.matches?1:mix(.15,1,smooth(i/words.length,(i+2)/words.length,reading)));
 experience.style.background=$('.stage-background').style.background;
 const collectionTop=$('.collection').getBoundingClientRect().top,closingTop=$('.closing').getBoundingClientRect().top;
 $('.nav').style.background=rect.bottom>95?(s<.5?'transparent':experience.style.background):(collectionTop>95?'#21161c':closingTop>95?'#efdfca':'#a32c2d');
 document.body.classList.toggle('dark-nav',(rect.bottom>0&&(s<.5||s>1.94))||closingTop<95||(rr.top<95&&$('.collection').getBoundingClientRect().top>95));document.body.classList.toggle('nav-solid',rect.bottom<0&&rr.top<0&&rr.bottom>0&&rp>.5);
 $('.nav').classList.toggle('hero-nav',rect.bottom>95&&s<.5); if(renderScene&&rect.bottom>0)renderScene(s,ambient,px,py,dt);}
requestAnimationFrame(frame);

async function init3D(){
const T=await import('./assets/three.module.js');
await Promise.all([document.fonts.load('120px Anton'),document.fonts.load('500 120px Playfair Display')]);
const renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;$('#webgl').appendChild(renderer.domElement);
const scene=new T.Scene(),camera=new T.PerspectiveCamera(36,innerWidth/innerHeight,.1,100);camera.position.set(0,0,13);
scene.add(new T.HemisphereLight(0xe6d5bd,0x292021,1.65));const key=new T.DirectionalLight(0xfff7e7,4);key.position.set(-5,7,8);scene.add(key);const fill=new T.DirectionalLight(0xffffff,2.3);fill.position.set(6,1,6);scene.add(fill);const rim=new T.DirectionalLight(0xd5360c,4);rim.position.set(2,-3,3);scene.add(rim);
const env=new T.Scene();env.background=new T.Color('#55504a');function panel(w,h,color,x,y,z,rx=0,ry=0){const p=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color,side:T.DoubleSide}));p.position.set(x,y,z);p.rotation.set(rx,ry,0);env.add(p)}panel(3,10,'#ffffff',-5,1,4,0,.6);panel(2,10,'#e6d5bd',5,2,1,0,-.8);panel(10,3,'#ffffff',0,6,2,1);panel(10,10,'#101010',0,-6,0,-Math.PI/2);panel(1,8,'#d5360c',-3,0,-4);panel(12,2,'#ffecd2',0,5,6,-.65);panel(3,8,'#ecd1ef',-6,0,7,0,.6);const pmrem=new T.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(env,.02).texture;pmrem.dispose();
const black=new T.MeshPhysicalMaterial({color:'#151515',metalness:.55,roughness:.26,clearcoat:.6});const rubber=new T.MeshStandardMaterial({color:'#121212',roughness:.73});const metal=new T.MeshStandardMaterial({color:'#a5a5a2',metalness:.92,roughness:.22});const orange=new T.MeshPhysicalMaterial({color:'#d5360c',metalness:.12,roughness:.27,clearcoat:.8});const ivory=new T.MeshStandardMaterial({color:'#e6d5bd',roughness:.48});const darkMetal=new T.MeshStandardMaterial({color:'#242424',metalness:.8,roughness:.3});
function mesh(geometry,material,parent,pos=[0,0,0],rotation=[0,0,0]){const m=new T.Mesh(geometry,material);m.position.set(...pos);m.rotation.set(...rotation);parent.add(m);return m}
function cylinder(r,h,mat,parent,pos,rx=0){return mesh(new T.CylinderGeometry(r,r,h,64),mat,parent,pos,[rx,0,0])}
function roundedBox(w,h,d,r,mat,parent,pos){const sh=new T.Shape();sh.moveTo(-w/2+r,-h/2);sh.lineTo(w/2-r,-h/2);sh.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);sh.lineTo(w/2,h/2-r);sh.quadraticCurveTo(w/2,h/2,w/2-r,h/2);sh.lineTo(-w/2+r,h/2);sh.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);sh.lineTo(-w/2,-h/2+r);sh.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);const geo=new T.ExtrudeGeometry(sh,{depth:d,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.035,bevelThickness:.035,curveSegments:10});geo.translate(0,0,-d/2);return mesh(geo,mat,parent,pos)}
// Concentric microgrooves, a paper centre label, and reflective edges form the record.
const grooves=document.createElement('canvas');grooves.width=grooves.height=2048;const g=grooves.getContext('2d');g.fillStyle='#262626';g.fillRect(0,0,2048,2048);
// Fine physical grooves use a bump map; studio reflections stay in world space.
for(let i=340;i<1018;i+=2.25){g.strokeStyle=i%9<3?'#3d3d3d':'#191919';g.lineWidth=.65;g.beginPath();g.arc(1024,1024,i,0,Math.PI*2);g.stroke()}
for(const r of[330,345,648,657,833,842,1009]){g.strokeStyle='#555';g.lineWidth=1.2;g.beginPath();g.arc(1024,1024,r,0,Math.PI*2);g.stroke()}
const grooveMap=new T.CanvasTexture(grooves);grooveMap.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
// The radial tangent map makes physical anisotropy follow the cut grooves.
const tangents=document.createElement('canvas');tangents.width=tangents.height=256;const tc=tangents.getContext('2d'),td=tc.createImageData(256,256);for(let y=0;y<256;y++)for(let x=0;x<256;x++){const a=Math.atan2(y-128,x-128)+Math.PI/2,k=(y*256+x)*4;td.data[k]=Math.round((Math.cos(a)*.5+.5)*255);td.data[k+1]=Math.round((Math.sin(a)*.5+.5)*255);td.data[k+2]=255;td.data[k+3]=255}tc.putImageData(td,0,0);const tangentMap=new T.CanvasTexture(tangents);
const labelCanvas=document.createElement('canvas');labelCanvas.width=labelCanvas.height=1024;const l=labelCanvas.getContext('2d');l.fillStyle='#dcb989';l.fillRect(0,0,1024,1024);l.strokeStyle='#6b4539';l.lineWidth=2;for(const r of[451,470]){l.beginPath();l.arc(512,512,r,0,Math.PI*2);l.stroke()}l.fillStyle='#45252c';l.textAlign='center';l.font='500 400px "Playfair Display"';l.fillText('a',512,615);l.font='30px Arial';l.fillText('S I D E   A',512,780);const labelMap=new T.CanvasTexture(labelCanvas);labelMap.colorSpace=T.SRGBColorSpace;labelMap.anisotropy=8;
const vinylColor=grooveMap.clone();vinylColor.colorSpace=T.SRGBColorSpace;
const vinylMat=new T.MeshPhysicalMaterial({map:vinylColor,color:'#a295a0',bumpMap:grooveMap,bumpScale:.026,metalness:.65,roughness:.27,clearcoat:1,clearcoatRoughness:.12,anisotropy:.85,anisotropyMap:tangentMap,iridescence:.16,iridescenceIOR:1.32,iridescenceThicknessRange:[180,300],envMapIntensity:2.2});
const labelMat=new T.MeshPhysicalMaterial({map:labelMap,metalness:.72,roughness:.36,clearcoat:.6,envMapIntensity:1.1});
const brass=new T.MeshPhysicalMaterial({color:'#c99562',metalness:.94,roughness:.24,envMapIntensity:1.6});

function record(){const group=new T.Group();mesh(new T.TorusGeometry(1.989,.012,8,160),brass,group,[0,0,.027]);mesh(new T.TorusGeometry(.667,.018,8,96),brass,group,[0,0,.045]);const ring=new T.RingGeometry(.045,2,128);const uv=ring.attributes.uv;const positions=ring.attributes.position;for(let i=0;i<uv.count;i++)uv.setXY(i,positions.getX(i)/4+.5,positions.getY(i)/4+.5);mesh(ring,vinylMat,group,[0,0,.035]);mesh(new T.CylinderGeometry(2,2,.07,128,1,true),black,group,[0,0,0],[Math.PI/2,0,0]);const labelGeo=new T.RingGeometry(.045,.66,96);const luv=labelGeo.attributes.uv,lp=labelGeo.attributes.position;for(let i=0;i<luv.count;i++)luv.setXY(i,lp.getX(i)/1.32+.5,lp.getY(i)/1.32+.5);mesh(labelGeo,labelMat,group,[0,0,.04]);mesh(new T.RingGeometry(.045,2,128),rubber,group,[0,0,-.04],[Math.PI,0,0]);return group}
const vinyl=new T.Group(),vinylDisc=record();vinyl.add(vinylDisc);scene.add(vinyl);
const heroPose=new T.Quaternion(),landingPose=new T.Quaternion(),landingPosition=new T.Vector3(),landingScale=new T.Vector3();
// A complete turntable: plinth, isolation feet, strobe platter, spindle, tonearm and controls.
const deck=new T.Group();scene.add(deck);const plinth=new T.Group();deck.add(plinth);const base=roundedBox(5,3.65,.48,.12,black,plinth,[0,0,0]);base.rotation.x=-Math.PI/2;const top=roundedBox(4.85,3.5,.04,.08,darkMetal,plinth,[0,.265,0]);top.rotation.x=-Math.PI/2;
const edge=roundedBox(5.02,3.67,.075,.12,orange,plinth,[0,-.18,0]);edge.rotation.x=-Math.PI/2;for(const x of[-2,2])for(const z of[-1.35,1.35]){cylinder(.3,.22,rubber,plinth,[x,-.39,z]);cylinder(.29,.05,metal,plinth,[x,-.48,z])}
const platter=new T.Group();deck.add(platter);platter.position.set(-.55,.42,0);cylinder(1.53,.20,metal,platter,[0,0,0]);cylinder(1.48,.08,rubber,platter,[0,.13,0]);
const tickGeometry=new T.BoxGeometry(.032,.03,.017);const ticks=new T.InstancedMesh(tickGeometry,rubber,128);const dummy=new T.Object3D();for(let i=0;i<128;i++){const a=i/128*Math.PI*2;dummy.position.set(Math.cos(a)*1.529,.013,Math.sin(a)*1.529);dummy.rotation.y=-a;dummy.updateMatrix();ticks.setMatrixAt(i,dummy.matrix)}platter.add(ticks);
const deckRecord=record();deckRecord.scale.setScalar(.735);deckRecord.rotation.x=-Math.PI/2;deckRecord.position.set(-.55,.66,0);deck.add(deckRecord);deckRecord.visible=false;cylinder(.036,.26,metal,deck,[-.55,.76,0]);
const armPivot=new T.Group();armPivot.position.set(1.65,.45,-1.0);deck.add(armPivot);cylinder(.3,.23,metal,armPivot,[0,0,0]);cylinder(.18,.33,black,armPivot,[0,.2,0]);const arm=new T.Group();arm.position.y=.38;armPivot.add(arm);const armCurve=new T.CatmullRomCurve3([new T.Vector3(0,0,-.38),new T.Vector3(0,0,.25),new T.Vector3(-.02,0,.9),new T.Vector3(-.25,0,1.4),new T.Vector3(-.48,0,1.68)]);mesh(new T.TubeGeometry(armCurve,48,.043,12,false),metal,arm);mesh(new T.CylinderGeometry(.16,.16,.32,32),darkMetal,arm,[0,0,-.42],[Math.PI/2,0,0]);const headshell=mesh(new T.BoxGeometry(.19,.11,.4),black,arm,[-.5,-.03,1.73]);headshell.rotation.y=-.4;mesh(new T.BoxGeometry(.11,.13,.16),orange,arm,[-.5,-.13,1.77]);mesh(new T.ConeGeometry(.017,.1,8),metal,arm,[-.52,-.23,1.78],[Math.PI,0,0]);
cylinder(.18,.07,metal,deck,[-2,.32,1.3]);cylinder(.12,.085,black,deck,[-2,.34,1.3]);mesh(new T.BoxGeometry(.43,.04,.15),ivory,deck,[-1.5,.31,1.43]);mesh(new T.BoxGeometry(.07,.03,.02),new T.MeshBasicMaterial({color:'#d5360c'}),deck,[-1.5,.342,1.48]);mesh(new T.BoxGeometry(.05,.025,.8),rubber,deck,[2,.30,.7]);mesh(new T.BoxGeometry(.23,.05,.12),metal,deck,[2,.33,.6]);
const deckLabel=document.createElement('canvas');deckLabel.width=512;deckLabel.height=128;const dl=deckLabel.getContext('2d');dl.fillStyle='#e6d5bd';dl.font='bold 65px Arial';dl.fillText('SIDE A / 01',15,70);dl.font='15px Arial';dl.fillText('PRECISION IN EVERY REVOLUTION',15,105);const deckTex=new T.CanvasTexture(deckLabel);deckTex.colorSpace=T.SRGBColorSpace;mesh(new T.PlaneGeometry(.9,.225),new T.MeshBasicMaterial({map:deckTex,transparent:true}),deck,[1.3,.312,1.28],[-Math.PI/2,0,0]);
// The speaker is built in layers so scrolling can reveal the physical sound path.
function speaker(){const sp=new T.Group();const shell=new T.Group();sp.add(shell);roundedBox(2.28,3.3,1.28,.10,orange,shell,[0,0,0]);roundedBox(2.12,3.14,.12,.08,black,shell,[0,0,.7]);const components=[];
 const woofer=new T.Group();woofer.position.set(0,-.52,.80);sp.add(woofer);components.push(woofer);
 const surround=mesh(new T.TorusGeometry(.77,.1,16,96),rubber,woofer);const conePts=[[.15,-.16],[.30,-.14],[.48,-.04],[.70,.12],[.74,.15]].map(p=>new T.Vector2(...p));mesh(new T.LatheGeometry(conePts,96),new T.MeshStandardMaterial({color:'#272727',roughness:.48,metalness:.2,side:T.DoubleSide}),woofer,[0,0,-.04],[Math.PI/2,0,0]);const dust=mesh(new T.SphereGeometry(.32,48,32),black,woofer,[0,0,.02]);dust.scale.z=.47;
 mesh(new T.TorusGeometry(.90,.035,8,96),metal,woofer,[0,0,-.03]);for(let i=0;i<6;i++){const a=i/6*Math.PI*2;cylinder(.035,.025,metal,woofer,[Math.cos(a)*.87,Math.sin(a)*.87,.025],Math.PI/2)}
 const tweeter=new T.Group();tweeter.position.set(0,.94,.85);sp.add(tweeter);components.push(tweeter);mesh(new T.TorusGeometry(.4,.075,12,64),darkMetal,tweeter);const hornPts=[[.075,-.2],[.10,-.1],[.18,.03],[.31,.16],[.37,.19]].map(p=>new T.Vector2(...p));mesh(new T.LatheGeometry(hornPts,64),orange,tweeter,[0,0,0],[Math.PI/2,0,0]);const dome=mesh(new T.SphereGeometry(.12,32,16),metal,tweeter,[0,0,.04]);dome.scale.z=.5;
 const magnet=cylinder(.44,.36,darkMetal,sp,[0,-.52,-.62],Math.PI/2);components.push(magnet);const coil=cylinder(.22,.28,new T.MeshStandardMaterial({color:'#b8763d',metalness:.88,roughness:.28}),sp,[0,-.52,-.9],Math.PI/2);components.push(coil);
 const trim=mesh(new T.BoxGeometry(.42,.1,.035),ivory,shell,[.66,-1.37,.79]);for(const x of[-.86,.86])mesh(new T.BoxGeometry(.26,.15,.6),rubber,shell,[x,-1.73,.1]);sp.userData={shell,woofer,tweeter,magnet,coil};return sp}
const speakerOne=speaker();scene.add(speakerOne);const speakerTwo=speaker();scene.add(speakerTwo);
// Concentric sound waves occupy actual depth and expand with the system scene.
const waves=new T.Group();scene.add(waves);const waveMat=new T.MeshBasicMaterial({color:'#d9989a',transparent:true,opacity:.2,depthWrite:false});for(let i=0;i<9;i++){const r=new T.Mesh(new T.TorusGeometry(1.2+i*.55,.012,6,100),waveMat.clone());r.position.z=-1-i*.2;waves.add(r)}
// Foreground objects cross at distinct depths as the visitor enters the world.
const orbitRecords=new T.Group();scene.add(orbitRecords);for(let i=0;i<2;i++){const d=record();orbitRecords.add(d);d.userData.index=i}
const dustGeo=new T.BufferGeometry(),dustPositions=new Float32Array(90*3);for(let i=0;i<90;i++){dustPositions[i*3]=Math.sin(i*12.13)*10;dustPositions[i*3+1]=Math.cos(i*9.41)*4;dustPositions[i*3+2]=-3+Math.sin(i*2.17)*3}dustGeo.setAttribute('position',new T.BufferAttribute(dustPositions,3));const dust=new T.Points(dustGeo,new T.PointsMaterial({color:0xffe5bf,size:.025,transparent:true,opacity:.65,depthWrite:false}));scene.add(dust);
const recordControl=$('.record-interaction');let recordSpin=0,spinVelocity=0,dragging=false,lastDragX=0;
recordControl.addEventListener('pointerdown',e=>{if(paused)return;dragging=true;lastDragX=e.clientX;recordControl.setPointerCapture(e.pointerId);recordControl.classList.add('dragging')});
recordControl.addEventListener('pointermove',e=>{if(!dragging)return;const delta=(e.clientX-lastDragX)*.009;recordSpin+=delta;spinVelocity=delta*28;lastDragX=e.clientX});
function releaseRecord(){dragging=false;recordControl.classList.remove('dragging')}recordControl.addEventListener('pointerup',releaseRecord);recordControl.addEventListener('pointercancel',releaseRecord);recordControl.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&!paused){e.preventDefault();spinVelocity+=2.2}});
const projectedRecord=new T.Vector3();
// Bevelled, volumetric notation follows a rising helix above the platter.
const musicalNotes=new T.Group();scene.add(musicalNotes);
function musicSymbol(paired,index){
 const note=new T.Group(),material=new T.MeshPhysicalMaterial({color:index%3===0?'#8e3542':'#c89860',metalness:index%3===0?.38:.8,roughness:.28,clearcoat:.8,transparent:true,opacity:0,depthWrite:false,envMapIntensity:1.4});
 const head=new T.Shape();head.absellipse(0,0,.18,.12,-.25,Math.PI*2-.25,false,0);
 const headGeometry=new T.ExtrudeGeometry(head,{depth:.075,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.025,bevelThickness:.025,curveSegments:20});headGeometry.translate(0,0,-.04);
 function stem(x,y){const h=mesh(headGeometry,material,note,[x,y,0]);h.rotation.z=.3;mesh(new T.CylinderGeometry(.027,.027,.78,12),material,note,[x+.145,y+.38,0]);}
 stem(paired?-.25:0,0);
 if(paired){stem(.27,.08);const beam=mesh(new T.BoxGeometry(.58,.105,.09),material,note,[.15,.81,0]);beam.rotation.z=.15}
 else if(index%2===0){const flag=new T.Shape();flag.moveTo(.14,.76);flag.bezierCurveTo(.20,.64,.49,.57,.38,.35);flag.bezierCurveTo(.56,.55,.39,.74,.14,.87);mesh(new T.ExtrudeGeometry(flag,{depth:.06,bevelEnabled:true,bevelSize:.018,bevelThickness:.018,bevelSegments:3,steps:1,curveSegments:18}),material,note,[0,0,-.03]);}
 note.userData.material=material;return note;
}
for(let i=0;i<7;i++)musicalNotes.add(musicSymbol(i%3===1,i));

let w=innerWidth,h=innerHeight;function resize(){w=innerWidth;h=innerHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h)}addEventListener('resize',resize);
renderScene=(s,time,mx,my,dt)=>{const mobile=w<=760,worldW=8.45*w/h;const deckIn=smooth(.58,1.22,s),speakerIn=smooth(1.75,2.24,s),systemIn=smooth(2.8,3.48,s);const worldScale=mobile?Math.min(.7,worldW/5.8):Math.min(1.2,worldW/9.5);const right=mobile?0:worldW*.19;
 // The same visible record travels continuously to the hidden landing anchor.
 const landing=smooth(.28,1.38,s),deckReveal=smooth(.40,.98,s);
 deck.visible=s>.40&&s<2.23;deck.scale.setScalar(worldScale*(mobile?.86:1)*(.78+.22*deckIn)*(1-speakerIn*.4));deck.position.set(right,mobile?-.65:-.55,-speakerIn*5);deck.rotation.set(mix(.30,.60,deckIn)+my*.04,mix(-.35,-.25,deckIn)+mx*.07,mix(-.08,.04,deckIn));
 // Bring the equipment up from below the frame without popping it into view.
 deck.position.y-=(1-deckReveal)*9;
 const assembly=1-smooth(.65,1.40,s);plinth.position.y=-assembly*.55;platter.position.y=.42+assembly*.20;deckRecord.position.y=.66;deckRecord.rotation.z=0;armPivot.position.y=.45+assembly*.3;armPivot.rotation.y=mix(-.2,-.62,smooth(1.35,1.7,s));
 deck.updateMatrixWorld(true);deckRecord.getWorldPosition(landingPosition);deckRecord.getWorldQuaternion(landingPose);deckRecord.getWorldScale(landingScale);
 heroPose.setFromEuler(new T.Euler(-.95+my*.10,-.20+mx*.18,-.22+mx*.07));
 vinyl.visible=s<2.23;vinyl.position.set(mobile?worldW*.035:worldW*.11,mobile?-1.62:-1.72,mix(.8,0,landing));
 // Keep the early trajectory above the rising deck, then converge exactly.
 const destination=landingPosition.clone();destination.y+=(1-deckReveal)*9+(1-landing)*.5;
 vinyl.position.lerp(destination,landing);vinyl.quaternion.copy(heroPose).slerp(landingPose,landing);
 const heroScale=mobile?Math.min(.58,worldW*.14):Math.min(.82,worldW*.068);
 vinyl.scale.setScalar(mix(heroScale,landingScale.x,landing));if(!dragging&&!paused){recordSpin+=spinVelocity*dt;spinVelocity*=Math.exp(-dt*1.4)}recordControl.hidden=s>.35;recordControl.disabled=s>.35||paused;projectedRecord.copy(vinyl.position).project(camera);recordControl.style.left=`${(projectedRecord.x*.5+.5)*w}px`;recordControl.style.top=`${(-projectedRecord.y*.5+.5)*h}px`;recordControl.style.width=`${heroScale*4/8.45*h}px`;recordControl.style.height=`${heroScale*3/8.45*h}px`;vinylDisc.rotation.z=-time*.075+recordSpin;

 speakerOne.visible=s>1.78;speakerTwo.visible=s>2.82;const speakerScale=worldScale*(mobile?.95:1.02);speakerOne.scale.setScalar(speakerScale*Math.max(.001,speakerIn));speakerTwo.scale.setScalar(speakerScale*.92);
 speakerOne.position.set(mix(right,mobile?-.73:-2.15,systemIn),mobile?-.75:-.35,0);speakerOne.rotation.set(.07+my*.07,mix(-.68,.22,systemIn)+mx*.1,.02);
 const explode=Math.sin(smooth(2.12,2.83,s)*Math.PI)*1.35*(mobile?.65:1);speakerOne.userData.woofer.position.z=.8+explode; speakerOne.userData.tweeter.position.z=.85+explode*.65;speakerOne.userData.magnet.position.z=-.62-explode*.9;speakerOne.userData.coil.position.z=-.9-explode*1.4;speakerOne.userData.shell.rotation.y=-explode*.15;
 speakerTwo.position.set(mobile?.86:2.15,mobile?-.8:-.35,mix(-4,0,systemIn));speakerTwo.rotation.set(.07,-.22+mx*.1,-.02);speakerTwo.scale.multiplyScalar(systemIn);
 speakerOne.scale.multiplyScalar(mix(1,.7,systemIn));speakerTwo.scale.multiplyScalar(.7);speakerOne.position.y-=systemIn*.8;speakerTwo.position.y-=systemIn*.8;
 const pulse=paused?0:Math.sin(time*(audioOn?records[selected].bpm/60*Math.PI*2:3))*.028;speakerOne.userData.woofer.scale.set(1,1,1+pulse*4);speakerTwo.userData.woofer.scale.set(1,1,1+pulse*4);waves.visible=s>2.75;waves.position.y=mobile?-.7:-.4;waves.rotation.y=mx*.05;waves.scale.setScalar(mobile?.55:1);waves.children.forEach((r,i)=>{r.scale.setScalar(1+Math.sin(time*1.2-i*.3)*.04);r.material.opacity=systemIn*(.2-i*.015)});
 const worldFade=1-smooth(.20,.82,s);orbitRecords.visible=worldFade>0;orbitRecords.children.forEach((d,i)=>{const coords=[[mobile?-.34:-.20,mobile?-2.8:-2.2,-.7],[.36,-.3,-1.8]][i];d.position.set(worldW*coords[0]+mx*(i+1)*.15,coords[1]+Math.sin(time*.5+i)*.13-s*(i+1)*2,coords[2]+s*5);d.rotation.set(-.6+i*.22,.3+i*.2,time*.06+i);d.scale.setScalar((mobile?.18:.27)*worldFade*(1+i*.18))});dust.visible=s<1;dust.rotation.z=time*.007;dust.position.y=-s;dust.material.opacity=worldFade*.65;
 const notationVisibility=smooth(.70,1.02,s)*(1-smooth(1.70,2.06,s));musicalNotes.visible=notationVisibility>.001;
 musicalNotes.children.forEach((note,i)=>{const flight=(time*.085+i/7)%1,angle=flight*Math.PI*2+i*1.7;const radius=worldW*(mobile?.26:.13);note.position.set(right+Math.cos(angle)*radius,(mobile?-1.2:-.75)+flight*(mobile?2.25:3.8),Math.sin(angle)*1.1+.3);note.rotation.set(Math.sin(time*.5+i)*.15,Math.sin(angle*.7)*.55,Math.sin(angle+i)*.23);const envelope=Math.min(1,flight*7,(1-flight)*7);note.scale.setScalar((mobile?.43:.65)*(i%3===1?.85:1)*notationVisibility);note.userData.material.opacity=notationVisibility*envelope*.95;});
 if(!paused)vinyl.position.y+=Math.sin(time*.8)*.07*(1-landing);renderer.render(scene,camera)};
renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();document.body.classList.add('no-webgl')});document.body.classList.add('scene-ready');
}
init3D().catch(err=>{console.warn('3D unavailable; displaying a graphic fallback.',err);document.body.classList.add('no-webgl')});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&audioOn)setAudio(false)});

// An intentionally small instrument: notes start only after a visitor plays.
const pianoKeys=$$('[data-note]'), noteNames=['C','D','E','F','G','A','B','C′'], noteSteps=[0,2,4,5,7,9,11,12];
let noteEnergy=0,noteFrequency=261.63,labVisible=false;
async function playNote(i,semitone=noteSteps[i],name=noteNames[i],key=pianoKeys[i]){
 if(!audioContext)audioContext=new(window.AudioContext||window.webkitAudioContext)();
 if(!master){master=audioContext.createGain();master.gain.value=.34;master.connect(audioContext.destination)}
 try{await audioContext.resume()}catch{return}
 const t=audioContext.currentTime,f=261.63*2**(semitone/12);noteFrequency=f;noteEnergy=1;
 tone(f,'sine',t,1.7,.23);tone(f*2,'sine',t,1.0,.06);tone(f*3,'sine',t,.55,.025);
 key.classList.add('pressed');$('.sound-lab').classList.add('playing');$('.lab-note').textContent=`${name} · ${Math.round(f)} Hz · Beautifully yours.`;
 setTimeout(()=>key.classList.remove('pressed'),220);
}
pianoKeys.forEach((key,i)=>key.addEventListener('click',()=>playNote(i)));
$$('.black-key').forEach((old,i)=>{const key=document.createElement('button');key.className=old.className;const name=['C♯','D♯','F♯','G♯','A♯'][i];key.setAttribute('aria-label',`Play ${name}`);key.addEventListener('click',()=>playNote(0,[1,3,6,8,10][i],name,key));old.replaceWith(key)});
const pressedKeys=new Set();addEventListener('keydown',e=>{if(!labVisible||e.repeat||e.ctrlKey||e.metaKey||e.altKey||$('dialog[open]')||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;const i='asdfghjk'.indexOf(e.key.toLowerCase());if(i<0||pressedKeys.has(e.key))return;pressedKeys.add(e.key);playNote(i)});addEventListener('keyup',e=>pressedKeys.delete(e.key));
new IntersectionObserver(es=>labVisible=es[0].isIntersecting,{threshold:.15}).observe($('.sound-lab'));
const scope=$('.scope'),scopeContext=scope.getContext('2d');let scopeTime=0;
function drawScope(){requestAnimationFrame(drawScope);if(!labVisible||document.hidden)return;const w=scope.clientWidth,h=scope.clientHeight;if(scope.width!==w*2){scope.width=w*2;scope.height=h*2}const c=scopeContext;c.setTransform(2,0,0,2,0,0);c.clearRect(0,0,w,h);c.strokeStyle='#d1a39918';c.lineWidth=.5;for(let x=0;x<w;x+=18){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke()}c.strokeStyle='#e9b092';c.lineWidth=1;c.beginPath();for(let x=0;x<w;x++){const envelope=Math.sin(x/w*Math.PI);const wave=Math.sin(x/w*Math.PI*(noteFrequency/32)+scopeTime)*Math.sin(x/w*Math.PI*2+scopeTime*.3);const y=h/2+wave*envelope*noteEnergy*h*.36;x?c.lineTo(x,y):c.moveTo(x,y)}c.stroke();noteEnergy*=.975;if(!paused)scopeTime+=.07;if(noteEnergy<.01)$('.sound-lab').classList.remove('playing')}
drawScope();
$$('.record-card').forEach(card=>{card.addEventListener('pointermove',e=>{if(reduced.matches||e.pointerType==='touch')return;const r=card.getBoundingClientRect();card.style.setProperty('--rx',`${-(e.clientY-r.top-r.height/2)/r.height*10}deg`);card.style.setProperty('--ry',`${(e.clientX-r.left-r.width/2)/r.width*12}deg`)});card.addEventListener('pointerleave',()=>{card.style.setProperty('--rx','0deg');card.style.setProperty('--ry','0deg')})});




