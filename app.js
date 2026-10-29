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
let glJar=null,lastJarAngle=NaN,hidden=document.hidden,restoreProgress=null;
const state={ready:false,webgl:false,progress:0,scene:0,reducedMotion:reduced,frames:0};
const cache=new WeakMap();
function style(el,key,value){let memo=cache.get(el);if(!memo){memo={};cache.set(el,memo)}if(memo[key]!==value){el.style[key]=value;memo[key]=value}}
function opacity(el,v){style(el,'opacity',clamp(v).toFixed(4));style(el,'visibility',v>.001?'visible':'hidden')}
function place(el,x,y,size,angle=0,base=193){style(el,'transform',`translate3d(${x.toFixed(3)}px,${y.toFixed(3)}px,0) translate(-50%,-50%) rotate(${angle.toFixed(3)}deg) scale(${(size/base).toFixed(5)})`)}
const ambients=Array.from({length:3},(_,i)=>{const e=document.createElement('div');e.className='bee sprite ambient-bee';e.innerHTML='<div class="bee-wings"></div>';e.firstChild.style.animationDelay=`-${i*.07}s`;$('#ambient').append(e);return e});
const butterflies=Array.from({length:6},(_,i)=>{const e=document.createElement('div');e.className='butterfly sprite';e.innerHTML='<img src="./assets/butterfly.webp" alt="" width="220" height="200">';e.firstChild.style.animationDelay=`-${i*.13}s`;e.firstChild.style.animationDuration=`${.44+i*.037}s`;$('#butterflies').append(e);return e});

