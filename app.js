const $ = (s) => document.querySelector(s);
const clamp = (v, a=0, b=1) => Math.max(a, Math.min(b,v));
const ease = (v) => {v=clamp(v);return v*v*(3-2*v)};
const mix = (a,b,t) => a+(b-a)*t;
const cubic = (a,b,c,d,t) => (1-t)**3*a+3*(1-t)**2*t*b+3*(1-t)*t*t*c+t**3*d;
const story=$('#story'), stage=$('#stage'),world=$('#world');
const guide=$('#guide'),jar=$('#jar'), openingFull=$('#opening-full'),closingFull=$('#closing-full');
const sceneEls=[...document.querySelectorAll('.scene')], backdropEls=[...document.querySelectorAll('.backdrop')];
const media=matchMedia('(prefers-reduced-motion: reduce)');
let reduced=media.matches;
try{const saved=localStorage.getItem('nectara-motion');if(saved!==null)reduced=saved==='reduced'}catch{}
let mobile=false,W=1280,H=728,scale=1,range=1,current=0,target=0,raf=0,lastTime=0,clock=0,ready=false,needsMeasure=true;
let menuTravel=null;
let historyTime=0;const historyRenderers=[];
let lastRaw=NaN,glJar=null,lastJarAngle=NaN,hidden=document.hidden,restoreProgress=null;
const state={ready:false,webgl:false,progress:0,scene:0,reducedMotion:reduced,frames:0};
const cache=new WeakMap();
function style(el,key,value){let memo=cache.get(el);if(!memo){memo={};cache.set(el,memo)}if(memo[key]!==value){el.style[key]=value;memo[key]=value}}
function opacity(el,v){style(el,'opacity',clamp(v).toFixed(4));style(el,'visibility',v>.001?'visible':'hidden')}
function place(el,x,y,size,angle=0,base=193){style(el,'transform',`translate3d(${x.toFixed(3)}px,${y.toFixed(3)}px,0) translate(-50%,-50%) rotate(${angle.toFixed(3)}deg) scale(${(size/base).toFixed(5)})`)}
const ambients=Array.from({length:3},(_,i)=>{const e=document.createElement('div');e.className='bee sprite ambient-bee';e.innerHTML='<div class="bee-wings"></div>';e.firstChild.style.animationDelay=`-${i*.07}s`;$('#ambient').append(e);return e});
const butterflies=Array.from({length:6},(_,i)=>{const e=document.createElement('div');e.className='butterfly sprite';e.innerHTML='<img src="./assets/butterfly.webp" alt="" width="220" height="200">';e.firstChild.style.animationDelay=`-${i*.13}s`;e.firstChild.style.animationDuration=`${.44+i*.037}s`;$('#butterflies').append(e);return e});

