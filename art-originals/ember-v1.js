const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let paused = reduced.matches;
if (!paused) document.body.classList.add('js-motion');
const observer = new IntersectionObserver(entries => entries.forEach(e => {if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(e=>observer.observe(e));
const motionButton=document.querySelector('#motion');
function syncMotion(){document.body.classList.toggle('motion-paused',paused);motionButton.textContent=paused?'▶':'Ⅱ';motionButton.setAttribute('aria-pressed',String(paused));motionButton.setAttribute('aria-label',paused?'Resume ambient animation':'Pause ambient animation')}
motionButton.addEventListener('click',()=>{paused=!paused;syncMotion()});reduced.addEventListener('change',()=>{paused=reduced.matches;syncMotion()});syncMotion();
const menus={coffee:[['Espresso','A double shot of the house blend','₹160'],['Americano','Espresso lengthened with hot water','₹180'],['Flat white','Double espresso, silky steamed milk','₹240'],['Cappuccino','Espresso, textured milk, a cloud of foam','₹240'],['Iced oat latte','Espresso, oat milk, plenty of ice','₹280']],slow:[['Slow-brew filter','Seasonal coffee, brewed one cup at a time','₹260'],['Cold brew','Steeped slowly for a smooth, mellow finish','₹260'],['Chocolate & sea salt','Rich cocoa, steamed milk, a pinch of sea salt','₹250'],['Honey ginger tea','Ginger, honey, lemon, a moment to yourself','₹180']],bakes:[['Butter croissant','Golden, flaky, baked for a slow morning','₹190'],['Banana walnut loaf','A thick slice, gently warmed','₹180'],['Dark chocolate cookie','Crisp edges, a soft middle, sea salt','₹140']]};
const menuDialog=document.querySelector('#menu-dialog'),visitDialog=document.querySelector('#visit-dialog');
function renderMenu(category){document.querySelector('#menu-items').replaceChildren(...menus[category].map(([name,desc,price])=>{let row=document.createElement('div');row.className='menu-row';let details=document.createElement('div'),h=document.createElement('h3'),p=document.createElement('p'),cost=document.createElement('span');h.textContent=name;p.textContent=desc;cost.textContent=price;details.append(h,p);row.append(details,cost);return row}));document.querySelectorAll('[data-category]').forEach(b=>{const active=b.dataset.category===category;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))})}
renderMenu('coffee');document.querySelectorAll('[data-category]').forEach(b=>b.addEventListener('click',()=>renderMenu(b.dataset.category)));
function showDialog(d){d.showModal();document.body.style.overflow='hidden'}
document.querySelector('#open-menu').addEventListener('click',()=>showDialog(menuDialog));document.querySelector('#visit-info').addEventListener('click',()=>showDialog(visitDialog));document.querySelector('#visit-menu').addEventListener('click',()=>{visitDialog.close();showDialog(menuDialog)});
document.querySelectorAll('dialog').forEach(d=>{d.querySelector('.close').addEventListener('click',()=>d.close());d.addEventListener('close',()=>{if(!document.querySelector('dialog[open]'))document.body.style.overflow=''});d.addEventListener('click',e=>{const r=d.getBoundingClientRect();if(e.target===d&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))d.close()})});
const photo=document.querySelector('.space-photo img');
let photoTick=false;addEventListener('scroll',()=>{if(!photoTick){photoTick=true;requestAnimationFrame(()=>{photoTick=false;if(!paused){const r=photo.parentElement.getBoundingClientRect();if(r.top<innerHeight&&r.bottom>0)photo.style.transform=`translateY(${Math.max(-70,Math.min(0,-(innerHeight-r.top)*.065))}px)`}})}},{passive:true});