function sceneProgress(s){
 if(s<.08)return .12*ease(s/.08);
 if(s<.24)return .12+.88*ease((s-.08)/.16);
 if(s<.30)return 1;
 if(s<.44)return 1+.95*ease((s-.30)/.14);
 if(s<.70)return 1.95+.1*(s-.44)/.26;
 if(s<.84)return 2.05+.95*ease((s-.70)/.14);
 if(s<.88)return 3;
 return 3+ease((s-.88)/.075);
}
function artGeometry(){return mobile?{x:38.5,y:18,h:420,w:313,scale:420/577}:{x:457.5,y:69,h:490,w:365,scale:490/577}}
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
 if(restoreProgress!==null){target=restoreProgress;current=target;restoreProgress=null;window.scrollTo({top:target*range,behavior:'instant'})}else target=clamp(scrollY/range);
 if(!ready)current=target;
 needsMeasure=false;
}
function renderScene(s,t){
 const p=sceneProgress(s),g=artGeometry(),take=ease((s-.005)/.035),land=ease((s-.978)/.014),returning=ease((s-.89)/.085);
 const finished=s>=.993;
 document.body.classList.toggle('is-finished',finished);
 for(let i=0;i<5;i++){
  const delta=i-p,visible=Math.abs(delta)<1.06;
  style(sceneEls[i],'transform',`translate3d(0,${(delta*H).toFixed(3)}px,0)`);
  style(sceneEls[i],'visibility',visible?'visible':'hidden');
  const inactive=Math.abs(delta)>.64;
  if(sceneEls[i].getAttribute('aria-hidden')!==String(inactive)){sceneEls[i].setAttribute('aria-hidden',String(inactive));sceneEls[i].inert=inactive}
  style(backdropEls[i],'transform',`translate3d(0,${(delta*100).toFixed(4)}%,0)`);
 }
 opacity(openingFull,reduced?1:1-take);
 opacity(closingFull,reduced?1:land);

 // The full wrap turns through 360°, with a long, slowly scrolling product beat.
 const jr=clamp(p-1),jc=clamp(p-2),leave=Math.max(0,p-3);
 let jx,jy,jh;
 if(p<=2){jx=mix(mobile?375:970,mobile?195:348,ease(jr));jy=mix(mobile?780:730,mobile?450:390,ease(jr));jh=mobile?350:520}
 else{jx=mix(mobile?195:348,mobile?195:935,ease(jc));jy=mix(mobile?450:390,mobile?520:398,ease(jc))-leave*H;jh=mix(mobile?350:520,mobile?330:520,ease(jc))}
 const jarVisible=ease((p-1.02)/.3)*(p<3.95?1:0);
 opacity(jar,jarVisible);
 place(jar,jx,jy,jh,reduced?0:Math.sin(p*1.4)*2.5,520);
 let degrees=p<1.95?45*ease((p-1.02)/.93):p<=2.05?45+270*ease((p-1.95)/.1):315+45*ease((p-2.05)/.95);
 if(reduced)degrees=0;
 if(glJar&&jarVisible>.001&&(!Number.isFinite(lastJarAngle)||Math.abs(degrees-lastJarAngle)>.008)){glJar.draw(degrees);lastJarAngle=degrees}
 state.jarDegrees=degrees;

 let flight=guidePath(Math.min(p,3));
 const beforeClose=guidePath(3);
 if(s>.88){
  const dest=[g.x+224*g.scale,g.y+264*g.scale];
  flight={x:cubic(beforeClose.x,mobile?350:454,mobile?240:807,dest[0],returning),y:cubic(beforeClose.y,mobile?150:134,mobile?370:357,dest[1],returning),size:mix(beforeClose.size,mobile?165:193,returning),angle:-3*(1-returning)+5*Math.sin(returning*Math.PI)};
 }
 const drift=take*(1-returning);
 flight.x+=Math.sin(t*.95)*1.2*drift;flight.y+=Math.sin(t*1.2)*1.8*drift;
 place(guide,flight.x,flight.y,flight.size,flight.angle);
 opacity(guide,reduced?0:take*(1-land));

 // Small bees have the same solid rendering as the guide, never ghosted.
 const ambientSizes=mobile?[26,30,22]:[37,45,28];
 for(let j=0;j<3;j++){
  const speed=[22,-17,13][j]*(mobile?.5:1);
  let x=((180+j*(W*.32)+t*speed)%(W+180)+W+180)%(W+180)-90;
  let y=H*[.28,.81,.60][j]+Math.sin(t*.7+j*2)*(mobile?16:24);
  const dest=mobile?[[34,330],[356,340],[349,590]][j]:[[192,294],[1103,302],[1108,564]][j];
  x=mix(x,dest[0],returning);y=mix(y,dest[1],returning);
  place(ambients[j],x,y,mix(ambientSizes[j],mobile?19:25,returning),0);
  ambients[j].firstChild.style.transform=speed<0?'scaleX(-1)':'';
  opacity(ambients[j],reduced?0:1);
 }

 const slots=[[112,87,44],[62,121,36],[98,151,27],[347,48,39],[33,230,29],[42,281,27]];
 for(let j=0;j<6;j++){
  const [lx,ly,bsize]=slots[j],slot=[g.x+lx*g.scale,g.y+ly*g.scale];
  let x=slot[0],y=slot[1],size=bsize*g.scale,alpha=take,angle=0;
  if(s<.88){
   if(j<2){
    const q=ease((s-.012-j*.002)/.16),ox=(j===0?-86:95)*(mobile?.65:1),oy=(j===0?-69:64)*(mobile?.65:1);
    const wx=21*Math.sin(t*1.61+j*1.9)+10*Math.sin(t*.71+j*2.7),wy=18*Math.sin(t*1.19+j*2.5)+8*Math.sin(t*2.21+j);
    x=mix(slot[0],flight.x+ox+wx*(mobile?.55:1),q);y=mix(slot[1],flight.y+oy+wy*(mobile?.55:1),q);
    size=mix(size,(j===0?43:34)*(mobile?.70:1),q);angle=Math.sin(t*1.3+j)*18;
   }else{
    const q=ease((s-.016-(j-2)*.004)/.15),direction=j%2?-1:1;
    x+=direction*(q*W*.5+Math.sin(q*Math.PI*2+j)*q*38);y+=Math.sin(q*Math.PI)*(75+12*j)-q*90-p*H*.15;
    size*=1+.45*q;alpha*=1-ease((q-.79)/.21);angle=direction*q*24;
   }
  }else{
   const q=ease((s-.891-j*.0025)/(.083-j*.001));
   let begin;
   if(j<2){begin=[beforeClose.x+(j===0?-86:95)*(mobile?.65:1),beforeClose.y+(j===0?-69:64)*(mobile?.65:1)]}
   else{begin=[j%2?W+45:-45,H*(j<4?.35:.73)]}
   const bend=j%2?1:-1;
   x=cubic(begin[0],begin[0]+bend*(mobile?65:130),slot[0]+bend*(mobile?60:135),slot[0],q);
   y=cubic(begin[1],begin[1]+90,slot[1]+100,slot[1],q);
   x+=Math.sin(t*1.7+j)*12*Math.sin(q*Math.PI);y+=Math.sin(t*1.3+j*2)*9*Math.sin(q*Math.PI);
   alpha=1-land;angle=Math.sin(t+j)*12*(1-q);
  }
  place(butterflies[j],x,y,size,angle,40);opacity(butterflies[j],reduced?0:alpha);
 }
 const track=document.querySelector('.progress-track');
 style($('#progress-thumb'),'transform',`translate3d(0,${(s*Math.max(0,track.clientHeight-44)).toFixed(3)}px,0)`);
 state.progress=s;state.scene=p;state.frames++;
}
function tick(now){
 raf=0;if(hidden)return;
 if(needsMeasure)measure();
 const dt=lastTime?Math.min((now-lastTime)/1000,.05):1/60;lastTime=now;
 if(!reduced)clock+=dt;
 const diff=target-current;
 current=Math.abs(diff)<.00002?target:mix(current,target,1-Math.exp(-dt/.065));
 renderScene(current,clock);
 if(Math.abs(target-current)>.00002||(!reduced&&current<.993))requestTick();
}
function requestTick(){if(!raf&&!hidden)raf=requestAnimationFrame(tick)}
const links={inicio:0,origen:.275,miel:.55,coleccion:.86,cierre:1};
function navigate(key,smooth=true){if(!(key in links))return;measure();const y=links[key]*range;window.scrollTo({top:y,behavior:smooth&&!reduced?'smooth':'instant'});target=links[key];requestTick()}
document.querySelectorAll('[data-go]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();const key=a.dataset.go;history.replaceState(null,'',`#${key}`);navigate(key)}));
addEventListener('scroll',()=>{target=clamp(scrollY/range);requestTick()},{passive:true});
addEventListener('resize',()=>{if(ready)restoreProgress=current;needsMeasure=true;requestTick()},{passive:true});
new ResizeObserver(()=>{needsMeasure=true;requestTick()}).observe(stage);
document.addEventListener('visibilitychange',()=>{hidden=document.hidden;lastTime=0;if(hidden&&raf){cancelAnimationFrame(raf);raf=0}else requestTick()});
addEventListener('popstate',()=>navigate(location.hash.slice(1),false));
function setMotion(value,persist=false){
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

function loadImage(path){return new Promise((resolve,reject)=>{const im=new Image();im.decoding='async';im.onload=()=>im.decode().catch(()=>{}).then(()=>resolve(im));im.onerror=()=>reject(new Error(`Asset unavailable: ${path}`));im.src=new URL(path,import.meta.url).href})}
async function initJar(){
 const canvas=$('#jar-canvas');
 const images=await Promise.all(['./assets/jar-blank.webp','./assets/label.webp','./assets/jar-seal.webp'].map(loadImage));
 function setup(){
  const gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false,depth:false,stencil:false,powerPreference:'low-power'});
  if(!gl)return null;
  const vertex=`attribute vec2 a_position;varying vec2 v_uv;void main(){v_uv=(a_position*vec2(1.0,-1.0)+1.0)*.5;gl_Position=vec4(a_position,0.0,1.0);}`;
  const fragment=`precision highp float;varying vec2 v_uv;uniform sampler2D u_base;uniform sampler2D u_label;uniform sampler2D u_seal;uniform float u_angle;const float PI=3.141592653589793;void main(){vec4 b=texture2D(u_base,v_uv);float nx=clamp((v_uv.x-.5)/.499,-.99999,.99999);float theta=asin(nx);float curve=sqrt(1.0-nx*nx);float top=.315+.035*curve;float bottom=.855+.056*curve;float v=clamp((v_uv.y-top)/(bottom-top),0.0,1.0);float u=fract(.5+theta/(2.0*PI)+u_angle/(2.0*PI));vec3 ink=texture2D(u_label,vec2(u,v)).rgb;vec3 printed=clamp(ink/vec3(.91372549,.95294118,.91764706),0.0,1.1)*b.rgb;float coverage=clamp((v_uv.y-top)*1198.0,0.0,1.0)*clamp((bottom-v_uv.y)*1198.0,0.0,1.0)*b.a*clamp((1.0-abs(nx))*348.5,0.0,1.0);vec3 color=mix(b.rgb,printed,coverage);float front=mod(theta+u_angle+PI,2.0*PI)-PI;if(abs(front)<.155&&v_uv.y>=.043&&v_uv.y<=top&&b.a>.4){float sv=clamp((v_uv.y-.043)/(top-.043),0.0,1.0);vec3 seal=texture2D(u_seal,vec2((front+.155)/.31,sv)).rgb;color=seal*(.72+.28*curve);}gl_FragColor=vec4(color*b.a,b.a);}`;
  function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s}
  const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));gl.useProgram(program);
  const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const pos=gl.getAttribLocation(program,'a_position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
  images.forEach((im,i)=>{const tex=gl.createTexture();gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,tex);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,im);gl.uniform1i(gl.getUniformLocation(program,['u_base','u_label','u_seal'][i]),i)});
  const angle=gl.getUniformLocation(program,'u_angle');
  const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(360*dpr);canvas.height=Math.round(620*dpr);gl.viewport(0,0,canvas.width,canvas.height);
  return {draw(deg){gl.uniform1f(angle,deg*Math.PI/180);gl.drawArrays(gl.TRIANGLES,0,6)}};
 }
 glJar=setup();if(glJar){glJar.draw(0);jar.classList.add('ready');state.webgl=true}
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();glJar=null;jar.classList.remove('ready');state.webgl=false});
 canvas.addEventListener('webglcontextrestored',()=>{try{glJar=setup();lastJarAngle=NaN;jar.classList.add('ready');state.webgl=!!glJar;requestTick()}catch{jar.classList.remove('ready')}});
}

measure();renderScene(current,0);requestTick();
const core=['./assets/botanical.webp','./assets/art-complete.webp','./assets/art-empty.webp','./assets/brand.webp','./assets/bee-wings.webp','./assets/butterfly.webp'];
Promise.allSettled([...core.map(loadImage),initJar()]).then(results=>{
 const failures=results.filter(r=>r.status==='rejected');
 if(failures.length)console.warn('Some visual assets could not be prepared.',failures.map(r=>String(r.reason)));
 ready=true;state.ready=true;document.body.classList.add('is-ready');requestTick();
 if(location.hash.slice(1) in links)navigate(location.hash.slice(1),false);
});
// Read-only diagnostics make rendering and scroll verification reproducible.
Object.defineProperty(window,'__nectara',{value:{get state(){return {...state,range,scale,mobile}},sceneProgress},writable:false});