// The same direct scroll timeline on desktop and mobile.
function storyTime(u){return u}
function physicalTime(s){return s}
function flightRoute(id,home,s,t){
 const margin=Math.max(0,(stage.clientWidth/scale-W)/2)+180;
 const edge={x:id%2?W+margin:-margin,y:H*(.2+(id%4)*.18)};
 if(s<.18)return home;
 if(s<.245){const delay=(id%4)*.002,q=ease((s-.18-delay)/(.065-delay));return {x:mix(home.x,edge.x,q),y:mix(home.y,edge.y,q)+Math.sin(q*Math.PI)*(id%2?24:-30)}}
 // Stay outside during origin, both products and history; return only for the closing illustration.
 return edge;
}
function sceneProgress(s){
 if(s<.08)return .12*ease(s/.08);
 if(s<.24)return .12+.88*ease((s-.08)/.16);
 if(s<.37)return 1;
 if(s<.40)return 1+ease((s-.37)/.03);
 if(s<.56)return 2;
 if(s<.62)return 2+ease((s-.56)/.06);
 if(s<.74)return 3;
 if(s<.84)return 3+ease((s-.74)/.10);
 if(s<.88)return 4;
 return 4+ease((s-.88)/.075);
}
function artGeometry(){return mobile?{x:38.5,y:0,h:420,w:313,scale:420/577}:{x:457.5,y:34,h:490,w:365,scale:490/577}}
function closingGeometry(){return mobile?{x:105,y:8,h:242,w:180.35,scale:242/577}:{x:220,y:90,h:402,w:299.58,scale:402/577}}
function guidePath(p){
 const g=artGeometry(),start=[g.x+224*g.scale,g.y+264*g.scale];
 let x,y,size,angle,q;
 if(mobile){
  if(p<1){q=ease(p);x=cubic(start[0],170,260,305,q);y=cubic(start[1],290,205,65,q);size=mix(165,80,q);angle=-3*q-5*Math.sin(q*Math.PI)}
  else if(p<2){q=ease(p-1);x=cubic(305,330,320,310,q);y=cubic(65,110,300,220,q);size=mix(80,78,q);angle=-3-5*Math.sin(q*Math.PI)}
  else{q=ease(clamp(p-2));x=cubic(310,270,290,310,q);y=cubic(220,300,200,55,q);size=mix(78,80,q);angle=-3+6*Math.sin(q*Math.PI)}
 }else{
  if(p<1){q=ease(p);x=cubic(start[0],480,340,360,q);y=cubic(start[1],354,265,132,q);size=mix(193,102,q);angle=-6*Math.sin(q*Math.PI)-3*q}
  else if(p<2){q=ease(p-1);x=cubic(360,410,520,570,q);y=cubic(132,162,262,215,q);size=mix(102,115,q);angle=-3-5*Math.sin(q*Math.PI)}
  else{q=ease(clamp(p-2));x=cubic(570,460,330,350,q);y=cubic(215,346,252,132,q);size=mix(115,102,q);angle=-3+6*Math.sin(q*Math.PI)}
 }
 return {x,y,size,angle};
}
function measure(){
 mobile=innerWidth<=760;W=mobile?390:1280;H=mobile?720:728;
 const rect=stage.getBoundingClientRect();
 scale=Math.min(rect.width/W,rect.height/H);
 world.style.setProperty('--scale',scale.toFixed(6));
 range=Math.max(1,story.offsetHeight-rect.height-parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header')));
 if(restoreProgress!==null){target=physicalTime(restoreProgress);current=target;restoreProgress=null;window.scrollTo({top:target*range,behavior:'instant'})}else target=clamp(scrollY/range);
 if(!ready)current=target;
 needsMeasure=false;
}
function renderScene(u,t){
 const s=clamp(storyTime(u));
 opacity($('.origin-copy'),1-ease((s-.30)/.045));

 const p=sceneProgress(s),g=s>.88?closingGeometry():artGeometry(),take=ease((s-.005)/.035),land=ease((s-.978)/.014),returning=ease((s-.89)/.085);
 const finished=s>=.993;
 document.body.classList.toggle('is-finished',finished);
 for(let i=0;i<6;i++){
  const delta=i-p,visible=Math.abs(delta)<1.06;
  style(sceneEls[i],'transform',`translate3d(0,${(delta*H).toFixed(3)}px,0)`);
  style(sceneEls[i],'visibility',visible?'visible':'hidden');
  const inactive=Math.abs(delta)>.64;
  if(sceneEls[i].getAttribute('aria-hidden')!==String(inactive)){sceneEls[i].setAttribute('aria-hidden',String(inactive));sceneEls[i].inert=inactive}
  style(backdropEls[i],'transform',`translate3d(0,${(i===2&&p>=2&&p<=3?0:delta*100).toFixed(4)}%,0)`);
 }
 opacity(openingFull,reduced?1:1-take);
 opacity(closingFull,reduced?1:land);

 // The full wrap turns through 360°, with a long, slowly scrolling product beat.
 const jp=p<=2?p:p<=3?2:p-1;
 const jr=clamp(jp-1),jc=clamp(jp-2),leave=Math.max(0,jp-3);
 let jx,jy,jh;
 if(jp<=2){jx=mix(mobile?375:970,mobile?195:348,ease(jr));jy=mix(mobile?780:730,mobile?510:390,ease(jr));jh=mobile?270:520}
 else{jx=mix(mobile?195:348,mobile?195:935,ease(jc));jy=mix(mobile?510:390,mobile?520:398,ease(jc))-leave*H;jh=mix(mobile?270:520,mobile?270:520,ease(jc))}
 const cross=ease((s-.56)/.06);
 if(p>=2){
  if(mobile){jx=mix(195,240,cross);jy=510-18*Math.sin(cross*Math.PI)-leave*H;}
  else{jx=mix(348,935,cross);jy=mix(390,398,cross)-36*Math.sin(cross*Math.PI)-leave*H;}
 }
 opacity($('.product:not(.raw-product) .product-copy'),1-ease(cross/.45));
 opacity($('.raw-product .product-copy'),ease((cross-.55)/.45));
 const jarVisible=ease((s-.415)/.025)*(jp<3.95?1:0)*(1-ease((p-3.25)/.45));
 opacity(jar,jarVisible);
 opacity($('.history-products'),ease((p-3.65)/.3));
 place(jar,jx,jy,jh,reduced?0:Math.sin(p*1.4)*2.5,520);
 const raw=cross;
 let degrees=s<.56?360*ease((s-.44)/.115):s<.62?360:360+360*ease((s-.625)/.11);
 if(reduced)degrees=0;
 if(glJar&&jarVisible>.001&&(!Number.isFinite(lastJarAngle)||Math.abs(degrees-lastJarAngle)>.008||raw!==lastRaw)){glJar.draw(degrees,raw);lastJarAngle=degrees;lastRaw=raw}
 style($('#jar-fallback'),'filter',`brightness(${1-raw*.25}) saturate(${1+raw*.2})`);
 if(p>3.65&&p<5){
  const autoAngle=reduced?0:(historyTime*11.25)%360;
  historyRenderers.forEach((renderer,i)=>renderer?.draw(i?-autoAngle:autoAngle,i));
  state.historyAngle=autoAngle;
 }
 state.raw=raw;
 state.jarDegrees=degrees;

 const home=guidePath(Math.min(jp,3));
 let flight=flightRoute(0,home,s,t),guideSize=home.size,guideAngle=home.angle;
 if(s>.88){
  const edge=flightRoute(0,home,.88,t),q=returning;
  flight={x:cubic(edge.x,edge.x+150,g.x+120*g.scale,g.x+224*g.scale,q),y:cubic(edge.y,edge.y-50,g.y+330*g.scale,g.y+264*g.scale,q)};
  guideSize=mix(mobile?78:102,227*g.scale,q);guideAngle=-5*Math.sin(q*Math.PI);
 }else if(s>=.245){guideSize=mobile?78:102;guideAngle=Math.sin(t*.7)*3;}
 place(guide,flight.x,flight.y,guideSize,guideAngle);
 opacity(guide,reduced?0:take*(1-land));
 const clean=s>=.245&&s<=.88?0:1;
 const ambientSizes=mobile?[26,30,22]:[37,45,28];
 for(let j=0;j<3;j++){
  const speed=[22,-17,13][j]*(mobile?.5:1);
  const initial={x:((180+j*(W*.32)+t*speed)%(W+360)+W+360)%(W+360)-180,y:H*[.28,.81,.60][j]+Math.sin(t*.7+j*2)*18};
  let pos=flightRoute(j+1,initial,s,t);
  if(s>.88){const dest=mobile?[[40,150],[350,190],[350,300]][j]:[[130,170],[570,150],[570,600]][j];pos={x:mix(pos.x,dest[0],returning),y:mix(pos.y,dest[1],returning)+Math.sin(returning*Math.PI)*35};}
  place(ambients[j],pos.x,pos.y,mix(ambientSizes[j],mobile?19:25,returning),Math.sin(t+j)*3);
  opacity(ambients[j],reduced?0:1);
 }
 const slots=[[112,87,44],[62,121,36],[98,151,27],[347,48,39],[33,230,29],[42,281,27]];
 for(let j=0;j<6;j++){
  const [lx,ly,bsize]=slots[j],slot={x:g.x+lx*g.scale,y:g.y+ly*g.scale};
  const q=ease((s-.012-j*.002)/.15);
  const initial={x:mix(slot.x,home.x+(j%2?90:-90)*(mobile?.6:1)+Math.sin(t*1.4+j)*22,q),y:mix(slot.y,home.y+(j%2?75:-70)*(mobile?.6:1)+Math.sin(t+j)*18,q)};
  let pos=flightRoute(j+4,initial,s,t),size=mix(bsize*g.scale,(j<2?38:29)*(mobile?.75:1),q),angle=Math.sin(t*1.3+j)*14;
  if(s>.88){const r=ease((s-.891-j*.0025)/(.083-j*.001)),edge=flightRoute(j+4,initial,.88,t);pos={x:cubic(edge.x,edge.x+(j%2?-80:80),slot.x+(j%2?60:-60),slot.x,r),y:cubic(edge.y,edge.y+70,slot.y+65,slot.y,r)};size=mix(size,bsize*g.scale,r);angle*=1-r;}
  place(butterflies[j],pos.x,pos.y,size,angle,40);opacity(butterflies[j],reduced?0:(s>.88?1-land:take));
 }
 // Zoom about the exact marked location; the green point becomes the next backdrop.
 const map=$('#map-journey'),z=ease((s-.30)/.085),mz=Math.exp(z*Math.log(mobile?45:65));
 const mx=mobile?170:900,my=mobile?570:H/2-(519/2-203)*520/628;
 const cx=mx,cy=my+Math.max(0,1-p)*H;
 const mw=mobile?240:520,mh=mw*519/628;
 style(map,'width',`${W}px`);style(map,'height',`${H}px`);
 $('#map-vector').setAttribute('viewBox',`0 0 ${W} ${H}`);
 $('#map-drawing').setAttribute('transform',`translate(${cx} ${cy}) scale(${mw/628*mz}) translate(-251 -203)`);
 map.style.setProperty('--map-detail',(1-ease(z/.25)).toFixed(4));
 const mapAlpha=s<.40?1:1-ease((s-.40)/.015);
 // Dissolve the pale map before its SVG viewport edges can become visible.
 opacity(map,mapAlpha*(1-ease((z-.08)/.34)));
 opacity($('#map-wash'),mapAlpha*ease((z-.25)/.65));

 const dot=$('#map-dot'),diameter=mw*.083*mz;
 style(dot,'width',`${diameter}px`);style(dot,'height',`${diameter}px`);
 style(dot,'transform',`translate3d(${cx-diameter/2}px,${cy-diameter/2}px,0)`);opacity(dot,mapAlpha);
 state.mapZoom=mz;state.cleanTransition=clean<.001;
 const track=document.querySelector('.progress-track');
 style($('#progress-thumb'),'transform',`translate3d(0,${(s*Math.max(0,track.clientHeight-44)).toFixed(3)}px,0)`);
 state.progress=u;state.storyProgress=s;state.scene=p;state.frames++;
}
function tick(now){
 raf=0;if(hidden)return;
 if(needsMeasure)measure();
 const dt=lastTime?Math.min((now-lastTime)/1000,.05):1/60;lastTime=now;
 if(!reduced){clock+=dt;if(state.scene>3.65&&state.scene<5)historyTime+=dt;}
 if(menuTravel){
  menuTravel.elapsed+=dt;
  if(menuTravel.mode==='fade'){
   const elapsed=menuTravel.elapsed;
   const alpha=elapsed<.6?ease(elapsed/.6):elapsed<.72?1:1-ease((elapsed-.72)/.8);
   opacity($('#menu-veil'),alpha);
   if(elapsed>=.6&&!menuTravel.arrived){
    target=menuTravel.to;current=target;
    window.scrollTo({top:target*range,behavior:'instant'});
    menuTravel.arrived=true;
   }
   if(elapsed>=1.52){opacity($('#menu-veil'),0);menuTravel=null;}
  }
 }
 state.navigating=!!menuTravel;
 const diff=target-current;
 current=Math.abs(diff)<.00002?target:mix(current,target,1-Math.exp(-dt/.065));
 renderScene(current,clock);
 if(menuTravel||Math.abs(target-current)>.00002||(!reduced&&current<.993))requestTick();
}
function requestTick(){if(!raf&&!hidden)raf=requestAnimationFrame(tick)}
const links={inicio:0,origen:.275,miel:.44,cruda:.68,coleccion:.86,cierre:1};
function stopMenuTravel(){if(!menuTravel)return;menuTravel=null;opacity($('#menu-veil'),0);target=clamp(scrollY/range);requestTick()}
function navigate(key,smooth=true){
 if(!(key in links))return;
 stopMenuTravel();measure();
 const destination=physicalTime(links[key]),from=clamp(scrollY/range),distance=Math.abs(destination-from);
 if(!smooth||reduced||distance<.0001){window.scrollTo({top:destination*range,behavior:'instant'});target=destination;current=destination;requestTick();return}
 // Swap scenes only under a fully opaque veil; never traverse intermediate sections.
 const color=key==='miel'||key==='cruda'?'var(--green)':key==='origen'?'var(--cream)':'var(--mint)';
 style($('#menu-veil'),'background',color);
 menuTravel={mode:'fade',to:destination,elapsed:0,arrived:false};
 lastTime=performance.now();requestTick();
}
for(const event of ['wheel','touchstart','pointerdown'])addEventListener(event,stopMenuTravel,{passive:true});
addEventListener('keydown',e=>{if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' ','Escape'].includes(e.key))stopMenuTravel()});
document.querySelectorAll('[data-go]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();const key=a.dataset.go;history.replaceState(null,'',`#${key}`);navigate(key)}));
addEventListener('scroll',()=>{if(!menuTravel)target=clamp(scrollY/range);requestTick()},{passive:true});
addEventListener('resize',()=>{stopMenuTravel();if(ready)restoreProgress=storyTime(current);needsMeasure=true;requestTick()},{passive:true});
new ResizeObserver(()=>{needsMeasure=true;requestTick()}).observe(stage);
document.addEventListener('visibilitychange',()=>{hidden=document.hidden;lastTime=0;if(hidden&&raf){cancelAnimationFrame(raf);raf=0}else requestTick()});
addEventListener('popstate',()=>navigate(location.hash.slice(1),false));
function setMotion(value,persist=false){
 if(value)stopMenuTravel();
 reduced=value;document.body.classList.toggle('reduced-motion',value);
 $('#motion-toggle').setAttribute('aria-pressed',String(value));$('#motion-toggle').textContent=value?'Activar movimiento':'Reducir movimiento';
 state.reducedMotion=value;
 if(persist){try{localStorage.setItem('nectara-motion',value?'reduced':'full')}catch{}}
 lastJarAngle=NaN;requestTick();
}
$('#motion-toggle').addEventListener('click',()=>setMotion(!reduced,true));
media.addEventListener('change',e=>setMotion(e.matches));
setMotion(reduced);
const dialog=$('#label-dialog');
document.querySelectorAll('[data-label-open]').forEach(btn=>btn.addEventListener('click',()=>dialog.showModal()));
dialog.querySelector('.close-dialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});

const cartCatalog={cream:{name:'Miel cremada',price:'7,45 € – 10,45 €'},raw:{name:'Miel cruda',price:'6,95 € – 9,95 €'}};
let cart={cream:0,raw:0};
try{const saved=JSON.parse(localStorage.getItem('nectara-cart')||'{}');for(const key of Object.keys(cart))if(Number.isInteger(saved[key]))cart[key]=clamp(saved[key],0,99)}catch{}
function renderCart(){
 $('#cart-count').textContent=cart.cream+cart.raw;
 $('#cart-items').replaceChildren();
 for(const [key,product] of Object.entries(cartCatalog)){
  if(!cart[key])continue;
  const row=document.createElement('div');row.className='cart-row';
  const title=document.createElement('h3');title.textContent=product.name;
  const price=document.createElement('p');price.textContent=product.price+' · IVA incluido';
  const controls=document.createElement('div');controls.className='cart-quantity';
  for(const delta of [-1,1]){const button=document.createElement('button');button.type='button';button.textContent=delta<0?'−':'+';button.setAttribute('aria-label',(delta<0?'Quitar una unidad de ':'Añadir una unidad de ')+product.name);button.disabled=delta>0&&cart[key]>=99;button.addEventListener('click',()=>{cart[key]=clamp(cart[key]+delta,0,99);saveCart()});controls.append(button);if(delta<0){const count=document.createElement('span');count.textContent=cart[key];controls.append(count)}}
  row.append(title,price,controls);$('#cart-items').append(row);
 }
 if(!cart.cream&&!cart.raw){const empty=document.createElement('p');empty.textContent='Tu carrito está vacío.';$('#cart-items').append(empty)}
}
function saveCart(){try{localStorage.setItem('nectara-cart',JSON.stringify(cart))}catch{}renderCart()}
const cartDialog=$('#cart-dialog');
document.querySelectorAll('[data-add-cart]').forEach(button=>button.addEventListener('click',()=>{const key=button.dataset.addCart;cart[key]=Math.min(99,cart[key]+1);saveCart();$('#cart-status').textContent=cartCatalog[key].name+' añadida al carrito';cartDialog.showModal()}));
$('#cart-open').addEventListener('click',()=>{renderCart();cartDialog.showModal()});
for(const id of ['cart-close','cart-continue'])$('#'+id).addEventListener('click',()=>cartDialog.close());
renderCart();

const mobileMenu=$('#mobile-menu'),menuOpen=$('#mobile-menu-open');
function closeMobileMenu(){mobileMenu.close();document.body.classList.remove('menu-open');menuOpen.setAttribute('aria-expanded','false')}
menuOpen.addEventListener('click',()=>{stopMenuTravel();mobileMenu.showModal();document.body.classList.add('menu-open');menuOpen.setAttribute('aria-expanded','true');$('#mobile-menu-close').focus()});
$('#mobile-menu-close').addEventListener('click',closeMobileMenu);
mobileMenu.addEventListener('close',()=>{document.body.classList.remove('menu-open');menuOpen.setAttribute('aria-expanded','false')});
mobileMenu.querySelectorAll('[data-go]').forEach(link=>link.addEventListener('click',closeMobileMenu));
$('#mobile-menu-cart').addEventListener('click',()=>{closeMobileMenu();renderCart();cartDialog.showModal()});
addEventListener('resize',()=>{if(innerWidth>760&&mobileMenu.open)closeMobileMenu()},{passive:true});

function loadImage(path){return new Promise((resolve,reject)=>{const im=new Image();im.decoding='async';im.onload=()=>im.decode().catch(()=>{}).then(()=>resolve(im));im.onerror=()=>reject(new Error(`Asset unavailable: ${path}`));im.src=new URL(path,import.meta.url).href})}
async function initJar(){
 const canvas=$('#jar-canvas');
 const images=await Promise.all(['./assets/jar-blank.webp','./assets/label.webp','./assets/jar-seal.webp'].map(loadImage));
 const sealCanvas=document.createElement('canvas');sealCanvas.width=100;sealCanvas.height=650;
 const ctx=sealCanvas.getContext('2d');ctx.fillStyle='#cda640';ctx.fillRect(0,0,100,650);ctx.translate(50,30);ctx.rotate(Math.PI/2);ctx.fillStyle='#302719';ctx.font='34px Arial';ctx.fillText('MIEL CRUDA · MILFLORES',0,12);images.push(sealCanvas);
 function setup(renderCanvas=canvas){
  const gl=renderCanvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false,depth:false,stencil:false,powerPreference:'low-power'});
  if(!gl)return null;
  const vertex=`attribute vec2 a_position;varying vec2 v_uv;void main(){v_uv=(a_position*vec2(1.0,-1.0)+1.0)*.5;gl_Position=vec4(a_position,0.0,1.0);}`;
  const fragment=`precision highp float;varying vec2 v_uv;uniform sampler2D u_base;uniform sampler2D u_label;uniform sampler2D u_seal;uniform float u_angle;uniform float u_raw;uniform sampler2D u_rawseal;const float PI=3.141592653589793;void main(){vec4 b=texture2D(u_base,v_uv);float nx=clamp((v_uv.x-.5)/.499,-.99999,.99999);float theta=asin(nx);float curve=sqrt(1.0-nx*nx);float top=.315+.035*curve;float bottom=.855+.056*curve;float v=clamp((v_uv.y-top)/(bottom-top),0.0,1.0);float u=fract(.5+theta/(2.0*PI)+u_angle/(2.0*PI));vec3 ink=texture2D(u_label,vec2(u,v)).rgb;vec3 printed=clamp(ink/vec3(.91372549,.95294118,.91764706),0.0,1.1)*b.rgb;float coverage=clamp((v_uv.y-top)*1198.0,0.0,1.0)*clamp((bottom-v_uv.y)*1198.0,0.0,1.0)*b.a*clamp((1.0-abs(nx))*348.5,0.0,1.0);float honey=step(.16,v_uv.y)*(1.0-coverage);vec3 amber=b.rgb*vec3(.72,.46,.23);vec3 color=mix(mix(b.rgb,amber,u_raw*honey),printed,coverage);float front=mod(theta+u_angle+PI,2.0*PI)-PI;if(abs(front)<.155&&v_uv.y>=.043&&v_uv.y<=top&&b.a>.4){float sv=clamp((v_uv.y-.043)/(top-.043),0.0,1.0);vec3 seal=texture2D(u_seal,vec2((front+.155)/.31,sv)).rgb;seal=mix(seal,texture2D(u_rawseal,vec2((front+.155)/.31,sv)).rgb,u_raw);color=seal*(.72+.28*curve);}gl_FragColor=vec4(color*b.a,b.a);}`;
  function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s}
  const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));gl.useProgram(program);
  const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const pos=gl.getAttribLocation(program,'a_position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
  images.forEach((im,i)=>{const tex=gl.createTexture();gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,tex);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,im);gl.uniform1i(gl.getUniformLocation(program,['u_base','u_label','u_seal','u_rawseal'][i]),i)});
  const angle=gl.getUniformLocation(program,'u_angle'),raw=gl.getUniformLocation(program,'u_raw');
  const dpr=Math.min(devicePixelRatio||1,2);renderCanvas.width=Math.round(360*dpr);renderCanvas.height=Math.round(620*dpr);gl.viewport(0,0,renderCanvas.width,renderCanvas.height);
  return {draw(deg,r=0){gl.uniform1f(raw,r);gl.uniform1f(angle,deg*Math.PI/180);gl.drawArrays(gl.TRIANGLES,0,6)}};
 }
 glJar=setup();if(glJar){
  for(const [i,id] of ['history-cream','history-raw'].entries()){
   const preview=$('#'+id),renderer=setup(preview);historyRenderers[i]=renderer;
   if(renderer){renderer.draw(0,i);preview.parentElement.classList.add('has-preview');}
   preview.addEventListener('webglcontextlost',e=>{e.preventDefault();historyRenderers[i]=null;preview.parentElement.classList.remove('has-preview')});
   preview.addEventListener('webglcontextrestored',()=>{try{historyRenderers[i]=setup(preview);if(historyRenderers[i])preview.parentElement.classList.add('has-preview');requestTick()}catch{preview.parentElement.classList.remove('has-preview')}});
  }
  glJar.draw(0);lastJarAngle=NaN;jar.classList.add('ready');state.webgl=true;
 }
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();glJar=null;jar.classList.remove('ready');state.webgl=false});
 canvas.addEventListener('webglcontextrestored',()=>{try{glJar=setup();lastJarAngle=NaN;jar.classList.add('ready');state.webgl=!!glJar;requestTick()}catch{jar.classList.remove('ready')}});
}