async function start3D(){
 const THREE=await import('./assets/three.module.js');
 const host=document.querySelector('#scene');
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.94;host.appendChild(renderer.domElement);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,innerWidth/innerHeight,.1,80);camera.position.set(0,1.5,12);camera.lookAt(0,0,0);
 scene.add(new THREE.HemisphereLight(0xfff6e1,0x736049,1.6));
 const key=new THREE.DirectionalLight(0xffefd4,3);key.position.set(-4,7,6);scene.add(key);
 const fill=new THREE.DirectionalLight(0xfffaf3,1.7);fill.position.set(5,2,3);scene.add(fill);
 const rim=new THREE.DirectionalLight(0xffffff,2);rim.position.set(0,5,-4);scene.add(rim);
 const envScene=new THREE.Scene();envScene.background=new THREE.Color('#bcb2a3');
 function panel(w,h,color,x,y,z,rx=0,ry=0){const p=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide}));p.position.set(x,y,z);p.rotation.set(rx,ry,0);envScene.add(p)}
 panel(8,6,'#fff8e6',-4,4,3,0,.6);panel(3,8,'#ffffff',5,2,0,0,-1);panel(12,12,'#685340',0,-4,0,-Math.PI/2);panel(6,3,'#ffffff',0,6,-3,1);
 const pmrem=new THREE.PMREMGenerator(renderer);const environment=pmrem.fromScene(envScene,.025);scene.environment=environment.texture;pmrem.dispose();
 const ceramic=new THREE.MeshPhysicalMaterial({color:0xe5d6bb,roughness:.25,metalness:0,clearcoat:.7,clearcoatRoughness:.2});
 const porcelain=new THREE.MeshPhysicalMaterial({color:0xe7d9c0,roughness:.27,clearcoat:.6});
 const assembly=new THREE.Group();scene.add(assembly);const cup=new THREE.Group();assembly.add(cup);
 const points=[[0,.0],[.52,0],[.64,.05],[.7,.14],[.75,.3],[.82,.55],[.9,.85],[.99,1.17],[1.04,1.32],[1.045,1.36],[1.02,1.39],[.98,1.39],[.96,1.35],[.91,1.16],[.83,.88],[.75,.6],[.68,.35],[.62,.22],[0,.22]].map(p=>new THREE.Vector2(...p));
 const body=new THREE.Mesh(new THREE.LatheGeometry(points,96),ceramic);cup.add(body);
 const handle=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(.79,.38,0),new THREE.Vector3(1.28,.42,0),new THREE.Vector3(1.47,.8,0),new THREE.Vector3(1.32,1.13,0),new THREE.Vector3(.99,1.18,0)]),64,.115,16,false),ceramic);cup.add(handle);
 const base=new THREE.Mesh(new THREE.TorusGeometry(.55,.045,12,64),porcelain);base.rotation.x=Math.PI/2;base.position.y=.035;cup.add(base);
 // A hand-painted texture makes the coffee surface and rosetta part of the 3D model.
 const textureCanvas=document.createElement('canvas');textureCanvas.width=textureCanvas.height=1024;const c=textureCanvas.getContext('2d');
 let seed=1729;function rand(){seed=(seed*16807)%2147483647;return(seed-1)/2147483646}
 let crema=c.createRadialGradient(500,470,60,512,512,510);crema.addColorStop(0,'#c78a43');crema.addColorStop(.72,'#b97832');crema.addColorStop(.92,'#d59c51');crema.addColorStop(1,'#72370f');c.fillStyle=crema;c.fillRect(0,0,1024,1024);
 for(let i=0;i<12500;i++){let x=rand()*1024,y=rand()*1024;c.fillStyle=rand()>.5?'rgba(255,230,171,.12)':'rgba(75,35,9,.08)';c.beginPath();c.arc(x,y,rand()*2.5+.3,0,Math.PI*2);c.fill()}
 c.save();c.translate(512,525);c.rotate(-.22);
 for(let i=0;i<9;i++){const y=180-i*40,w=215-Math.pow(i/8,1.7)*165;c.fillStyle=i%2?'#fff1ce':'#f6e5bf';c.beginPath();c.moveTo(0,y+43);c.bezierCurveTo(-w*1.5,y-15,-w,y-88,-20,y-21);c.bezierCurveTo(-36,y+8,-50,y+20,0,y+43);c.fill();c.beginPath();c.moveTo(0,y+43);c.bezierCurveTo(w*1.5,y-15,w,y-88,20,y-21);c.bezierCurveTo(36,y+8,50,y+20,0,y+43);c.fill()}
 c.fillStyle='#fff4d8';c.beginPath();c.moveTo(0,255);c.quadraticCurveTo(-13,-10,0,-285);c.quadraticCurveTo(14,-10,0,255);c.fill();c.beginPath();c.moveTo(0,-236);c.bezierCurveTo(-95,-300,-50,-354,0,-306);c.bezierCurveTo(50,-354,95,-300,0,-236);c.fill();c.restore();
 const coffeeTexture=new THREE.CanvasTexture(textureCanvas);coffeeTexture.colorSpace=THREE.SRGBColorSpace;
 const coffee=new THREE.Mesh(new THREE.CircleGeometry(.958,96),new THREE.MeshPhysicalMaterial({map:coffeeTexture,roughness:.7,clearcoat:.12}));coffee.rotation.x=-Math.PI/2;coffee.position.y=1.337;cup.add(coffee);
 // Small maker's mark sits on the curved ceramic, rather than floating in screen space.
 const labelCanvas=document.createElement('canvas');labelCanvas.width=512;labelCanvas.height=256;const lc=labelCanvas.getContext('2d');lc.clearRect(0,0,512,256);lc.fillStyle='#8e4c33';lc.textAlign='center';lc.font='500 86px Georgia';lc.fillText('ember',256,123);lc.font='14px Arial';lc.fillText('COFFEE & SLOW MORNINGS',256,166);
 const labelTexture=new THREE.CanvasTexture(labelCanvas);labelTexture.colorSpace=THREE.SRGBColorSpace;
 const label=new THREE.Mesh(new THREE.CylinderGeometry(1.015,.865,.55,48,1,true,-.61,1.22),new THREE.MeshBasicMaterial({map:labelTexture,transparent:true,depthWrite:false,side:THREE.FrontSide}));label.position.y=.82;cup.add(label);
 const saucerPoints=[[0,-.12],[.6,-.12],[.8,-.11],[1.1,-.06],[1.5,.02],[1.68,.09],[1.7,.13],[1.66,.17],[1.5,.13],[1.1,.025],[.8,-.025],[.6,-.04],[0,-.04]].map(p=>new THREE.Vector2(...p));
 const saucer=new THREE.Mesh(new THREE.LatheGeometry(saucerPoints,96),porcelain);saucer.position.y=-.15;assembly.add(saucer);
 const beans=new THREE.Group();assembly.add(beans);const beanMat=new THREE.MeshStandardMaterial({color:'#56301b',roughness:.48});const seamMat=new THREE.MeshStandardMaterial({color:'#241309',roughness:.9});
 const positions=[[-1.9,1.9,.3],[1.75,2.3,-.9],[-2.1,.2,.6],[2.0,-.3,.9],[-.8,2.3,-1.0],[2.4,1.1,-1.1],[-1.7,-.8,-.3]];
 positions.forEach((p,i)=>{const b=new THREE.Group();const bean=new THREE.Mesh(new THREE.SphereGeometry(.17,20,16),beanMat);bean.scale.set(.8,1.4,.66);b.add(bean);const path=new THREE.CatmullRomCurve3([new THREE.Vector3(0,-.215,.065),new THREE.Vector3(-.035,-.09,.11),new THREE.Vector3(.025,.07,.11),new THREE.Vector3(0,.218,.045)]);b.add(new THREE.Mesh(new THREE.TubeGeometry(path,20,.012,6,false),seamMat));b.scale.setScalar(.85);b.position.set(...p);b.rotation.set(.4+i*.6,i*.9,-.5+i*.8);b.userData.origin=b.position.clone();b.userData.rotation=b.rotation.clone();beans.add(b)});
 assembly.rotation.set(.22,-.3,-.15);let pointer={x:0,y:0},smoothPointer={x:0,y:0},scroll=0,visible=true,last=0,time=0;
 addEventListener('pointermove',e=>{pointer.x=e.clientX/innerWidth-.5;pointer.y=e.clientY/innerHeight-.5},{passive:true});
 const journey=document.querySelector('.journey');const visibilityObserver=new IntersectionObserver(e=>{visible=e[0].isIntersecting},{rootMargin:'100px'});visibilityObserver.observe(journey);
 let viewH=innerHeight,viewW=innerWidth;function resize(){viewH=innerHeight;viewW=innerWidth;camera.aspect=viewW/viewH;camera.updateProjectionMatrix();renderer.setSize(viewW,viewH)}addEventListener('resize',resize);
 const clamp=THREE.MathUtils.clamp,lerp=THREE.MathUtils.lerp;function ease(a,b,t){let n=clamp((t-a)/(b-a),0,1);return n*n*(3-2*n)}
 function animate(now){requestAnimationFrame(animate);const dt=Math.min((now-last)/1000,.04);last=now;if(!visible||document.hidden)return;if(!paused)time+=dt;
 const mobile=viewW<=760;const target=clamp(-journey.getBoundingClientRect().top/viewH,0,2);scroll=paused?target:lerp(scroll,target,1-Math.exp(-dt*8));smoothPointer.x=lerp(smoothPointer.x,paused?0:pointer.x,dt*2);smoothPointer.y=lerp(smoothPointer.y,paused?0:pointer.y,dt*2);
 const first=ease(.2,.85,scroll),second=ease(1.15,1.85,scroll);
 const worldWidth=7.4*viewW/viewH; const spread=worldWidth*.235; const x=mobile?0:lerp(lerp(spread,-spread,first),spread,second);
 assembly.position.set(x,mobile?-1.62:-.28,0);const scale=mobile?Math.min(.76,viewW/500):Math.min(1.22,worldWidth*.10);assembly.scale.setScalar(scale);
 assembly.rotation.x=.28+first*.31-second*.25+smoothPointer.y*.13;assembly.rotation.y=-.28+first*.7-second*.95+smoothPointer.x*.25;assembly.rotation.z=-.16+first*.33-second*.25;
 if(!paused)assembly.position.y+=Math.sin(time*.9)*.055;
 cup.position.y=first*.44-second*.4;saucer.position.y=-.15-first*.45+second*.4;saucer.rotation.z=Math.sin(time*.5)*.02;
 beans.children.forEach((b,i)=>{b.visible=!mobile||i===2||i===3||i===6;b.position.copy(b.userData.origin);b.position.y+=Math.sin(time*.65+i)*.13;b.position.x+=(first-second)*Math.sign(b.position.x)*.18;b.rotation.x=b.userData.rotation.x+time*.09;b.rotation.z=b.userData.rotation.z+Math.sin(time*.4+i)*.15});
 if(mobile){assembly.rotation.x+=.20;assembly.position.y=lerp(-1.75,-1.98,first)+Math.sin(time*.9)*.035;assembly.scale.multiplyScalar(viewH<740?.88:1)}
 renderer.render(scene,camera);
 }
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();document.body.classList.add('no-webgl');document.querySelector('#scene-status').textContent='COFFEE, WITH A LITTLE CHARACTER'});
 requestAnimationFrame(animate);document.body.classList.add('scene-ready');
}
start3D().catch(error=>{console.warn('3D scene unavailable; showing the photographic fallback.',error);document.body.classList.add('no-webgl');document.querySelector('#scene-status').textContent='COFFEE, WITH A LITTLE CHARACTER'});




