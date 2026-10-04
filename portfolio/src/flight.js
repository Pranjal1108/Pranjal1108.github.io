import * as T from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { createAtmosphere } from './atmosphere.js';
import { createNameDisplay } from './name-display.js';
import routeData from './route.json';

export const route=routeData;
const vector=([x,y,z])=>new T.Vector3(x,z,-y);
// Additional knots keep the lens inside the real arch opening, below its keystone.
const knots=route.map((r,i)=>({phase:i,p:vector(r[0]),a:vector(r[1])}));
knots.splice(2,0,{phase:1.40,p:vector([-2,-10,39]),a:vector([0,22,39])},{phase:1.65,p:vector([0,12,39]),a:vector([25,64,43])});
const positions=new T.CatmullRomCurve3(knots.map(k=>k.p),false,'centripetal');
const targets=new T.CatmullRomCurve3(knots.map(k=>k.a),false,'centripetal');
function pathTime(phase){
 const i=Math.min(knots.length-2,Math.max(0,knots.findLastIndex(k=>phase>=k.phase)));
 return (i+T.MathUtils.clamp((phase-knots[i].phase)/(knots[i+1].phase-knots[i].phase),0,1))/(knots.length-1);
}
export async function createFlight(container,{onReady,onError,onProgress,isCancelled}){
 const renderer=new T.WebGLRenderer({antialias:false,powerPreference:'high-performance'});
 renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;
 renderer.domElement.style.opacity='0';container.appendChild(renderer.domElement);
 const scene=new T.Scene();scene.fog=new T.FogExp2('#142c48',.0018);const camera=new T.PerspectiveCamera(46,1,.25,1300);
 const compact=innerWidth<700||navigator.connection?.saveData;
 const atmosphere=createAtmosphere(renderer,camera,{compact});
 const fill=new T.HemisphereLight('#c3d9ff','#75604d',.7);
 const sun=new T.DirectionalLight('#ffdab0',3.8);
 sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
 Object.assign(sun.shadow.camera,{left:-130,right:130,top:130,bottom:-130,near:1,far:400});
 sun.shadow.bias=-.00015;sun.shadow.normalBias=.12;scene.add(fill,sun,sun.target);
 const fixtures=[];
 function spotlight(position,target,power,angle=.7){
  const lamp=new T.SpotLight('#ffca80',power,150,angle,.65,1.65);lamp.position.copy(vector(position));lamp.target.position.copy(vector(target));scene.add(lamp,lamp.target);fixtures.push({lamp,power});
 }
 spotlight([-17,-22,20],[-8,0,43],1600,.58);spotlight([17,-22,20],[8,0,43],1600,.58);
 spotlight([45,99,20],[45,118,39],1500,.7);spotlight([94,100,20],[94,118,39],1500,.7);
 const nightUniform={value:1};
 const skyMaterial=new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms:{night:nightUniform},vertexShader:'varying vec3 skyDirection;void main(){skyDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`
 varying vec3 skyDirection;uniform float night;
 void main(){float height=smoothstep(-.15,.8,normalize(skyDirection).y);
 vec3 day=mix(vec3(.60,.48,.43),vec3(.20,.25,.36),height);
 vec3 dark=mix(vec3(.028,.052,.084),vec3(.005,.013,.03),height);
 gl_FragColor=vec4(mix(day,dark,night),1.);}`});
 const sky=new T.Mesh(new T.SphereGeometry(1100,32,16),skyMaterial);scene.add(sky);
 // The photograph is a fixed, distant set piece. Its UVs and transform never
 // depend on the camera or scroll; all apparent movement is real perspective.
 const mountainMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{night:nightUniform,photo:{value:null},photoReady:{value:0}},vertexShader:'varying vec2 photoUv;void main(){photoUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`
 varying vec2 photoUv;uniform float night,photoReady;uniform sampler2D photo;
 void main(){
  vec3 image=texture2D(photo,photoUv).rgb;
  vec3 day=image*.87;float luminance=dot(image,vec3(.2126,.7152,.0722));
  vec3 dark=mix(image,vec3(luminance),.5)*vec3(.16,.29,.48)+vec3(.004,.011,.023);
  float edge=smoothstep(0.,.13,photoUv.x)*smoothstep(0.,.13,1.-photoUv.x)*smoothstep(0.,.12,1.-photoUv.y);
  gl_FragColor=vec4(mix(day,dark,night),edge*photoReady);
 }`});
 const mountains=new T.Mesh(new T.PlaneGeometry(1800,1800*2223/2800),mountainMaterial);
 mountains.name='Stationary Himalayan backdrop';mountains.position.set(0,-130,-1000);mountains.matrixAutoUpdate=false;mountains.updateMatrix();scene.add(mountains);
 const starGeometry=new T.BufferGeometry(),starCoords=[];
 let seed=78;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<700;i++){const a=random()*Math.PI*2,e=random()*.95+.05;starCoords.push(Math.cos(a)*980*Math.sqrt(1-e*e),e*980,Math.sin(a)*980*Math.sqrt(1-e*e));}
 starGeometry.setAttribute('position',new T.Float32BufferAttribute(starCoords,3));
 const starMaterial=new T.PointsMaterial({color:'#d5e6ff',size:.65,transparent:true,opacity:.65,depthWrite:false});
 const stars=new T.Points(starGeometry,starMaterial);scene.add(stars);
 let disposed=false,frame=0,current=0,target=0,enabled=true,last=0,night=1,nightTarget=1,storyHeight=1,anchors=[],environment;
 let bank=0,travel=0,previousPhase=0,sceneDirty=true,sceneReady=false,firstFrame=true,frames=0,quality=1,slowFrames=0;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),story=document.querySelector('.flight-story');
 const materials=new Set(),textures=new Set(),look=new T.Vector3(),tangentA=new T.Vector3(),tangentB=new T.Vector3(),shadowCenter=new T.Vector3(9999,0,0);
 const warm=new T.Color('#ffdbad'),cool=new T.Color('#a6caff');
 const nameDisplay=createNameDisplay(scene,{wake:()=>{sceneDirty=true;wake();},onStatus:states=>{container.dataset.nameDisplay=states.map(s=>s.name+':'+s.status).join(',');}});
 function setLighting(){
  scene.fog.color.set('#9badbb').lerp(new T.Color('#142c48'),night);nightUniform.value=night;atmosphere.setNight(night);starMaterial.opacity=night*.55;
  sun.color.copy(warm).lerp(cool,night);sun.intensity=T.MathUtils.lerp(3.1,1.25,night);
  fill.intensity=T.MathUtils.lerp(.9,.52,night);scene.environmentIntensity=T.MathUtils.lerp(.85,.46,night);
  renderer.toneMappingExposure=T.MathUtils.lerp(.95,1.,night);
  fixtures.forEach(({lamp,power})=>{lamp.intensity=power*T.MathUtils.lerp(.03,1,night);});
  materials.forEach(m=>{if(/light/i.test(m.name))m.emissiveIntensity=T.MathUtils.lerp(.25,1.05,night);});
 }
 function wake(){if(!frame&&!disposed&&!document.hidden)frame=requestAnimationFrame(draw);}
 function draw(now){
  frame=0;if(disposed||document.hidden)return;
  const interval=now-last;const dt=Math.min(interval/1000||.016,.05);last=now;
  const moving=(enabled&&!reduced.matches&&Math.abs(current-target)>.00008)||Math.abs(night-nightTarget)>.001||travel>.003||Math.abs(bank)>.0001;
  if(!sceneDirty&&!moving){atmosphere.present(now);nameDisplay.update();nameDisplay.renderOverlay(renderer);container.dataset.frames=String(++frames);if(atmosphere.active(now))wake();return;}
  if(enabled&&!reduced.matches)current+=(target-current)*(1-Math.exp(-dt*5));
  night=reduced.matches?nightTarget:night+(nightTarget-night)*(1-Math.exp(-dt*6));
  const time=pathTime(current),delta=current-previousPhase;previousPhase=current;
  travel+=(Math.min(1,Math.abs(delta)*90)-travel)*(1-Math.exp(-dt*5));
  camera.position.copy(positions.getPoint(time));
  if(!reduced.matches&&enabled){camera.position.y+=Math.sin(current*5.1)*travel*.38;camera.position.x+=Math.sin(current*3.2)*travel*.22;}
  targets.getPoint(time,look);
  if(camera.aspect<.8&&current<1)look.lerp(vector([0,0,23]),1-T.MathUtils.smoothstep(current,0,1));
  positions.getTangent(Math.max(0,time-.008),tangentA);positions.getTangent(Math.min(1,time+.008),tangentB);
  const turn=tangentA.x*tangentB.z-tangentA.z*tangentB.x;
  const desiredBank=enabled&&!reduced.matches?T.MathUtils.clamp(-turn*.25,-.045,.045)*travel:0;
  bank+=(desiredBank-bank)*(1-Math.exp(-dt*4));
  camera.up.set(0,1,0);camera.lookAt(look);camera.rotateZ(bank);
  sky.position.copy(camera.position);stars.position.copy(camera.position);
  if(shadowCenter.distanceTo(camera.position)>18){shadowCenter.copy(camera.position);sun.target.position.copy(look);sun.position.copy(look).add(new T.Vector3(-90,145,55));renderer.shadowMap.needsUpdate=true;}
  setLighting();nameDisplay.update(current,night);renderer.info.reset();renderer.info.autoReset=false;atmosphere.render(scene,now);nameDisplay.renderOverlay(renderer);sceneDirty=false;
  container.dataset.frames=String(++frames);
  if(sceneReady&&firstFrame){firstFrame=false;onProgress?.(100);onReady();}
  if(moving&&interval>28&&interval<180)slowFrames++;else slowFrames=Math.max(0,slowFrames-1);
  if(slowFrames>30&&quality>.7){quality=.7;slowFrames=0;resize();}
  container.dataset.progress=(current/(route.length-1)).toFixed(3);container.dataset.night=night.toFixed(3);container.dataset.bank=bank.toFixed(4);
  container.dataset.drawCalls=String(renderer.info.render.calls);container.dataset.triangles=String(renderer.info.render.triangles);
  if((enabled&&!reduced.matches&&Math.abs(current-target)>.00008)||Math.abs(night-nightTarget)>.001||travel>.003||Math.abs(bank)>.0001||atmosphere.active(now))wake();
 }
 function scroll(){
  const pageProgress=T.MathUtils.clamp(scrollY/Math.max(1,storyHeight-innerHeight),0,1);
  let index=0;while(index<anchors.length-2&&scrollY>=anchors[index+1])index++;
  const local=T.MathUtils.clamp((scrollY-anchors[index])/Math.max(1,anchors[index+1]-anchors[index]),0,1);
  const travelPhase=T.MathUtils.smoothstep(local,.25,1);
  target=T.MathUtils.clamp(index+travelPhase,0,route.length-1);
  for(const section of story.children){
   const top=section.offsetTop-scrollY,bottom=top+section.offsetHeight;
   const incoming=1-T.MathUtils.smoothstep(top,innerHeight*.12,innerHeight*.72);
   const outgoing=T.MathUtils.smoothstep(bottom,innerHeight*.42,innerHeight*.95);
   section.style.setProperty('--copy-opacity',Math.min(incoming,outgoing).toFixed(3));
  }
  document.documentElement.style.setProperty('--flight',pageProgress);
  const opening=T.MathUtils.clamp(scrollY/Math.max(1,innerHeight*1.05),0,1);
  const radius=innerHeight*(innerWidth<600?.21:.32)+Math.hypot(innerWidth,innerHeight)*Math.pow(opening,1.8);
  document.documentElement.style.setProperty('--aperture-radius',radius+'px');
  document.documentElement.style.setProperty('--aperture-opacity',1-T.MathUtils.smoothstep(opening,.75,1));
  document.documentElement.style.setProperty('--nav-opacity',1);
  document.documentElement.style.setProperty('--nav-events','auto');
  const chapter=document.querySelectorAll('.flight-chapter')[index];
  document.documentElement.style.setProperty('--shade-angle',chapter?.dataset.side==='right'?'270deg':'90deg');sceneDirty=true;wake();
 }
 function resize(){
  const w=container.clientWidth,h=container.clientHeight;
  const ratio=Math.min(devicePixelRatio,1.5,Math.sqrt((compact?650000:1500000)/(w*h)))*quality;
  renderer.setPixelRatio(ratio);renderer.setSize(w,h,false);atmosphere.resize(Math.floor(w*ratio),Math.floor(h*ratio));
  container.dataset.renderPixels=String(Math.floor(w*ratio)*Math.floor(h*ratio));container.dataset.quality=String(quality);
  camera.aspect=w/h;camera.fov=w<700?62:46;camera.updateProjectionMatrix();storyHeight=story.offsetHeight;
  anchors=[...document.querySelectorAll('.flight-chapter')].map(e=>e.offsetTop);anchors.push(Math.max(anchors.at(-1)+1,storyHeight-innerHeight));scroll();
 }
 const visibility=()=>{last=0;if(document.hidden){cancelAnimationFrame(frame);frame=0;atmosphere.clearRipples();}else{sceneDirty=true;wake();}};
 const contextLost=e=>{e.preventDefault();renderer.domElement.style.opacity='0';onError();};
 function dispose(){
  if(disposed)return;disposed=true;cancelAnimationFrame(frame);
  window.removeEventListener('scroll',scroll);window.removeEventListener('resize',resize);reduced.removeEventListener('change',resize);document.removeEventListener('visibilitychange',visibility);
  renderer.domElement.removeEventListener('webglcontextlost',contextLost);
  nameDisplay.dispose();scene.traverse(o=>{o.geometry?.dispose();});materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());
  skyMaterial.dispose();mountainMaterial.dispose();starMaterial.dispose();environment?.dispose();sun.shadow.dispose();atmosphere.dispose();renderer.dispose();renderer.domElement.remove();
 }
 window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('resize',resize);reduced.addEventListener('change',resize);document.addEventListener('visibilitychange',visibility);
 renderer.domElement.addEventListener('webglcontextlost',contextLost);resize();
 try{
  let completed=0;const task=promise=>promise.then(value=>{onProgress?.(15+(++completed/6)*60);return value;});
  const loader=new T.TextureLoader();
  const [maps,gltf,hdr,photo]=await Promise.all([
   Promise.all(['concrete-color','concrete-normal','concrete-roughness'].map(async name=>{
    const map=await task(loader.loadAsync('/assets/materials/'+name+'.webp'));textures.add(map);map.wrapS=map.wrapT=T.RepeatWrapping;
    map.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());if(name.endsWith('color'))map.colorSpace=T.SRGBColorSpace;return map;
   })),task(new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync('/assets/north-india.glb')),task(new HDRLoader().loadAsync('/assets/sunset.hdr')),task(loader.loadAsync('/assets/himalayas.webp'))]);
  textures.add(hdr);textures.add(photo);photo.colorSpace=T.SRGBColorSpace;
  if(isCancelled()){gltf.scene.traverse(o=>{o.geometry?.dispose();if(o.isMesh)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());});dispose();return {dispose,setMotion(){},setTheme(){}};}
  onProgress?.(80);
  const pmrem=new T.PMREMGenerator(renderer);environment=pmrem.fromEquirectangular(hdr);scene.environment=environment.texture;pmrem.dispose();
  mountainMaterial.uniforms.photo.value=photo;mountainMaterial.uniforms.photoReady.value=1;
  // Geometry, planar UVs, and material batches are prepared offline.
  gltf.scene.traverse(o=>{
   if(!o.isMesh)return;o.castShadow=o.receiveShadow=true;
   for(const m of Array.isArray(o.material)?o.material:[o.material]){
    materials.add(m);
    if(m.name==='Campus limestone'||m.name==='Delhi sandstone'){
     m.color.set(m.name==='Delhi sandstone'?'#c7a079':'#e7ddc6');m.map=maps[0];m.normalMap=maps[1];m.roughnessMap=maps[2];m.normalScale.set(.8,.8);m.roughness=.9;
    }
    if(/metal|bronze/i.test(m.name)){m.metalness=.85;m.roughness=.38;}
    if(m.name==='Architectural blue glass'){m.color.set('#7399b0');m.metalness=.7;m.roughness=.22;}
   }
  });
  scene.add(gltf.scene);renderer.shadowMap.needsUpdate=true;
  hdr.dispose();textures.delete(hdr);
  onProgress?.(88);await nameDisplay.ready;
  if(isCancelled()){dispose();return {dispose,setMotion(){},setTheme(){}};}
  await renderer.compileAsync(scene,camera);onProgress?.(96);
  sceneReady=true;sceneDirty=true;
  renderer.domElement.style.opacity='1';container.dataset.loaded='true';container.dataset.materials='Poliigon concrete 7856 / HDR sunset / Himalayan photograph';wake();
 }catch(e){dispose();onError();throw e;}
 return {dispose,ripple(x,y,strength){if(!enabled||reduced.matches||document.hidden||!sceneReady)return;atmosphere.ripple(x,y,strength,performance.now());wake();},setMotion(value){enabled=value;if(!value)atmosphere.clearRipples();sceneDirty=true;wake();},setTheme(value){nightTarget=value==='night'?1:0;sceneDirty=true;wake();}};
}