measure();renderScene(current,0);requestTick();
const core=['./assets/botanical.webp','./assets/art-complete.webp','./assets/art-empty.webp','./assets/brand.webp','./assets/bee-wings.webp','./assets/butterfly.webp','./assets/jar-front.webp'];
let completed=0;const total=core.length+1;
let loadTarget=0,loadShown=0,loadLast=0,loadDone=false,loadClosed=false;
function loadProgress(){loadTarget=++completed/total*100}
function animateLoader(now){
 const dt=loadLast?Math.min((now-loadLast)/1000,.05):1/60;loadLast=now;
 // Follow measured resource completion continuously, with a bounded travel speed.
 const difference=loadTarget-loadShown;
 loadShown+=Math.min(difference,Math.min(48*dt,difference*(1-Math.exp(-dt/ .18))));
 if(loadDone&&loadTarget-loadShown<.05)loadShown=100;
 const percent=Math.floor(loadShown);
 $('#load-percent').textContent=percent+'%';$('#load-fill').style.transform=`scaleX(${loadShown/100})`;
 $('.loader-flight .bee').style.transform=`translate3d(${loadShown/100*$('.loader-flight').clientWidth}px,0,0) translateX(-50%)`;
 $('#load-track').setAttribute('aria-valuenow',percent);
 if(loadDone&&loadShown===100&&!loadClosed){loadClosed=true;setTimeout(()=>{document.body.classList.add('is-loaded');$('#preloader').setAttribute('aria-hidden','true')},180);return}
 requestAnimationFrame(animateLoader);
}
requestAnimationFrame(animateLoader);
Promise.allSettled([...core.map(path=>loadImage(path).finally(loadProgress)),initJar().finally(loadProgress)]).then(results=>{
 const failures=results.filter(r=>r.status==='rejected');
 if(failures.length)console.warn('Some visual assets could not be prepared.',failures.map(r=>String(r.reason)));
 ready=true;state.ready=true;document.body.classList.add('is-ready');requestTick();
 loadDone=true;
 if(location.hash.slice(1) in links)navigate(location.hash.slice(1),false);
});
// Read-only diagnostics make rendering and scroll verification reproducible.
Object.defineProperty(window,'__nectara',{value:{get state(){return {...state,range,scale,mobile}},sceneProgress,physicalTime},writable:false});
