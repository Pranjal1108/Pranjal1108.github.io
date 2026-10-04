import * as T from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
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
export async function createFlight(container,{onReady,onError,isCancelled}){
 const renderer=new T.WebGLRenderer({antialias:false,powerPreference:'high-performance'});
 renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;
 renderer.domElement.style.opacity='0';container.appendChild(renderer.domElement);
 const scene=new T.Scene();scene.fog=new T.FogExp2('#142c48',.0018);const camera=new T.PerspectiveCamera(46,1,.25,1300);
 const atmosphere=createAtmosphere(renderer,camera);
 const fill=new T.HemisphereLight('#c3d9ff','#75604d',.7);
 const sun=new T.DirectionalLight('#ffdab0',3.8);
 sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
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
 let bank=0,travel=0,previousPhase=0;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),story=document.querySelector('.flight-story');
 const materials=new Set(),textures=new Set(),look=new T.Vector3(),tangentA=new T.Vector3(),tangentB=new T.Vector3(),shadowCenter=new T.Vector3(9999,0,0);
 const warm=new T.Color('#ffdbad'),cool=new T.Color('#a6caff');
 const nameDisplay=createNameDisplay(scene,{wake,onStatus:states=>{container.dataset.nameDisplay=states.map(s=>s.name+':'+s.status).join(',');}});
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
  const dt=Math.min((now-last)/1000||.016,.05);last=now;
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
  setLighting();nameDisplay.update(current,night);renderer.info.reset();renderer.info.autoReset=false;atmosphere.render(scene);nameDisplay.renderOverlay(renderer);
  container.dataset.progress=(current/(route.length-1)).toFixed(3);container.dataset.night=night.toFixed(3);container.dataset.bank=bank.toFixed(4);
  container.dataset.drawCalls=String(renderer.info.render.calls);container.dataset.triangles=String(renderer.info.render.triangles);
  if((enabled&&!reduced.matches&&Math.abs(current-target)>.00008)||Math.abs(night-nightTarget)>.001||travel>.003||Math.abs(bank)>.0001)wake();
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
  document.documentElement.style.setProperty('--shade-angle',chapter?.dataset.side==='right'?'270deg':'90deg');wake();
 }
 function resize(){
  const w=container.clientWidth,h=container.clientHeight;
  const ratio=Math.min(devicePixelRatio,1.75,Math.sqrt((w<700?900000:2400000)/(w*h)));
  renderer.setPixelRatio(ratio);renderer.setSize(w,h,false);atmosphere.resize(Math.floor(w*ratio),Math.floor(h*ratio));
  camera.aspect=w/h;camera.fov=w<700?62:46;camera.updateProjectionMatrix();storyHeight=story.offsetHeight;
  anchors=[...document.querySelectorAll('.flight-chapter')].map(e=>e.offsetTop);anchors.push(Math.max(anchors.at(-1)+1,storyHeight-innerHeight));scroll();
 }
 const visibility=()=>{last=0;wake();};
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
  const loader=new T.TextureLoader();
  const [maps,gltf,hdr,photo]=await Promise.all([
   Promise.all(['concrete-color','concrete-normal','concrete-roughness'].map(async name=>{
    const map=await loader.loadAsync('/assets/materials/'+name+'.webp');textures.add(map);map.wrapS=map.wrapT=T.RepeatWrapping;
    map.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());if(name.endsWith('color'))map.colorSpace=T.SRGBColorSpace;return map;
   })),new GLTFLoader().loadAsync('/assets/north-india.glb'),new HDRLoader().loadAsync('/assets/sunset.hdr'),loader.loadAsync('/assets/himalayas.jpg')]);
  textures.add(hdr);textures.add(photo);photo.colorSpace=T.SRGBColorSpace;
  if(isCancelled()){gltf.scene.traverse(o=>{o.geometry?.dispose();if(o.isMesh)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());});dispose();return {dispose,setMotion(){},setTheme(){}};}
  const pmrem=new T.PMREMGenerator(renderer);environment=pmrem.fromEquirectangular(hdr);scene.environment=environment.texture;pmrem.dispose();
  mountainMaterial.uniforms.photo.value=photo;mountainMaterial.uniforms.photoReady.value=1;
  gltf.scene.updateMatrixWorld(true);const batches=new Map(),originals=new Set();
  gltf.scene.traverse(o=>{
   if(!o.isMesh)return;originals.add(o.geometry);if(/^(Manali|Distant Himalayan)/.test(o.name))return;
   const source=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();source.applyMatrix4(o.matrixWorld);
   const list=Array.isArray(o.material)?o.material:[o.material];
   const groups=Array.isArray(o.material)?source.groups:[{start:0,count:source.attributes.position.count,materialIndex:0}];
   for(const group of groups){
    const m=list[group.materialIndex];materials.add(m);
    if(m.name==='Campus limestone'||m.name==='Delhi sandstone'){
     m.color.set(m.name==='Delhi sandstone'?'#c7a079':'#e7ddc6');m.map=maps[0];m.normalMap=maps[1];m.roughnessMap=maps[2];m.normalScale.set(.8,.8);m.roughness=.9;
    }
    if(/metal|bronze/i.test(m.name)){m.metalness=.85;m.roughness=.38;}
    if(m.name==='Architectural blue glass'){m.color.set('#7399b0');m.metalness=.7;m.roughness=.22;}
    const g=new T.BufferGeometry();
    for(const attr of ['position','normal']){const a=source.attributes[attr];g.setAttribute(attr,new T.BufferAttribute(a.array.slice(group.start*a.itemSize,(group.start+group.count)*a.itemSize),a.itemSize));}
    const p=g.attributes.position,n=g.attributes.normal,uv=[],scale=m.name==='Himalayan rock'?14:2.5;
    for(let i=0;i<p.count;i++){
     const nx=Math.abs(n.getX(i)),ny=Math.abs(n.getY(i)),nz=Math.abs(n.getZ(i));
     if(ny>nx&&ny>nz)uv.push(p.getX(i)/scale,p.getZ(i)/scale);else if(nx>nz)uv.push(p.getZ(i)/scale,p.getY(i)/scale);else uv.push(p.getX(i)/scale,p.getY(i)/scale);
    }
    g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));if(!batches.has(m))batches.set(m,[]);batches.get(m).push(g);
   }source.dispose();
  });
  for(const [m,geometries] of batches){const merged=mergeGeometries(geometries,false);if(!merged)throw Error('Geometry batching failed');merged.computeBoundingSphere();const mesh=new T.Mesh(merged,m);mesh.castShadow=mesh.receiveShadow=true;scene.add(mesh);geometries.forEach(g=>g.dispose());}
  originals.forEach(g=>g.dispose());renderer.shadowMap.needsUpdate=true;
  renderer.domElement.style.opacity='1';container.dataset.loaded='true';container.dataset.materials='Poliigon concrete 7856 / HDR sunset / Himalayan photograph';onReady();wake();
 }catch(e){dispose();onError();throw e;}
 return {dispose,setMotion(value){enabled=value;wake();},setTheme(value){nightTarget=value==='night'?1:0;wake();}};
}
